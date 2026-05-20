import { type TranscriptSegment, type TranscriptWord } from "@/types/transcript";
import { type SpeechMetrics } from "@/types/analysis";

// ── Filler word lists ────────────────────────────────────────────────────────
// Single-word fillers are matched against individual normalized tokens.
// Pair fillers are matched against consecutive word pairs.
// No word appears in both lists, so there is no double-counting risk.

const SINGLE_FILLER_SET = new Set([
  "um", "uh", "ah", "er", "hmm", "hm",
  "like",        // counts all uses — over-counts comparative "like" but WPM context
  "basically",
  "literally",
  "actually",
  "right",
  "so",
  "just",
]);

const PAIR_FILLERS: readonly string[] = [
  "you know",
  "you see",
  "kind of",
  "sort of",
  "i mean",
  "i guess",
];
const PAIR_FILLER_SET = new Set(PAIR_FILLERS);

// Gaps shorter than this between consecutive candidate words are considered
// normal word cadence and are excluded from averagePauseDuration (but still
// included when computing longestPause, which is a raw maximum).
const PAUSE_THRESHOLD_MS = 300;

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z']/g, "");
}

/**
 * Returns the speaker label of the candidate.
 * Heuristic: the speaker with the most words is the candidate.
 * In a job interview the candidate typically speaks 5-10× more than
 * the interviewer, making this reliable for all practical cases.
 */
function findCandidateSpeaker(words: TranscriptWord[]): string {
  const counts = new Map<string, number>();
  for (const w of words) {
    counts.set(w.speaker, (counts.get(w.speaker) ?? 0) + 1);
  }
  let best = { speaker: "A", count: 0 };
  for (const [speaker, count] of counts) {
    if (count > best.count) best = { speaker, count };
  }
  return best.speaker;
}

// ── Main export ──────────────────────────────────────────────────────────────

/**
 * Derives deterministic, quantitative speech metrics from the word-level
 * transcript produced by AssemblyAI.
 *
 * The candidate is identified automatically as the speaker with the most
 * total words. All metrics are computed from that speaker's data only,
 * except `speakingRatio` which compares candidate segment time against the
 * full recording timeline.
 *
 * Returns zero values when segments are empty or contain no words.
 */
export function calculateSpeechMetrics(
  segments: TranscriptSegment[]
): SpeechMetrics {
  const zero: SpeechMetrics = {
    totalSpeakingTime: 0,
    averagePace: 0,
    fillerWords: [],
    totalFillerCount: 0,
    longestPause: 0,
    averagePauseDuration: 0,
    stutterInstances: 0,
    speakingRatio: 0,
  };

  if (segments.length === 0) return zero;

  // Flatten all words from all segments
  const allWords = segments.flatMap((s) => s.words);
  if (allWords.length === 0) return zero;

  // ── Identify candidate ────────────────────────────────────────────────────
  const candidateSpeaker = findCandidateSpeaker(allWords);

  // Candidate words sorted chronologically
  const candidateWords = allWords
    .filter((w) => w.speaker === candidateSpeaker)
    .sort((a, b) => a.startMs - b.startMs);

  if (candidateWords.length === 0) return zero;

  // ── 1. Total speaking time (word-level) ───────────────────────────────────
  // Sum individual word durations rather than segment durations so that
  // within-sentence pauses are not counted as "speaking time".
  let totalSpeakingTime = 0;
  for (const w of candidateWords) {
    totalSpeakingTime += w.endMs - w.startMs;
  }

  // ── 2. Average pace (WPM) ─────────────────────────────────────────────────
  const averagePace =
    totalSpeakingTime > 0
      ? Math.round((candidateWords.length / totalSpeakingTime) * 60_000)
      : 0;

  // ── 3. Filler words ───────────────────────────────────────────────────────
  const fillerCounts = new Map<string, number>();

  // Pass A — single-word fillers
  for (const word of candidateWords) {
    const norm = normalize(word.text);
    if (norm.length > 0 && SINGLE_FILLER_SET.has(norm)) {
      fillerCounts.set(norm, (fillerCounts.get(norm) ?? 0) + 1);
    }
  }

  // Pass B — consecutive-pair fillers
  // When a pair is matched we skip forward by one extra position so neither
  // word is re-examined as part of another pair (though none of the pair
  // components overlap with the single-filler set anyway).
  for (let i = 0; i < candidateWords.length - 1; i++) {
    const pair = `${normalize(candidateWords[i].text)} ${normalize(candidateWords[i + 1].text)}`;
    if (PAIR_FILLER_SET.has(pair)) {
      fillerCounts.set(pair, (fillerCounts.get(pair) ?? 0) + 1);
      i++; // consume the second word of the pair
    }
  }

  // Sort descending by frequency so the caller gets the most impactful
  // fillers first, matching the UI's "worst offenders" display order.
  const fillerWords = Array.from(fillerCounts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);

  const totalFillerCount = fillerWords.reduce((sum, f) => sum + f.count, 0);

  // ── 4 & 5. Pause analysis ─────────────────────────────────────────────────
  // A "pause" is the gap (ms) between the end of one candidate word and the
  // start of the next. Negative gaps (word timestamps sometimes overlap by a
  // few ms in AssemblyAI output due to rounding) are clamped to 0.
  let longestPause = 0;
  let pauseSum = 0;
  let meaningfulPauseCount = 0;

  for (let i = 1; i < candidateWords.length; i++) {
    const gap = Math.max(
      0,
      candidateWords[i].startMs - candidateWords[i - 1].endMs
    );

    if (gap > longestPause) longestPause = gap;

    if (gap >= PAUSE_THRESHOLD_MS) {
      pauseSum += gap;
      meaningfulPauseCount++;
    }
  }

  const averagePauseDuration =
    meaningfulPauseCount > 0
      ? Math.round(pauseSum / meaningfulPauseCount)
      : 0;

  // ── 6. Stutter instances ──────────────────────────────────────────────────
  // A stutter is defined as two consecutive candidate words with the same
  // normalized token (e.g. "I I want to…", "the the company").
  // Filters out empty strings that result from punctuation-only tokens.
  let stutterInstances = 0;
  for (let i = 1; i < candidateWords.length; i++) {
    const curr = normalize(candidateWords[i].text);
    const prev = normalize(candidateWords[i - 1].text);
    if (curr.length > 0 && curr === prev) {
      stutterInstances++;
    }
  }

  // ── 7. Speaking ratio (segment-level) ────────────────────────────────────
  // Uses segment boundaries rather than word durations so that natural
  // within-answer pauses are counted as "candidate time".
  //
  // totalRecordingTime = full timeline from first word of anyone to last word
  // of anyone — a reasonable proxy for recording length when we don't have
  // the raw audio duration.
  let timelineStart = Infinity;
  let timelineEnd = 0;
  for (const w of allWords) {
    if (w.startMs < timelineStart) timelineStart = w.startMs;
    if (w.endMs > timelineEnd) timelineEnd = w.endMs;
  }
  const totalRecordingTime = timelineEnd - timelineStart;

  let candidateSegmentTime = 0;
  for (const seg of segments) {
    if (seg.speaker === candidateSpeaker) {
      candidateSegmentTime += seg.endMs - seg.startMs;
    }
  }

  const speakingRatio =
    totalRecordingTime > 0
      ? Math.min(1, candidateSegmentTime / totalRecordingTime)
      : 0;

  return {
    totalSpeakingTime,
    averagePace,
    fillerWords,
    totalFillerCount,
    longestPause,
    averagePauseDuration,
    stutterInstances,
    speakingRatio,
  };
}
