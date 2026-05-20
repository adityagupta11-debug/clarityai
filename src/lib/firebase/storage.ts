import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { getFirebaseApp } from "./config";

// Lazily obtain the Storage instance — never at module level (avoids SSR crash)
function storage() {
  return getStorage(getFirebaseApp());
}

// Maps MIME types to file extensions for building the Storage path.
// Falls back to the original file extension (for File objects) or "webm".
const MIME_TO_EXT: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/wave": "wav",
  "audio/x-wav": "wav",
  "audio/m4a": "m4a",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/webm": "webm",
  "audio/ogg": "ogg",
};

function resolveExtension(file: File | Blob): string {
  // Prefer the declared MIME type
  const fromMime = MIME_TO_EXT[file.type];
  if (fromMime) return fromMime;

  // Fall back to the filename extension for File objects
  if (file instanceof File && file.name.includes(".")) {
    return file.name.split(".").pop()!.toLowerCase();
  }

  return "webm"; // safe default for MediaRecorder output
}

export interface UploadResult {
  path: string; // Storage path — stored in Firestore for later reference
  url: string;  // Signed download URL — used by AssemblyAI to fetch the audio
}

/**
 * Uploads an audio file to Firebase Storage under `interviews/{userId}/{uuid}.{ext}`.
 * Reports upload progress (0–100) via `onProgress` and resolves with the
 * Storage path and download URL when complete.
 */
export function uploadAudioFile(
  userId: string,
  file: File | Blob,
  onProgress: (progress: number) => void
): Promise<UploadResult> {
  const ext = resolveExtension(file);
  const uuid = crypto.randomUUID();
  const path = `interviews/${userId}/${uuid}.${ext}`;

  const storageRef = ref(storage(), path);
  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type || "audio/webm",
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      // Progress snapshot — bytesTransferred / totalBytes gives 0–1
      (snapshot) => {
        onProgress(
          snapshot.totalBytes > 0
            ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
            : 0
        );
      },
      // Upload error
      reject,
      // Upload complete
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ path, url });
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}
