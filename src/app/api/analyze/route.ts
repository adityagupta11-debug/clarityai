import { NextResponse } from "next/server";

// POST /api/analyze — send transcript to Gemini for structured analysis
// Implemented in Phase 4
export async function POST() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
