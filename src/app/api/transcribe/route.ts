import { NextResponse } from "next/server";

// POST /api/transcribe — send audio URL to AssemblyAI
// Implemented in Phase 3
export async function POST() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
