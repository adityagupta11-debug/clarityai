"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { type Route } from "next";
import {
  History,
  Search,
  Mic,
  TrendingUp,
  Clock,
  BarChart2,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useInterviews } from "@/hooks/useInterviews";
import { type Interview, type InterviewStatus } from "@/types/interview";
import { formatDuration } from "@/lib/utils/formatting";

// ── Filter / sort config ──────────────────────────────────────────────────────

type StatusFilter = "all" | "completed" | "in_progress" | "failed";
type SortKey      = "newest" | "oldest" | "best" | "worst";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all",         label: "All"         },
  { value: "completed",   label: "Completed"   },
  { value: "in_progress", label: "In Progress" },
  { value: "failed",      label: "Failed"      },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first"  },
  { value: "oldest", label: "Oldest first"  },
  { value: "best",   label: "Best score"    },
  { value: "worst",  label: "Worst score"   },
];

const IN_PROGRESS_STATUSES: InterviewStatus[] = ["uploading", "uploaded", "transcribing", "transcribed", "analyzing"];

// ── Stats strip ───────────────────────────────────────────────────────────────

function StatPill({
  icon: Icon,
  value,
  label,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/3 px-4 py-2.5">
      <Icon className={cn("h-4 w-4 shrink-0", accent)} />
      <div>
        <p className={cn("text-lg font-black tabular-nums leading-none", accent)}>{value}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── Loading skeleton row ──────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-white/[0.02] backdrop-blur-2xl border border-white/8 p-5">
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 bg-white/5 rounded-full" />
            <Skeleton className="h-5 w-16 bg-white/5 rounded-full" />
          </div>
          <Skeleton className="h-5 w-56 bg-white/5" />
          <Skeleton className="h-3 w-36 bg-white/5" />
        </div>
        <Skeleton className="h-8 w-24 bg-white/5 rounded-lg" />
      </div>
    </div>
  );
}

// ── History list row ──────────────────────────────────────────────────────────

function formatTimestamp(d: Date): string {
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${date} • ${time}`;
}

function HistoryRow({ interview }: { interview: Interview }) {
  const completed = interview.status === "completed" && interview.overallScore !== null;
  const href = (completed
    ? `/interview/${interview.id}/results`
    : `/interview/${interview.id}`) as Route;

  const mins = Math.round(interview.recordingDuration / 60);
  const duration = interview.recordingDuration > 0 ? `${mins} min${mins !== 1 ? "s" : ""}` : "—";

  const score = interview.overallScore;
  const scoreColor =
    !completed              ? "text-white/30" :
    (score as number) >= 85 ? "text-emerald-400" :
    (score as number) >= 70 ? "text-[#00D6FF]" :
    (score as number) >= 50 ? "text-amber-400" :
                              "text-orange-300";

  return (
    <Link
      href={href}
      className="group flex items-center gap-4 border-b border-white/[0.05] px-5 py-4 transition-all duration-200 ease-in-out last:border-0 hover:bg-white/[0.02]"
    >
      {/* Title + timestamp */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white/90">{interview.title}</p>
        <p className="mt-0.5 truncate text-xs text-white/40">
          {formatTimestamp(interview.createdAt)}
          {interview.role && <span className="text-white/30"> · {interview.role}</span>}
        </p>
      </div>

      {/* Duration */}
      <span className="hidden w-16 shrink-0 text-right text-xs text-white/40 sm:block">
        {duration}
      </span>

      {/* Performance score */}
      <span className={cn("w-20 shrink-0 text-right text-sm font-semibold tabular-nums", scoreColor)}>
        {completed ? `${score}/100` : "Pending"}
      </span>

      {/* Action — glows cyan on row hover */}
      <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-white/40 transition-colors group-hover:text-[#00D6FF]">
        <span className="hidden md:inline">View Report</span>
        <ChevronRight className="h-4 w-4 transition-all group-hover:translate-x-0.5 group-hover:drop-shadow-[0_0_6px_rgba(0,214,255,0.7)]" />
      </span>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const { interviews, loading, avgScore, totalMinutes } = useInterviews();

  const [query,        setQuery]        = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey,      setSortKey]      = useState<SortKey>("newest");
  const [sortOpen,     setSortOpen]     = useState(false);

  // ── Derived filtered + sorted list ──
  const filtered = useMemo(() => {
    let list = interviews;

    // Status filter
    if (statusFilter === "completed") {
      list = list.filter((i) => i.status === "completed");
    } else if (statusFilter === "in_progress") {
      list = list.filter((i) => IN_PROGRESS_STATUSES.includes(i.status));
    } else if (statusFilter === "failed") {
      list = list.filter((i) => i.status === "failed");
    }

    // Search — title, company, role (case-insensitive)
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((i) =>
        i.title.toLowerCase().includes(q) ||
        (i.company?.toLowerCase().includes(q) ?? false) ||
        (i.role?.toLowerCase().includes(q) ?? false)
      );
    }

    // Sort
    return [...list].sort((a, b) => {
      if (sortKey === "newest") return b.createdAt.getTime() - a.createdAt.getTime();
      if (sortKey === "oldest") return a.createdAt.getTime() - b.createdAt.getTime();
      if (sortKey === "best")   return (b.overallScore ?? -1) - (a.overallScore ?? -1);
      if (sortKey === "worst")  return (a.overallScore ?? 101) - (b.overallScore ?? 101);
      return 0;
    });
  }, [interviews, statusFilter, query, sortKey]);

  const hasInterviews  = interviews.length > 0;
  const hasResults     = filtered.length > 0;
  const isFiltered     = query !== "" || statusFilter !== "all";
  const currentLabel   = SORT_OPTIONS.find((o) => o.value === sortKey)?.label ?? "Sort";

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* ── Page header ── */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-blue-cyan glow-cyan">
            <History className="h-4.5 w-4.5 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Interview History
          </h1>
        </div>
        <p className="text-sm text-muted-foreground ml-12">
          Every session you&apos;ve analysed, all in one place.
        </p>
      </div>

      {/* ── Stats strip ── */}
      {!loading && hasInterviews && (
        <div className="flex flex-wrap gap-3">
          <StatPill
            icon={Mic}
            value={String(interviews.length)}
            label="Total sessions"
            accent="text-[#00D6FF]"
          />
          {avgScore !== null && (
            <StatPill
              icon={BarChart2}
              value={`${avgScore}`}
              label="Average score"
              accent="text-emerald-400"
            />
          )}
          {totalMinutes > 0 && (
            <StatPill
              icon={Clock}
              value={formatDuration(totalMinutes * 60)}
              label="Audio analysed"
              accent="text-blue-400"
            />
          )}
          <StatPill
            icon={TrendingUp}
            value={String(interviews.filter((i) => i.status === "completed").length)}
            label="Completed"
            accent="text-amber-400"
          />
        </div>
      )}

      {/* ── Filter / search bar ── */}
      {!loading && hasInterviews && (
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] backdrop-blur-2xl p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
              <Input
                placeholder="Search by title, company, or role…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 bg-white/4 border-white/10 hover:border-white/18 focus:border-[#00D6FF]/40 focus:ring-1 focus:ring-[#00D6FF]/15 h-9 text-sm placeholder:text-white/25 transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setSortOpen((v) => !v)}
                className="flex items-center gap-2 h-9 px-3.5 rounded-lg border border-white/10 bg-white/4 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-white/20 transition-all active:scale-[0.97]"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {currentLabel}
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-11 z-20 w-44 rounded-xl border border-white/10 bg-[#0A0A0C]/95 backdrop-blur-2xl py-1 shadow-2xl">
                  {SORT_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => { setSortKey(value); setSortOpen(false); }}
                      className={cn(
                        "w-full text-left px-3.5 py-2 text-xs transition-colors",
                        value === sortKey
                          ? "text-[#00D6FF] bg-[#00D6FF]/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status filter pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            {STATUS_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={cn(
                  "rounded-full px-3.5 py-1 text-xs font-medium border transition-all active:scale-[0.97]",
                  statusFilter === value
                    ? "gradient-blue-cyan text-white border-transparent glow-cyan"
                    : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground bg-white/3"
                )}
              >
                {label}
                {value !== "all" && (
                  <span className="ml-1.5 opacity-60">
                    {value === "completed"   && interviews.filter((i) => i.status === "completed").length}
                    {value === "in_progress" && interviews.filter((i) => IN_PROGRESS_STATUSES.includes(i.status)).length}
                    {value === "failed"      && interviews.filter((i) => i.status === "failed").length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Results count ── */}
      {!loading && hasInterviews && (
        <p className="text-xs text-muted-foreground">
          {isFiltered
            ? `${filtered.length} of ${interviews.length} interview${interviews.length !== 1 ? "s" : ""}`
            : `${interviews.length} interview${interviews.length !== 1 ? "s" : ""}`}
        </p>
      )}

      {/* ── Loading skeletons ── */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {/* ── Interview list — vertically stacked rows in one glass container ── */}
      {!loading && hasResults && (
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02] backdrop-blur-2xl shadow-2xl">
          {filtered.map((interview) => (
            <HistoryRow key={interview.id} interview={interview} />
          ))}
        </div>
      )}

      {/* ── No results from filter ── */}
      {!loading && hasInterviews && !hasResults && (
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] backdrop-blur-2xl py-16 text-center">
          <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">No interviews match your filter</p>
          <p className="text-xs text-muted-foreground mb-4">
            Try a different search term or clear the filters.
          </p>
          <button
            onClick={() => { setQuery(""); setStatusFilter("all"); }}
            className="text-xs text-[#00D6FF] hover:text-white transition-colors underline underline-offset-2"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* ── Truly empty state ── */}
      {!loading && !hasInterviews && (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] backdrop-blur-2xl py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-blue-cyan glow-cyan mx-auto mb-5">
            <Mic className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-base font-semibold mb-2">No interviews yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
            Upload your first recording to get AI-powered feedback on your performance.
          </p>
          <Link
            href="/interview/new"
            className={cn(
              buttonVariants(),
              "gradient-blue-cyan glow-cyan hover:opacity-90 active:scale-[0.97] transition-all"
            )}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Start your first analysis
          </Link>
        </div>
      )}
    </div>
  );
}
