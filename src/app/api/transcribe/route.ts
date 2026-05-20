import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { transcribeAudio, type AssemblyUtterance, type AssemblyWord } from "@/lib/services/assemblyai";
import { analyzeInterviewTranscript, MODEL_ID, PROMPT_VERSION } from "@/lib/services/gemini";
import { calculateSpeechMetrics } from "@/lib/utils/metrics";
import { type TranscriptSegment, type TranscriptWord } from "@/types/transcript";

// Allow up to 5 minutes — AssemblyAI + Gemini can take ~2 min combined
export const maxDuration = 300;

// ── Helpers ───────────────────────────────────────────────────────────────────

function toTranscriptWord(w: AssemblyWord, speaker: string): TranscriptWord {
  return {
    text:       w.text,
    startMs:    w.start,
    endMs:      w.end,
    confidence: w.confidence,
    speaker:    w.speaker ?? speaker,
  };
}

function toSegment(u: AssemblyUtterance): TranscriptSegment {
  return {
    speaker:    u.speaker,
    text:       u.text,
    startMs:    u.start,
    endMs:      u.end,
    confidence: u.confidence,
    words:      u.words.map((w) => toTranscriptWord(w, u.speaker)),
  };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {

  // 1. Parse body
  let interviewId: string;
  try {
    const body = await req.json();
    if (!body?.interviewId || typeof body.interviewId !== "string") {
      return NextResponse.json({ error: "interviewId is required" }, { status: 400 });
    }
    interviewId = body.interviewId;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const db           = getAdminDb();
  const interviewRef = db.doc(`interviews/${interviewId}`);

  // 2. Fetch interview to get the audio URL
  const snap = await interviewRef.get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Interview not found" }, { status: 404 });
  }
  const interviewData = snap.data()!;
  const recordingUrl  = interviewData.recordingUrl as string | null;

  if (!recordingUrl) {
    return NextResponse.json(
      { error: "No recording URL found. The file may not have been uploaded correctly." },
      { status: 422 }
    );
  }

  // ── 3. Transcribe with AssemblyAI ─────────────────────────────────────────
  try {
    await interviewRef.update({ status: "transcribing", updatedAt: FieldValue.serverTimestamp() });

    const assemblyResult = await transcribeAudio(recordingUrl);

    if (!assemblyResult.text?.trim()) {
      throw new Error(
        "AssemblyAI returned an empty transcript. " +
        "Make sure the recording contains audible speech (try recording at least 20–30 seconds)."
      );
    }

    // 4. Build our Transcript shape from AssemblyAI output
    const segments: TranscriptSegment[] = (assemblyResult.utterances ?? []).map(toSegment);
    const allWords  = segments.flatMap((s) => s.words);
    const speakers  = new Set(segments.map((s) => s.speaker));

    // Compute confidence from word-level data (more accurate than utterance average)
    const avgConfidence =
      allWords.length > 0
        ? allWords.reduce((s, w) => s + w.confidence, 0) / allWords.length
        : assemblyResult.confidence ?? 0;

    // 5. Save transcript to subcollection (Admin SDK — bypasses client security rules)
    await db.doc(`interviews/${interviewId}/transcript/data`).set({
      fullText:       assemblyResult.text,
      segments,
      wordCount:      allWords.length,
      speakerCount:   speakers.size,
      confidence:     Math.round(avgConfidence * 100) / 100,
      processingTime: assemblyResult.audio_duration ?? 0,
      createdAt:      FieldValue.serverTimestamp(),
    });

    await interviewRef.update({
      status:                  "transcribed",
      assemblyaiTranscriptId:  assemblyResult.id,
      updatedAt:               FieldValue.serverTimestamp(),
    });

    // ── 6. Run AI analysis ─────────────────────────────────────────────────
    await interviewRef.update({ status: "analyzing", updatedAt: FieldValue.serverTimestamp() });

    const [geminiResult, speechMetrics] = await Promise.all([
      analyzeInterviewTranscript(assemblyResult.text),
      Promise.resolve(calculateSpeechMetrics(segments)),
    ]);

    // 7. Save analysis to subcollection
    const analysisDoc = {
      ...geminiResult,
      speechMetrics,
      modelUsed:     MODEL_ID,
      promptVersion: PROMPT_VERSION,
      generatedAt:   FieldValue.serverTimestamp(),
    };
    await db.doc(`interviews/${interviewId}/analysis/results`).set(analysisDoc);

    // 8. Mark completed — update interview doc atomically
    const batch = db.batch();
    batch.update(interviewRef, {
      status:      "completed",
      overallScore: geminiResult.overallScore,
      completedAt: FieldValue.serverTimestamp(),
      updatedAt:   FieldValue.serverTimestamp(),
    });
    await batch.commit();

    return NextResponse.json({
      success:     true,
      interviewId,
      overallScore: geminiResult.overallScore,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Pipeline failed";
    console.error("[/api/transcribe] error:", message);

    await interviewRef.update({
      status:       "failed",
      errorMessage: message,
      updatedAt:    FieldValue.serverTimestamp(),
    }).catch(() => {});

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
