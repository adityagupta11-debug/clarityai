import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

// POST /api/webhooks/assemblyai — receive transcription completion callback
// Handler implemented in Phase 3.
//
// Secure by default: even before the handler exists, the route rejects any
// call that doesn't carry the shared webhook secret. When submitting a
// transcription job, pass webhook_auth_header_name: "X-Webhook-Secret" and
// webhook_auth_header_value: process.env.ASSEMBLYAI_WEBHOOK_SECRET so
// AssemblyAI echoes the secret back on this callback.

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export async function POST(req: NextRequest) {
  const secret = process.env.ASSEMBLYAI_WEBHOOK_SECRET;
  const header = req.headers.get("x-webhook-secret");

  if (!secret || !header || !safeEqual(header, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
