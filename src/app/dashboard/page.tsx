"use client";

import Link from "next/link";
import { Mic, TrendingUp, Clock, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { InterviewCard } from "@/components/interview/InterviewCard";
import { DashboardAnalytics } from "@/components/dashboard/DashboardAnalytics";
import { useInterviews } from "@/hooks/useInterviews";
import { useAuth } from "@/hooks/useAuth";

// Shared premium frosted-glass surface
const CARD_BASE =
  "rounded-3xl bg-white/[0.02] backdrop-blur-2xl border border-white/5 shadow-2xl";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  loading,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  loading: boolean;
}) {
  return (
    <div
      className={cn(
        CARD_BASE,
        "p-6 transition-all duration-300 ease-out",
        "hover:scale-[1.02] hover:-translate-y-1 hover:bg-white/[0.04] hover:shadow-[0_10px_40px_-10px_rgba(0,214,255,0.15)]"
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-white/40">{label}</span>
        <Icon className={cn("h-4 w-4 shrink-0", color)} />
      </div>
      {loading ? (
        <Skeleton className="mt-4 h-9 w-16 bg-white/5" />
      ) : (
        <p className="mt-4 text-4xl font-semibold tracking-tight tabular-nums text-white">
          {value}
        </p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { interviews, loading, avgScore, totalMinutes } = useInterviews();

  const firstName = user?.displayName?.split(" ")[0] ?? "there";

  const stats = [
    {
      label: "Total Interviews",
      value: String(interviews.length),
      icon: Mic,
      color: "text-[#00D6FF]",
    },
    {
      label: "Avg. Score",
      value: avgScore !== null ? `${avgScore}` : "—",
      icon: BarChart2,
      color: "text-emerald-400",
    },
    {
      label: "Minutes Analyzed",
      value: totalMinutes > 0 ? String(totalMinutes) : "0",
      icon: Clock,
      color: "text-blue-400",
    },
  ];

  return (
    <>
      <DashboardHeader
        title={`Welcome back, ${firstName}`}
        description="Here's a snapshot of your interview performance."
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} loading={loading} />
        ))}
      </div>

      {/* Analytics — AI coach + data-viz widgets */}
      <div className="mb-8">
        <DashboardAnalytics interviews={interviews} avgScore={avgScore} />
      </div>

      {/* Recent Interviews — shown once there's history */}
      {(loading || interviews.length > 0) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5" />
              Recent Interviews
            </h2>
            {interviews.length > 0 && (
              <Link
                href="/history"
                className="text-xs text-[#00D6FF] hover:text-white transition-colors"
              >
                View all →
              </Link>
            )}
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className={cn(CARD_BASE, "p-5")}>
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24 bg-white/5" />
                      <Skeleton className="h-5 w-48 bg-white/5" />
                      <Skeleton className="h-3 w-36 bg-white/5" />
                    </div>
                    <Skeleton className="h-8 w-20 bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Interview cards */}
          {!loading && interviews.length > 0 && (
            <div className="space-y-3">
              {interviews.slice(0, 10).map((interview) => (
                <InterviewCard key={interview.id} interview={interview} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
