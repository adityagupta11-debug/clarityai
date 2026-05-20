import { NextResponse } from "next/server";

// POST /api/webhooks/assemblyai — receive transcription completion callback
// Implemented in Phase 3
export async function POST() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
