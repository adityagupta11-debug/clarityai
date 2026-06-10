import { type NextRequest } from "next/server";
import { getAdminAuth } from "./admin";

/**
 * Verifies the Firebase ID token sent in the Authorization header.
 *
 * Clients must send: `Authorization: Bearer <idToken>` where the token comes
 * from `user.getIdToken()` on the Firebase client SDK.
 *
 * Returns the authenticated user's uid, or null if the header is missing,
 * malformed, or the token is invalid/expired. Route handlers should respond
 * with 401 when this returns null.
 */
export async function verifyRequestAuth(
  req: NextRequest
): Promise<{ uid: string } | null> {
  const header = req.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer (.+)$/i);
  if (!match) return null;

  try {
    const decoded = await getAdminAuth().verifyIdToken(match[1]);
    return { uid: decoded.uid };
  } catch {
    return null;
  }
}
