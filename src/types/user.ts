export interface User {
  email: string;
  displayName: string;
  photoURL: string | null;
  plan: "free" | "pro";
  interviewCount: number;
  totalMinutesUsed: number;
  preferredRole: string | null;
  experienceLevel: "student" | "entry" | "mid" | "senior";
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}
