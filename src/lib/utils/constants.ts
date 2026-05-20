export const APP_NAME = "ClarityAI";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const AUDIO_MAX_SIZE_MB = 500;
export const AUDIO_MAX_SIZE_BYTES = AUDIO_MAX_SIZE_MB * 1024 * 1024;

export const SUPPORTED_AUDIO_TYPES = [
  "audio/mp3",
  "audio/mpeg",
  "audio/wav",
  "audio/m4a",
  "audio/mp4",
  "audio/webm",
  "audio/ogg",
] as const;

export const SUPPORTED_AUDIO_EXTENSIONS = [".mp3", ".wav", ".m4a", ".mp4", ".webm", ".ogg"];

export const INTERVIEW_TYPES = [
  { value: "behavioral", label: "Behavioral" },
  { value: "technical", label: "Technical" },
  { value: "system_design", label: "System Design" },
  { value: "hr_screening", label: "HR Screening" },
  { value: "case_study", label: "Case Study" },
  { value: "other", label: "Other" },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: "student", label: "Student" },
  { value: "entry", label: "Entry Level (0-2 yrs)" },
  { value: "mid", label: "Mid Level (2-5 yrs)" },
  { value: "senior", label: "Senior (5+ yrs)" },
] as const;

export const STATUS_LABELS: Record<string, string> = {
  uploading: "Uploading",
  uploaded: "Uploaded",
  transcribing: "Transcribing",
  transcribed: "Transcribed",
  analyzing: "Analyzing",
  completed: "Completed",
  failed: "Failed",
};

export const SCORE_TIERS = {
  excellent: { min: 85, label: "Excellent", color: "text-emerald-400" },
  good: { min: 70, label: "Good", color: "text-teal-400" },
  fair: { min: 50, label: "Fair", color: "text-amber-400" },
  poor: { min: 0, label: "Needs Work", color: "text-red-400" },
} as const;
