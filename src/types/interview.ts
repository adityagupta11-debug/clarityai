export type InterviewStatus =
  | "uploading"
  | "uploaded"
  | "transcribing"
  | "transcribed"
  | "analyzing"
  | "completed"
  | "failed";

export type InterviewType =
  | "behavioral"
  | "technical"
  | "system_design"
  | "hr_screening"
  | "case_study"
  | "other";

export interface Interview {
  id: string;
  userId: string;
  title: string;
  company: string | null;
  role: string | null;
  interviewType: InterviewType;
  status: InterviewStatus;
  errorMessage: string | null;
  recordingPath: string;
  recordingDuration: number;
  recordingSize: number;
  mimeType: string;
  assemblyaiTranscriptId: string | null;
  recordingUrl: string | null;   // Firebase Storage download URL for AssemblyAI
  overallScore: number | null;   // Denormalized from analysis subcollection on completion
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

export interface CreateInterviewInput {
  title: string;
  company?: string;
  role?: string;
  interviewType: InterviewType;
}
