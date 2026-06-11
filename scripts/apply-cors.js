// Applies cors.json to the Firebase Storage bucket — equivalent to
// `gsutil cors set cors.json gs://$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
// but uses the Firebase Admin credentials from .env.local, so no gcloud
// install or interactive login is needed.
//
// Usage: node scripts/apply-cors.js
// Re-run after editing cors.json (e.g. adding the production origin).

const path = require("path");
const fs = require("fs");
const { loadEnvConfig } = require("@next/env");
const { initializeApp, cert } = require("firebase-admin/app");
const { getStorage } = require("firebase-admin/storage");

const root = path.resolve(__dirname, "..");
loadEnvConfig(root);

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

let privateKey;
const b64Key = process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64;
if (b64Key) {
  privateKey = Buffer.from(b64Key, "base64").toString("utf8");
} else {
  privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
}

if (!projectId || !clientEmail || !privateKey || !bucketName) {
  console.error(
    "Missing FIREBASE_ADMIN_* or NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET in .env.local"
  );
  process.exit(1);
}

const cors = JSON.parse(fs.readFileSync(path.join(root, "cors.json"), "utf8"));

initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });

getStorage()
  .bucket(bucketName)
  .setMetadata({ cors })
  .then(([meta]) => {
    console.log(`CORS applied to gs://${bucketName}:`);
    console.log(JSON.stringify(meta.cors, null, 2));
  })
  .catch((err) => {
    console.error("Failed to apply CORS:", err.message);
    process.exit(1);
  });
