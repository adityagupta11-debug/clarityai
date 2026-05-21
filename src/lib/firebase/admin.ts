import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// ── Lazy singleton ────────────────────────────────────────────────────────────
// getAdminApp() is called inside function bodies, never at module level,
// so importing this file never crashes the build when the FIREBASE_ADMIN_*
// env vars are absent (e.g. during `next build` or client-side imports).
let _app: App | undefined;

function getAdminApp(): App {
  // Return already-initialised instance (hot module reload / warm serverless)
  if (_app) return _app;
  if (getApps().length > 0) {
    _app = getApps()[0]!;
    return _app;
  }

  const projectId   = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

  // Support three storage formats for the private key:
  // 1. FIREBASE_ADMIN_PRIVATE_KEY_BASE64 — base64-encoded PEM (most reliable on Vercel)
  // 2. FIREBASE_ADMIN_PRIVATE_KEY with \n literals (single-line Vercel format)
  // 3. FIREBASE_ADMIN_PRIVATE_KEY with real newlines (.env.local multiline format)
  let privateKey: string | undefined;
  const b64Key = process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64;
  if (b64Key) {
    privateKey = Buffer.from(b64Key, "base64").toString("utf8");
  } else {
    privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  }

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin SDK is not configured. " +
        "Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and " +
        "FIREBASE_ADMIN_PRIVATE_KEY in .env.local (get them from Firebase " +
        "Console → Project Settings → Service Accounts → Generate new private key)."
    );
  }

  _app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  return _app;
}

/** Returns the Admin Firestore instance. Call inside request handlers only. */
export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}
