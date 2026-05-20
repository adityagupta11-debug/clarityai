import { NextResponse } from "next/server";

// GET /api/interviews/[id]
// PATCH /api/interviews/[id]
// DELETE /api/interviews/[id]
// Implemented in Phase 2
export async function GET() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

export async function PATCH() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
