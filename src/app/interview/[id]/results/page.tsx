import type { Metadata } from "next";
import Link from "next/link";
import { type Route } from "next";
import {
  ArrowLeft,
  Building2,
  Briefcase,
  Calendar,
  Tag,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAdminDb } from "@/lib/firebase/admin";
import { DashboardGrid } from "@/components/results/DashboardGrid";
import { getScoreTier, formatDate, formatDuration } from "@/lib/utils/formatting";
import type { Analysis } from "@/types/analysis";
import type { Interview } from "@/types/interview";

// ── Serialized types ──────────────────────────────────────────────────────────
// Firestore Timestamps and JS Date objects cannot cross the RSC boundary.
// All timestamp fields are converted to ISO strings before being passed to
// any Client Component ("use client" boundary).

export type SerializedInterview = Omit<Interview, "createdAt" | "updatedAt" | "completedAt"> & {
  createdAt:   string;
  updatedAt:   string;
  completedAt: string | null;
};

export type SerializedAnalysis = Omit<Analysis, "generatedAt"> & {
  generatedAt: string;
};

// ── Firestore helpers ─────────────────────────────────────────────────────────

function tsToISO(ts: unknown): string {
  if (ts && typeof ts === "object" && "toDate" in ts) {
    return (ts as { toDate(): Date }).toDate().toISOString();
  }
  if (ts instanceof Date) return ts.toISOString();
  return new Date().toISOString();
}

function tsToISOOrNull(ts: unknown): string | null {
  if (!ts) return null;
  return tsToISO(ts);
}

type FirestoreData = Record<string, unknown>;

function deserializeInterview(id: string, data: FirestoreData): SerializedInterview {
  return {
    id,
    userId:                  data.userId as string,
    title:                   (data.title as string) || "Untitled Interview",
    company:                 (data.company as string | null) ?? null,
    role:                    (data.role as string | null) ?? null,
    interviewType:           (data.interviewType as Interview["interviewType"]) || "other",
    status:                  (data.status as Interview["status"]) || "completed",
    errorMessage:            (data.errorMessage as string | null) ?? null,
    recordingPath:           (data.recordingPath as string) ?? "",
    recordingDuration:       (data.recordingDuration as number) ?? 0,
    recordingSize:           (data.recordingSize as number) ?? 0,
    mimeType:                (data.mimeType as string) ?? "",
    assemblyaiTranscriptId:  (data.assemblyaiTranscriptId as string | null) ?? null,
    overallScore:            (data.overallScore as number | null) ?? null,
    createdAt:               tsToISO(data.createdAt),
    updatedAt:               tsToISO(data.updatedAt),
    completedAt:             tsToISOOrNull(data.completedAt),
  };
}

function deserializeAnalysis(data: FirestoreData): SerializedAnalysis {
  return {
    ...(data as unknown as Omit<Analysis, "generatedAt">),
    generatedAt: tsToISO(data.generatedAt),
  };
}

// ── Data fetching ─────────────────────────────────────────────────────────────

async function fetchResultsData(interviewId: string): Promise<{
  interview: SerializedInterview | null;
  analysis:  SerializedAnalysis | null;
}> {
  const db = getAdminDb();

  const [interviewSnap, analysisSnap] = await Promise.all([
    db.doc(`interviews/${interviewId}`).get(),
    db.doc(`interviews/${interviewId}/analysis/results`).get(),
  ]);

  const interview = interviewSnap.exists
    ? deserializeInterview(interviewId, interviewSnap.data() as FirestoreData)
    : null;

  const analysis = analysisSnap.exists
    ? deserializeAnalysis(analysisSnap.data() as FirestoreData)
    : null;

  return { interview, analysis };
}

// ── Metadata ──────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const db   = getAdminDb();
    const snap = await db.doc(`interviews/${id}`).get();
    const title = snap.exists ? (snap.data()?.title as string) : "Interview";
    return { title: `Results — ${title}` };
  } catch {
    return { title: "Analysis Results" };
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

const INTERVIEW_TYPE_LABELS: Record<Interview["interviewType"], string> = {
  behavioral:    "Behavioral",
  technical:     "Technical",
  system_design: "System Design",
  hr_screening:  "HR Screening",
  case_study:    "Case Study",
  other:         "Other",
};

function MetaPill({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5 text-sm text-foreground/70">
      <Icon className="h-3.5 w-3.5 text-red-400/80 shrink-0" />
      {label}
    </span>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const tier = getScoreTier(score);
  const bg =
    tier.label === "Excellent" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" :
    tier.label === "Good"      ? "bg-teal-500/15 border-teal-500/30 text-teal-300"         :
    tier.label === "Fair"      ? "bg-amber-500/15 border-amber-500/30 text-amber-300"       :
                                 "bg-red-500/15 border-red-500/30 text-red-300";

  return (
    <div className={cn("flex items-center gap-2 rounded-full border px-4 py-1.5", bg)}>
      <span className="text-2xl font-bold tabular-nums">{score}</span>
      <div className="flex flex-col leading-none">
        <span className="text-[10px] opacity-70">/100</span>
        <span className="text-xs font-semibold">{tier.label}</span>
      </div>
    </div>
  );
}

function GradientHeader({
  interview,
  analysis,
}: {
  interview: SerializedInterview;
  analysis:  SerializedAnalysis;
}) {
  const completedAt = interview.completedAt
    ? formatDate(new Date(interview.completedAt))
    : null;

  return (
    <header className="relative w-full overflow-hidden border-b border-white/8">
      {/* Multi-layer gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.18 0.07 293 / 0.95) 0%, oklch(0.11 0.04 290 / 0.98) 50%, oklch(0.09 0.02 295) 100%)",
        }}
      />

      {/* Ambient glow orbs */}
      <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, oklch(0.541 0.281 293 / 0.18) 0%, transparent 70%)" }} />
      <div className="absolute -bottom-12 right-8 h-52 w-52 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, oklch(0.65 0.22 320 / 0.12) 0%, transparent 70%)" }} />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">

        {/* Top row: breadcrumb + score badge */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Dashboard
          </Link>

          <ScoreBadge score={analysis.overallScore} />
        </div>

        {/* Interview title */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
          {interview.title}
        </h1>

        {/* Meta pills */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-5">
          {interview.company && (
            <MetaPill icon={Building2} label={interview.company} />
          )}
          {interview.role && (
            <MetaPill icon={Briefcase} label={interview.role} />
          )}
          {completedAt && (
            <MetaPill icon={Calendar} label={completedAt} />
          )}
          <MetaPill
            icon={Tag}
            label={INTERVIEW_TYPE_LABELS[interview.interviewType]}
          />
          {interview.recordingDuration > 0 && (
            <MetaPill
              icon={Clock}
              label={formatDuration(interview.recordingDuration)}
            />
          )}
        </div>

        {/* AI summary */}
        <p className="max-w-2xl text-sm leading-relaxed text-foreground/75">
          {analysis.summary}
        </p>
      </div>
    </header>
  );
}

// ── Empty states ──────────────────────────────────────────────────────────────

function AnalysisNotReady({
  interview,
  message,
}: {
  interview?: SerializedInterview;
  message:    string;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center ambient-bg">
      <div className="relative z-10 max-w-md space-y-6">
        <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-2xl gradient-violet glow-violet">
          <svg viewBox="0 0 24 24" className="h-10 w-10 text-white fill-none stroke-current stroke-2">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </div>

        <div>
          <h1 className="text-2xl font-bold mb-2 text-foreground">
            {interview?.title ?? "Interview Results"}
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">{message}</p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ResultsPage({ params }: Props) {
  const { id } = await params;

  // Fetch interview + analysis in parallel — both are needed before rendering
  let interview: SerializedInterview | null = null;
  let analysis:  SerializedAnalysis  | null = null;

  try {
    ({ interview, analysis } = await fetchResultsData(id));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return (
      <AnalysisNotReady
        message={`Failed to load results: ${msg}. This is usually a configuration issue — check that your Firebase Admin credentials are set.`}
      />
    );
  }

  // Interview not found
  if (!interview) {
    return (
      <AnalysisNotReady
        message="This interview could not be found. It may have been deleted, or the link is invalid."
      />
    );
  }

  // Analysis not yet complete
  if (!analysis) {
    const statusMessages: Partial<Record<string, string>> = {
      uploading:    "Your audio is being uploaded…",
      uploaded:     "Your audio has been received and will begin transcribing shortly.",
      transcribing: "AssemblyAI is transcribing your interview. This usually takes 1–3 minutes.",
      transcribed:  "Transcription complete. The AI analysis will begin momentarily.",
      analyzing:    "Gemini is analyzing your transcript. This usually takes under a minute.",
      failed:       interview.errorMessage ?? "Something went wrong during analysis.",
    };
    const message =
      statusMessages[interview.status] ??
      "The analysis for this interview is not yet available.";

    return <AnalysisNotReady interview={interview} message={message} />;
  }

  // ── Render the full results dashboard ────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <GradientHeader interview={interview} analysis={analysis} />
      <DashboardGrid interview={interview} analysis={analysis} />
    </div>
  );
}
