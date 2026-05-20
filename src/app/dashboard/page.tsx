"use client";

import Link from "next/link";
import { Mic, TrendingUp, Clock, Sparkles, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { InterviewCard } from "@/components/interview/InterviewCard";
import { useInterviews } from "@/hooks/useInterviews";
import { useAuth } from "@/hooks/useAuth";

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
    <Card className="glass border-white/8">
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
          <Icon className={cn("h-4 w-4", color)} />
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        {loading ? (
          <Skeleton className="h-8 w-16 bg-white/5" />
        ) : (
          <p className="text-3xl font-bold tracking-tight tabular-nums">{value}</p>
        )}
      </CardContent>
    </Card>
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
      color: "text-red-400",
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} loading={loading} />
        ))}
      </div>

      {/* Interview list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5" />
            Recent Interviews
          </h2>
          {interviews.length > 0 && (
            <Link
              href="/history"
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              View all →
            </Link>
          )}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="glass border-white/8">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24 bg-white/5" />
                      <Skeleton className="h-5 w-48 bg-white/5" />
                      <Skeleton className="h-3 w-36 bg-white/5" />
                    </div>
                    <Skeleton className="h-8 w-20 bg-white/5" />
                  </div>
                </CardContent>
              </Card>
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

        {/* Empty state */}
        {!loading && interviews.length === 0 && (
          <Card className="glass border-white/8 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-violet glow-violet mb-4">
                <Mic className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No interviews yet</h3>
              <p className="text-muted-foreground text-sm max-w-xs mb-6">
                Upload your first recording to get AI-powered feedback on your communication,
                vocabulary, and confidence.
              </p>
              <Link
                href="/interview/new"
                className={cn(
                  buttonVariants(),
                  "gradient-violet hover:opacity-90 transition-opacity"
                )}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Start your first analysis
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
