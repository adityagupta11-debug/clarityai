"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  History,
  Search,
  Mic,
  TrendingUp,
  Clock,
  BarChart2,
  Sparkles,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { InterviewCard } from "@/components/interview/InterviewCard";
import { useInterviews } from "@/hooks/useInterviews";
import { type InterviewStatus } from "@/types/interview";
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
    <Card className="glass border-white/8">
      <CardContent className="p-5">
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
      </CardContent>
    </Card>
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
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-red glow-red-sm">
            <History className="h-4.5 w-4.5 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight gradient-text-brand">
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
            accent="text-red-400"
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
        <div
          className="rounded-2xl border border-white/8 p-4"
          style={{ background: "oklch(0.12 0.025 35 / 0.85)", backdropFilter: "blur(20px)" }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
              <Input
                placeholder="Search by title, company, or role…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 bg-white/4 border-white/10 hover:border-white/18 focus:border-red-500/40 focus:ring-1 focus:ring-red-500/15 h-9 text-sm placeholder:text-white/25 transition-all"
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
                <div
                  className="absolute right-0 top-11 z-20 w-44 rounded-xl border border-white/10 py-1 shadow-2xl"
                  style={{ background: "oklch(0.15 0.03 35)", backdropFilter: "blur(20px)" }}
                >
                  {SORT_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => { setSortKey(value); setSortOpen(false); }}
                      className={cn(
                        "w-full text-left px-3.5 py-2 text-xs transition-colors",
                        value === sortKey
                          ? "text-red-400 bg-red-500/10"
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
                    ? "gradient-red text-white border-transparent glow-red-sm"
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

      {/* ── Interview list ── */}
      {!loading && hasResults && (
        <div className="space-y-3">
          {filtered.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
        </div>
      )}

      {/* ── No results from filter ── */}
      {!loading && hasInterviews && !hasResults && (
        <div
          className="rounded-2xl border border-white/8 py-16 text-center"
          style={{ background: "oklch(0.12 0.025 35 / 0.85)", backdropFilter: "blur(20px)" }}
        >
          <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">No interviews match your filter</p>
          <p className="text-xs text-muted-foreground mb-4">
            Try a different search term or clear the filters.
          </p>
          <button
            onClick={() => { setQuery(""); setStatusFilter("all"); }}
            className="text-xs text-red-400 hover:text-red-300 transition-colors underline underline-offset-2"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* ── Truly empty state ── */}
      {!loading && !hasInterviews && (
        <div
          className="rounded-2xl border border-dashed border-white/10 py-20 text-center"
          style={{ background: "oklch(0.11 0.02 35 / 0.5)" }}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-red glow-red mx-auto mb-5">
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
              "gradient-red glow-red-sm hover:opacity-90 active:scale-[0.97] transition-all"
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
