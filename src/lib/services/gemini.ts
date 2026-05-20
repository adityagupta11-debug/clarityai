import { GoogleGenAI } from "@google/genai";
import { INTERVIEW_ANALYSIS_PROMPT } from "@/lib/prompts/interview-analysis";
import {
  GEMINI_JSON_SCHEMA,
  GeminiResponseSchema,
  type GeminiAnalysisResponse,
} from "@/lib/prompts/scoring-rubric";

// ── Constants exported so the /api/analyze route can stamp them on the doc ──
export const MODEL_ID       = "gemini-2.5-flash";
export const PROMPT_VERSION = "1.0.0";

// 2-minute ceiling — a 30-min transcript can produce ~40k token outputs
const TIMEOUT_MS = 120_000;

// ── Lazy singleton client ────────────────────────────────────────────────────
// getClient() is called inside the function body, never at module level,
// so importing this file never crashes the server at startup when the
// GEMINI_API_KEY env var is absent (matches the lazy-init pattern used
// throughout this project for Firebase services).
let _client: GoogleGenAI | undefined;

function getClient(): GoogleGenAI {
  if (_client) return _client;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to .env.local and restart the dev server."
    );
  }
  _client = new GoogleGenAI({ apiKey });
  return _client;
}

// ── User prompt wrapper ──────────────────────────────────────────────────────
// Framing the transcript clearly tells Gemini where the analysable content
// starts and ends, reducing hallucinated content that isn't in the transcript.
function buildUserPrompt(transcriptText: string): string {
  return (
    "Analyze the following interview transcript and return your evaluation as structured JSON.\n\n" +
    "[TRANSCRIPT START]\n" +
    transcriptText.trim() +
    "\n[TRANSCRIPT END]"
  );
}

// ── Main exported function ───────────────────────────────────────────────────

/**
 * Sends the transcript to Gemini 2.5 Flash and returns the parsed,
 * schema-validated analysis result.
 *
 * Fields NOT returned here (added by the API route before Firestore write):
 *   speechMetrics, modelUsed, promptVersion, generatedAt
 *
 * @throws {Error} on empty transcript, API failure, empty response,
 *                 JSON parse error, or Zod schema validation failure.
 */
export async function analyzeInterviewTranscript(
  transcriptText: string
): Promise<GeminiAnalysisResponse> {
  if (!transcriptText.trim()) {
    throw new Error("Cannot analyze an empty transcript.");
  }

  const client = getClient();

  // ── 1. Call Gemini ─────────────────────────────────────────────────────────
  let rawText: string;
  try {
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: buildUserPrompt(transcriptText),
      config: {
        // System instructions steer the model's persona and output criteria
        systemInstruction: INTERVIEW_ANALYSIS_PROMPT,

        // Enforce JSON output — with responseSchema set, the model is
        // constrained to return a JSON object matching the schema exactly.
        responseMimeType: "application/json",
        responseSchema: GEMINI_JSON_SCHEMA,

        // Per-request timeout — long transcripts can produce large outputs
        httpOptions: { timeout: TIMEOUT_MS },
      },
    });

    rawText = response.text ?? "";
  } catch (err) {
    // Wrap low-level network/API errors with context
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Gemini API request failed: ${message}`);
  }

  // ── 2. Guard against empty response ────────────────────────────────────────
  // This can happen if the safety filter blocks the content or the transcript
  // is too short for the model to produce a meaningful analysis.
  if (!rawText.trim()) {
    throw new Error(
      "Gemini returned an empty response. " +
        "The transcript may have been blocked by the safety filter, " +
        "or may be too short to analyze."
    );
  }

  // ── 3. Parse JSON ──────────────────────────────────────────────────────────
  // responseMimeType: "application/json" + responseSchema should guarantee
  // valid JSON, but we still guard: some model versions or error states can
  // return plain text instead.
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error(
      "Gemini returned malformed JSON even though responseMimeType was set. " +
        `First 300 chars of raw response: ${rawText.slice(0, 300)}`
    );
  }

  // ── 4. Validate against Zod schema ─────────────────────────────────────────
  // This is the critical runtime safety net. If Gemini hallucinates a field,
  // returns an out-of-range score, or uses an unsupported enum value, we catch
  // it here with a precise field-path error instead of silently corrupting the
  // Firestore document.
  const result = GeminiResponseSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .slice(0, 10) // cap to first 10 to keep the error message readable
      .map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Gemini response failed schema validation:\n${issues}`
    );
  }

  return result.data;
}
