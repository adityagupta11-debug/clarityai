import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { type User as FirebaseUser } from "firebase/auth";
import { getFirebaseApp } from "./config";
import { type Interview } from "@/types/interview";

// Lazily obtain the Firestore instance — never at module level
function db() {
  return getFirestore(getFirebaseApp());
}

// ── User documents ───────────────────────────────────────────

export async function ensureUserDocument(user: FirebaseUser): Promise<void> {
  const userRef = doc(db(), "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      email: user.email ?? "",
      displayName: user.displayName ?? "",
      photoURL: user.photoURL ?? null,
      plan: "free",
      interviewCount: 0,
      totalMinutesUsed: 0,
      preferredRole: null,
      experienceLevel: "entry",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
  } else {
    await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
  }
}

/** Fetch a user's profile preferences from Firestore */
export async function getUserPreferences(userId: string): Promise<{
  preferredRole: string | null;
  experienceLevel: string;
  plan: string;
  createdAt: { toDate(): Date } | null;
} | null> {
  const snap = await getDoc(doc(db(), "users", userId));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    preferredRole:   (d.preferredRole as string | null) ?? null,
    experienceLevel: (d.experienceLevel as string) ?? "entry",
    plan:            (d.plan as string) ?? "free",
    createdAt:       (d.createdAt as { toDate(): Date } | null) ?? null,
  };
}

/** Save editable profile preferences */
export async function updateUserPreferences(
  userId: string,
  prefs: { preferredRole?: string | null; experienceLevel?: string }
): Promise<void> {
  await setDoc(
    doc(db(), "users", userId),
    { ...prefs, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

// ── Interview queries ────────────────────────────────────────

function toInterview(id: string, data: Record<string, unknown>): Interview {
  return {
    id,
    userId: data.userId as string,
    title: data.title as string,
    company: (data.company as string | null) ?? null,
    role: (data.role as string | null) ?? null,
    interviewType: data.interviewType as Interview["interviewType"],
    status: data.status as Interview["status"],
    errorMessage: (data.errorMessage as string | null) ?? null,
    recordingPath: (data.recordingPath as string) ?? "",
    recordingDuration: (data.recordingDuration as number) ?? 0,
    recordingSize: (data.recordingSize as number) ?? 0,
    mimeType: (data.mimeType as string) ?? "",
    assemblyaiTranscriptId: (data.assemblyaiTranscriptId as string | null) ?? null,
    overallScore: (data.overallScore as number | null) ?? null,
    createdAt: (data.createdAt as { toDate(): Date } | null)?.toDate() ?? new Date(),
    updatedAt: (data.updatedAt as { toDate(): Date } | null)?.toDate() ?? new Date(),
    completedAt: (data.completedAt as { toDate(): Date } | null)?.toDate() ?? null,
  };
}

export function subscribeToUserInterviews(
  userId: string,
  onData: (interviews: Interview[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(db(), "interviews"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const interviews = snapshot.docs.map((d) =>
        toInterview(d.id, d.data() as Record<string, unknown>)
      );
      onData(interviews);
    },
    onError
  );
}

// ── Interview mutations ──────────────────────────────────────

export interface CreateInterviewParams {
  userId: string;
  title: string;
  company: string | null;
  role: string | null;
  interviewType: Interview["interviewType"];
  recordingPath: string;
  recordingDuration: number; // seconds
  recordingSize: number;     // bytes
  mimeType: string;
}

/**
 * Creates a new interview document in Firestore.
 * Call this after the audio file has been successfully uploaded to Storage.
 * Returns the auto-generated Firestore document ID (used as the interview ID
 * throughout the app and in all subsequent API calls).
 */
export async function createInterview(
  params: CreateInterviewParams
): Promise<string> {
  const docRef = await addDoc(collection(db(), "interviews"), {
    userId: params.userId,
    title: params.title,
    company: params.company,
    role: params.role,
    interviewType: params.interviewType,
    status: "uploaded",
    errorMessage: null,
    recordingPath: params.recordingPath,
    recordingDuration: params.recordingDuration,
    recordingSize: params.recordingSize,
    mimeType: params.mimeType,
    assemblyaiTranscriptId: null,
    overallScore: null,
    completedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}
