"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { type Route } from "next";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Mic,
  FileAudio,
  Brain,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { subscribeToInterview } from "@/lib/firebase/firestore";
import { type InterviewStatus } from "@/types/interview";

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_STEPS: {
  status: InterviewStatus[];
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  {
    status:      ["uploading", "uploaded"],
    label:       "Uploading Audio",
    icon:        FileAudio,
    description: "Your recording is being stored securely.",
  },
  {
    status:      ["transcribing", "transcribed"],
    label:       "Transcribing",
    icon:        Mic,
    description: "AssemblyAI is converting your audio to text with speaker labels.",
  },
  {
    status:      ["analyzing"],
    label:       "Analysing with AI",
    icon:        Brain,
    description: "Gemini 2.5 Flash is scoring your responses and building your report.",
  },
  {
    status:      ["completed"],
    label:       "Complete",
    icon:        Sparkles,
    description: "Your analysis is ready.",
  },
];

function stepIndexForStatus(status: InterviewStatus): number {
  return STATUS_STEPS.findIndex((s) => s.status.includes(status)) ?? 0;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [status,       setStatus]       = useState<InterviewStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [interviewId,  setInterviewId]  = useState<string | null>(null);

  // Resolve async params
  useEffect(() => {
    params.then(({ id }) => setInterviewId(id));
  }, [params]);

  // Real-time Firestore listener
  useEffect(() => {
    if (!interviewId) return;

    const unsub = subscribeToInterview(interviewId, (rawStatus, errMsg) => {
      const s = rawStatus as InterviewStatus;
      setStatus(s);
      if (errMsg) setErrorMessage(errMsg);

      if (s === "completed") {
        // Short delay so the user sees "Complete" before the redirect
        setTimeout(() => {
          router.push(`/interview/${interviewId}/results` as Route);
        }, 1200);
      }
    });

    return unsub;
  }, [interviewId, router]);

  // Also pull error message from Firestore for failed state
  useEffect(() => {
    if (status !== "failed" || !interviewId) return;
    // Already stored errorMessage in the subscribeToInterview callback?
    // We need a richer callback — but for now the error is shown generically.
  }, [status, interviewId]);

  const activeStepIdx = status ? stepIndexForStatus(status) : 0;
  const isFailed      = status === "failed";
  const isCompleted   = status === "completed";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 ambient-bg">
      <div className="relative z-10 w-full max-w-lg">

        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>

        {/* Main card */}
        <div
          className="rounded-3xl border border-white/8 overflow-hidden"
          style={{ background: "oklch(0.12 0.025 35 / 0.90)", backdropFilter: "blur(24px)" }}
        >
          {/* Animated header bar */}
          {!isFailed && (
            <div className={cn(
              "h-0.5 w-full",
              isCompleted ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : "gradient-red"
            )} />
          )}
          {isFailed && <div className="h-0.5 w-full bg-rose-500/60" />}

          <div className="p-8 sm:p-10 space-y-8">
            {/* Icon + headline */}
            <div className="text-center space-y-3">
              <div className={cn(
                "flex h-16 w-16 mx-auto items-center justify-center rounded-2xl transition-all",
                isFailed    ? "bg-rose-500/15 border border-rose-500/25"
                : isCompleted ? "bg-emerald-500/15 border border-emerald-500/25"
                              : "gradient-red glow-red"
              )}>
                {isFailed    ? <AlertCircle className="h-8 w-8 text-rose-400" />
                : isCompleted ? <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                              : <Loader2    className="h-8 w-8 text-white animate-spin" />}
              </div>

              <h1 className="text-xl font-black">
                {isFailed    ? "Analysis failed"
                : isCompleted ? "Your results are ready!"
                              : "Analysing your interview…"}
              </h1>

              <p className="text-sm text-muted-foreground">
                {isFailed
                  ? "Something went wrong. Please try submitting again."
                  : isCompleted
                    ? "Redirecting to your results…"
                    : "This usually takes 1–2 minutes. You can leave this page — we'll save your results."}
              </p>
            </div>

            {/* Progress steps */}
            {!isFailed && (
              <div className="space-y-3">
                {STATUS_STEPS.map(({ label, icon: Icon, description }, idx) => {
                  const isDone    = idx < activeStepIdx || isCompleted;
                  const isActive  = idx === activeStepIdx && !isCompleted;

                  return (
                    <div
                      key={label}
                      className={cn(
                        "flex items-start gap-4 rounded-xl p-4 transition-all duration-300",
                        isActive  ? "bg-red-500/8 border border-red-500/20"
                        : isDone  ? "bg-emerald-500/6 border border-emerald-500/15"
                                  : "bg-white/2 border border-white/6 opacity-40"
                      )}
                    >
                      {/* Step icon */}
                      <div className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all",
                        isActive  ? "gradient-red glow-red-sm text-white"
                        : isDone  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-white/6 text-muted-foreground"
                      )}>
                        {isDone
                          ? <CheckCircle2 className="h-4 w-4" />
                          : isActive
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Icon className="h-4 w-4" />}
                      </div>

                      <div className="min-w-0">
                        <p className={cn(
                          "text-sm font-semibold",
                          isActive ? "text-foreground" : isDone ? "text-emerald-400" : "text-muted-foreground"
                        )}>
                          {label}
                        </p>
                        {isActive && (
                          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Failed state CTA */}
            {isFailed && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/interview/new"
                  className={cn(
                    buttonVariants(),
                    "flex-1 gradient-red glow-red-sm hover:opacity-90 active:scale-[0.97] transition-all text-center"
                  )}
                >
                  Try Again
                </Link>
                <Link
                  href="/dashboard"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "flex-1 border-white/10 hover:border-white/20 text-center"
                  )}
                >
                  Back to Dashboard
                </Link>
              </div>
            )}

            {/* Completed CTA fallback (if redirect hasn't fired yet) */}
            {isCompleted && interviewId && (
              <Link
                href={`/interview/${interviewId}/results` as Route}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full gradient-red glow-red hover:opacity-90 active:scale-[0.97] transition-all text-center"
                )}
              >
                View Results
                <Sparkles className="h-4 w-4 ml-2" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
