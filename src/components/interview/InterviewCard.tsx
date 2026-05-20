"use client";

import Link from "next/link";
import { type Route } from "next";
import {
  Clock,
  Building2,
  Briefcase,
  ChevronRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { type Interview, type InterviewStatus } from "@/types/interview";
import { formatRelativeTime, formatDuration, getScoreTier } from "@/lib/utils/formatting";

interface InterviewCardProps {
  interview: Interview;
}

const STATUS_CONFIG: Record<
  InterviewStatus,
  { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  uploading:    { label: "Uploading",     className: "status-uploading",    icon: Upload },
  uploaded:     { label: "Uploaded",      className: "status-uploading",    icon: Upload },
  transcribing: { label: "Transcribing",  className: "status-transcribing", icon: Loader2 },
  transcribed:  { label: "Transcribed",   className: "status-transcribing", icon: CheckCircle2 },
  analyzing:    { label: "Analyzing",     className: "status-analyzing",    icon: Loader2 },
  completed:    { label: "Completed",     className: "status-completed",    icon: CheckCircle2 },
  failed:       { label: "Failed",        className: "status-failed",       icon: AlertCircle },
};

const INTERVIEW_TYPE_LABELS: Record<Interview["interviewType"], string> = {
  behavioral:    "Behavioral",
  technical:     "Technical",
  system_design: "System Design",
  hr_screening:  "HR Screening",
  case_study:    "Case Study",
  other:         "Other",
};

const isSpinning = (status: InterviewStatus) =>
  status === "transcribing" || status === "analyzing";

export function InterviewCard({ interview }: InterviewCardProps) {
  const statusCfg = STATUS_CONFIG[interview.status];
  const StatusIcon = statusCfg.icon;

  const scoreTier =
    interview.status === "completed" && interview.overallScore !== null
      ? getScoreTier(interview.overallScore)
      : null;

  return (
    <Card className="glass border-white/8 hover-lift group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left: meta */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {/* Status badge */}
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                  statusCfg.className
                )}
              >
                <StatusIcon
                  className={cn("h-3 w-3", isSpinning(interview.status) && "animate-spin")}
                />
                {statusCfg.label}
              </span>

              {/* Interview type */}
              <Badge variant="outline" className="border-white/10 text-muted-foreground text-xs">
                {INTERVIEW_TYPE_LABELS[interview.interviewType]}
              </Badge>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-base leading-tight mb-1.5 truncate">
              {interview.title}
            </h3>

            {/* Company / role */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              {interview.company && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {interview.company}
                </span>
              )}
              {interview.role && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {interview.role}
                </span>
              )}
              {interview.recordingDuration > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(interview.recordingDuration)}
                </span>
              )}
              <span>{formatRelativeTime(interview.createdAt)}</span>
            </div>

            {/* Error message */}
            {interview.status === "failed" && interview.errorMessage && (
              <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {interview.errorMessage}
              </p>
            )}
          </div>

          {/* Right: score + action */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            {/* Score */}
            {scoreTier && interview.overallScore !== null && (
              <div className="text-right">
                <span className={cn("text-2xl font-bold tabular-nums", scoreTier.color)}>
                  {interview.overallScore}
                </span>
                <span className="text-xs text-muted-foreground ml-0.5">/100</span>
                <p className={cn("text-xs font-medium", scoreTier.color)}>{scoreTier.label}</p>
              </div>
            )}

            {/* CTA */}
            {interview.status === "completed" ? (
              <Link
                href={`/interview/${interview.id}/results` as Route}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "gradient-violet hover:opacity-90 transition-opacity text-xs"
                )}
              >
                View Results
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            ) : interview.status !== "failed" ? (
              <Link
                href={`/interview/${interview.id}` as Route}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "border-white/10 hover:border-white/20 text-xs"
                )}
              >
                View Status
              </Link>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
