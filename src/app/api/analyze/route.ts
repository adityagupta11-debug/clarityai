import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { analyzeInterviewTranscript, MODEL_ID, PROMPT_VERSION } from "@/lib/services/gemini";
import { calculateSpeechMetrics } from "@/lib/utils/metrics";
import { type TranscriptSegment } from "@/types/transcript";
import { type GeminiAnalysisResponse } from "@/lib/prompts/scoring-rubric";
import { type SpeechMetrics } from "@/types/analysis";

// Allow up to 5 minutes — Gemini can take ~2 min for a 30-min transcript.
// This is a Vercel-specific config; locally Next.js has no timeout.
export const maxDuration = 300;

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Coerce Firestore DocumentData to a typed shape with a runtime guard. */
function parseTranscript(
  data: FirebaseFirestore.DocumentData
): { fullText: string; segments: TranscriptSegment[] } | null {
  const fullText = data.fullText;
  const segments = data.segments;
  if (typeof fullText !== "string" || !Array.isArray(segments)) return null;
  return { fullText, segments: segments as TranscriptSegment[] };
}

/**
 * Builds the full Analysis payload for Firestore.
 * Uses FieldValue.serverTimestamp() for generatedAt so the database clock
 * is authoritative — never trust a client or LLM-supplied timestamp.
 */
function buildAnalysisDoc(
  gemini: GeminiAnalysisResponse,
  speechMetrics: SpeechMetrics
) {
  return {
    ...gemini,
    speechMetrics,
    modelUsed:     MODEL_ID,
    promptVersion: PROMPT_VERSION,
    generatedAt:   FieldValue.serverTimestamp(),
  };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── 1. Parse and validate request body ────────────────────────────────────
  let interviewId: string;
  try {
    const body = await req.json();
    if (!body?.interviewId || typeof body.interviewId !== "string") {
      return NextResponse.json(
        { error: "Request body must include { interviewId: string }" },
        { status: 400 }
      );
    }
    interviewId = body.interviewId;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const db           = getAdminDb();
  const interviewRef = db.doc(`interviews/${interviewId}`);
  const transcriptRef = db.doc(`interviews/${interviewId}/transcript/data`);
  const analysisRef  = db.doc(`interviews/${interviewId}/analysis/results`);

  // ── 2. Fetch transcript — 404 if not written yet ──────────────────────────
  let transcriptSnap: FirebaseFirestore.DocumentSnapshot;
  try {
    transcriptSnap = await transcriptRef.get();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to fetch transcript", details: msg },
      { status: 500 }
    );
  }

  if (!transcriptSnap.exists) {
    return NextResponse.json(
      { error: "Transcript not found. Has AssemblyAI finished processing?" },
      { status: 404 }
    );
  }

  const parsed = parseTranscript(transcriptSnap.data()!);
  if (!parsed) {
    return NextResponse.json(
      { error: "Transcript document is malformed (missing fullText or segments)" },
      { status: 422 }
    );
  }
  const { fullText, segments } = parsed;

  // ── 3. Mark interview as 'analyzing' ──────────────────────────────────────
  // This triggers the real-time UI update (spinner / status card) before the
  // Gemini call starts, so the user sees progress immediately.
  try {
    await interviewRef.update({
      status:    "analyzing",
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch {
    // Non-fatal — the interview document might not exist yet in edge cases;
    // continue with the analysis regardless.
  }

  // ── 4. Run speech metrics + LLM analysis in parallel ─────────────────────
  // calculateSpeechMetrics is synchronous and CPU-bound (~1 ms for typical
  // transcripts); wrapping it in Promise.resolve keeps the shape consistent
  // for Promise.all without spawning extra async overhead.
  let geminiResult: GeminiAnalysisResponse;
  let speechMetrics: SpeechMetrics;

  try {
    [geminiResult, speechMetrics] = await Promise.all([
      analyzeInterviewTranscript(fullText),
      Promise.resolve(calculateSpeechMetrics(segments)),
    ]);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Analysis failed";

    // Best-effort: mark interview as failed so the UI shows the error state.
    await interviewRef.update({
      status:       "failed",
      errorMessage,
      updatedAt:    FieldValue.serverTimestamp(),
    }).catch(() => {}); // swallow secondary write errors

    return NextResponse.json(
      { error: "Analysis failed", details: errorMessage },
      { status: 500 }
    );
  }

  // ── 5. Persist results atomically ─────────────────────────────────────────
  // A Firestore batch ensures the analysis document and the interview status
  // update succeed or fail together — no half-written state in the database.
  const analysisDoc = buildAnalysisDoc(geminiResult, speechMetrics);

  try {
    const batch = db.batch();

    // Write full analysis to the server-write-only subcollection
    batch.set(analysisRef, analysisDoc);

    // Stamp the parent interview document with completion metadata
    batch.update(interviewRef, {
      status:      "completed",
      overallScore: geminiResult.overallScore,
      completedAt: FieldValue.serverTimestamp(),
      updatedAt:   FieldValue.serverTimestamp(),
    });

    await batch.commit();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to save analysis results", details: msg },
      { status: 500 }
    );
  }

  // ── 6. Return the analysis ────────────────────────────────────────────────
  // FieldValue sentinels can't be JSON-serialised, so the response uses a
  // plain ISO timestamp instead. The authoritative value is in Firestore.
  const responseBody = {
    ...geminiResult,
    speechMetrics,
    modelUsed:    MODEL_ID,
    promptVersion: PROMPT_VERSION,
    generatedAt:  new Date().toISOString(),
  };

  return NextResponse.json({ success: true, analysis: responseBody });
}
