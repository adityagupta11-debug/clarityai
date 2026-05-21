// AssemblyAI REST API client — server-side only

const API_BASE = "https://api.assemblyai.com/v2";
const POLL_INTERVAL_MS = 3_000;   // check every 3 s
const MAX_POLLS        = 100;      // give up after ~5 min

function apiKey(): string {
  const k = process.env.ASSEMBLYAI_API_KEY;
  if (!k) throw new Error("ASSEMBLYAI_API_KEY is not set.");
  return k;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AssemblyWord {
  text:        string;
  start:       number;  // ms
  end:         number;  // ms
  confidence:  number;
  speaker:     string | null;
}

export interface AssemblyUtterance {
  speaker:    string;
  text:       string;
  start:      number;
  end:        number;
  confidence: number;
  words:      AssemblyWord[];
}

export interface AssemblyTranscript {
  id:              string;
  status:          "queued" | "processing" | "completed" | "error";
  text:            string | null;
  confidence:      number | null;
  audio_duration:  number | null;   // seconds
  utterances:      AssemblyUtterance[] | null;
  words:           AssemblyWord[] | null;
  error:           string | null;
}

// ── Submit ────────────────────────────────────────────────────────────────────

export async function submitTranscription(audioUrl: string): Promise<string> {
  const res = await fetch(`${API_BASE}/transcript`, {
    method:  "POST",
    headers: {
      Authorization:  apiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      audio_url:      audioUrl,
      speaker_labels: true,
      speech_models:  ["universal-2"],  // plural array, required by AssemblyAI API
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`AssemblyAI submit failed (${res.status}): ${body}`);
  }

  const { id } = (await res.json()) as { id: string };
  return id;
}

// ── Poll until completed ──────────────────────────────────────────────────────

export async function pollUntilDone(transcriptId: string): Promise<AssemblyTranscript> {
  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

    const res = await fetch(`${API_BASE}/transcript/${transcriptId}`, {
      headers: { Authorization: apiKey() },
    });

    if (!res.ok) throw new Error(`AssemblyAI poll failed (${res.status})`);

    const data = (await res.json()) as AssemblyTranscript;

    if (data.status === "completed") return data;
    if (data.status === "error")
      throw new Error(`AssemblyAI transcription error: ${data.error ?? "unknown"}`);
    // "queued" or "processing" → continue polling
  }

  throw new Error("AssemblyAI transcription timed out after 5 minutes.");
}

// ── Convenience: submit + poll ────────────────────────────────────────────────

export async function transcribeAudio(audioUrl: string): Promise<AssemblyTranscript> {
  const id = await submitTranscription(audioUrl);
  return pollUntilDone(id);
}
