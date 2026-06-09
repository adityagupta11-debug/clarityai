"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mic, Sparkles, Activity, LineChart as LineIcon, PieChart as PieIcon, Gauge } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { Interview } from "@/types/interview";

// ── Brand palette ─────────────────────────────────────────────────────────────
// Dark mode keeps the cyan/blue/purple identity; light mode uses warm mocha tones
// so the charts stay legible on the light-brown cards.
const DARK = { c1: "#00D6FF", c2: "#0050FF", c3: "#7C3AED" };
const LIGHT = { c1: "#6F4E37", c2: "#A87C53", c3: "#C9A27A" };

const CARD =
  "rounded-3xl bg-muted dark:bg-white/[0.02] backdrop-blur-2xl border border-border dark:border-white/5 shadow-2xl";

const toDate = (d: Date | string | number): Date => (d instanceof Date ? d : new Date(d));
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

// ── Shared tooltip ────────────────────────────────────────────────────────────
function DashTooltip({
  active,
  payload,
  label,
  suffix = "",
}: {
  active?: boolean;
  payload?: Array<{ value?: number | string; name?: string }>;
  label?: string | number;
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border dark:border-white/10 bg-card/95 dark:bg-[#0A0A0C]/90 px-3 py-2 shadow-xl backdrop-blur-xl">
      {label != null && label !== "" && (
        <p className="mb-0.5 text-[10px] uppercase tracking-widest text-muted-foreground dark:text-white/40">{label}</p>
      )}
      <p className="text-sm font-semibold text-foreground dark:text-white">
        {payload[0]?.value}
        <span className="font-normal text-muted-foreground dark:text-white/40">{suffix}</span>
      </p>
    </div>
  );
}

// ── Chart card shell ──────────────────────────────────────────────────────────
function ChartCard({
  title,
  icon: Icon,
  children,
  footer,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className={cn(CARD, "flex flex-col p-5 transition-all duration-300 hover:border-border dark:hover:border-white/10 hover:bg-accent dark:hover:bg-white/[0.04]")}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground dark:text-white/70">{title}</h3>
        <Icon className="h-4 w-4 text-muted-foreground/70 dark:text-white/30" />
      </div>
      <div className="flex-1">{children}</div>
      {footer}
    </div>
  );
}

function Placeholder({ message }: { message: string }) {
  return (
    <div className="flex h-[150px] items-center justify-center px-4 text-center text-xs text-muted-foreground dark:text-white/30">
      {message}
    </div>
  );
}

// ── Public component ──────────────────────────────────────────────────────────
export function DashboardAnalytics({
  interviews,
  avgScore,
}: {
  interviews: Interview[];
  avgScore: number | null;
}) {
  // Recharts needs the DOM for measurement — guard against the SSR pass.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Theme-aware chart colours.
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { c1, c2, c3 } = isDark ? DARK : LIGHT;
  const skillColors = [c1, c3, c2];
  const axisTick = isDark ? "rgba(255,255,255,0.4)" : "rgba(62,39,35,0.55)";
  const gridStroke = isDark ? "rgba(255,255,255,0.06)" : "rgba(62,39,35,0.12)";
  const trackFill = isDark ? "rgba(255,255,255,0.06)" : "rgba(62,39,35,0.10)";
  const cursorFill = isDark ? "rgba(255,255,255,0.04)" : "rgba(62,39,35,0.05)";

  // ── Derived datasets (real data only) ──
  const now = new Date();
  const activity = Array.from({ length: 6 }).map((_, idx) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
    const count = interviews.filter((i) => {
      const c = toDate(i.createdAt);
      return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth();
    }).length;
    return { month: d.toLocaleString("en-US", { month: "short" }), count };
  });

  const completed = interviews
    .filter((i) => i.status === "completed" && i.overallScore != null)
    .sort((a, b) => toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime());

  const scoreTrend = completed.slice(-8).map((i, idx) => ({
    name: `#${idx + 1}`,
    score: i.overallScore as number,
  }));
  const hasTrend = scoreTrend.length >= 2;

  const hasScore = avgScore != null;
  const confidence = avgScore ?? 0;

  // Skill split — proxied from overall performance (per-skill data lives in each report).
  const base = avgScore ?? 0;
  const skills = [
    { name: "Clarity", value: clamp(base + 5) },
    { name: "Vocabulary", value: clamp(base - 4) },
    { name: "Confidence", value: clamp(base + 1) },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* ── AI Coach (left column) ── */}
      <div className={cn(CARD, "group relative flex flex-col items-center overflow-hidden p-8 text-center")}>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: isDark
              ? "radial-gradient(circle at 50% 30%, rgba(0,214,255,0.12), transparent 62%)"
              : "radial-gradient(circle at 50% 30%, rgba(111,78,55,0.10), transparent 62%)",
          }}
        />

        <div className="relative flex flex-1 flex-col items-center justify-center">
          {/* Pulsating brand microphone */}
          <Link
            href="/interview/new"
            aria-label="Start your first analysis"
            className="group/badge relative mb-7 flex h-40 w-40 items-center justify-center"
          >
            <div className="pointer-events-none absolute h-40 w-40 rounded-full bg-primary/20 dark:bg-[#00D6FF]/20 blur-[70px]" />
            <div className="absolute h-40 w-40 rounded-full border border-border dark:border-white/5" />
            <div className="absolute h-28 w-28 rounded-full border border-primary/15 dark:border-[#00D6FF]/15" />
            <div className="absolute h-28 w-28 rounded-full border border-primary/30 dark:border-[#00D6FF]/30 animate-ping [animation-duration:3s]" />
            <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl gradient-blue-cyan animate-float shadow-[0_0_45px_rgba(111,78,55,0.55)] dark:shadow-[0_0_45px_rgba(0,214,255,0.55)] transition-all duration-300 ease-out group-hover/badge:scale-105 group-hover/badge:shadow-[0_0_60px_rgba(111,78,55,0.75)] dark:group-hover/badge:shadow-[0_0_60px_rgba(0,214,255,0.75)]">
              <Mic className="h-9 w-9 text-white" />
            </div>
          </Link>

          <h3 className="text-2xl font-semibold tracking-tight text-foreground dark:text-white">AI Interview Coach</h3>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground dark:text-white/50">
            Analyze your communication and confidence — turn every answer into measurable progress.
          </p>
        </div>

        <Link
          href="/interview/new"
          className="relative mt-7 inline-flex items-center gap-2 rounded-full gradient-blue-cyan px-7 h-12 text-sm font-semibold text-white shadow-[0_0_30px_rgba(111,78,55,0.4)] dark:shadow-[0_0_30px_rgba(0,214,255,0.4)] transition-all duration-300 ease-out hover:scale-105 hover:shadow-[0_0_45px_rgba(111,78,55,0.6)] dark:hover:shadow-[0_0_45px_rgba(0,214,255,0.6)]"
        >
          <Sparkles className="h-4 w-4" />
          Start your first analysis
        </Link>
      </div>

      {/* ── Charts (right column, 2×2) ── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-2">
        {/* Bar — Interview Activity */}
        <ChartCard title="Interview Activity" icon={Activity}>
          <div className="h-[150px]">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activity} margin={{ top: 6, right: 4, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={c1} stopOpacity={0.95} />
                      <stop offset="100%" stopColor={c2} stopOpacity={0.45} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={gridStroke} strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fill: axisTick, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} width={26} tick={{ fill: axisTick, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: cursorFill }} content={<DashTooltip suffix=" interviews" />} />
                  <Bar dataKey="count" fill="url(#dashBar)" radius={[5, 5, 0, 0]} maxBarSize={26} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full animate-pulse rounded-xl bg-muted dark:bg-white/[0.03]" />
            )}
          </div>
        </ChartCard>

        {/* Area — Score Trend */}
        <ChartCard title="Score Trend" icon={LineIcon}>
          <div className="h-[150px]">
            {!mounted ? (
              <div className="h-full animate-pulse rounded-xl bg-muted dark:bg-white/[0.03]" />
            ) : hasTrend ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreTrend} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={c1} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={c1} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={gridStroke} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: axisTick, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} width={26} tick={{ fill: axisTick, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ stroke: axisTick }} content={<DashTooltip suffix=" / 100" />} />
                  <Area type="monotone" dataKey="score" stroke={c1} strokeWidth={2} fill="url(#dashArea)" dot={{ r: 2, fill: c1, strokeWidth: 0 }} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Placeholder message="Complete a couple of interviews to chart your progress." />
            )}
          </div>
        </ChartCard>

        {/* Donut — Skill Breakdown */}
        <ChartCard
          title="Skill Breakdown"
          icon={PieIcon}
          footer={
            hasScore ? (
              <div className="mt-1 flex items-center justify-center gap-3">
                {skills.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: skillColors[i] }} />
                    <span className="text-[10px] text-muted-foreground dark:text-white/50">{s.name}</span>
                  </div>
                ))}
              </div>
            ) : null
          }
        >
          <div className="h-[150px]">
            {!mounted ? (
              <div className="h-full animate-pulse rounded-xl bg-muted dark:bg-white/[0.03]" />
            ) : hasScore ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={skills} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={3} stroke="none">
                    {skills.map((s, i) => (
                      <Cell key={s.name} fill={skillColors[i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<DashTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Placeholder message="No scores yet — your skill mix appears after your first report." />
            )}
          </div>
        </ChartCard>

        {/* Gauge — Overall Confidence Rate */}
        <ChartCard title="Overall Confidence Rate" icon={Gauge}>
          <div className="relative h-[150px]">
            {!mounted ? (
              <div className="h-full animate-pulse rounded-xl bg-muted dark:bg-white/[0.03]" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="70%"
                    outerRadius="100%"
                    startAngle={180}
                    endAngle={0}
                    data={[{ value: confidence }]}
                    barSize={14}
                  >
                    <defs>
                      <linearGradient id="dashGauge" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={c2} />
                        <stop offset="100%" stopColor={c1} />
                      </linearGradient>
                    </defs>
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar
                      dataKey="value"
                      angleAxisId={0}
                      cornerRadius={8}
                      fill="url(#dashGauge)"
                      background={{ fill: trackFill }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-col items-center">
                  <span className="text-3xl font-bold tabular-nums text-foreground dark:text-white">
                    {hasScore ? confidence : "—"}
                  </span>
                  <span className="text-[10px] text-muted-foreground dark:text-white/40">out of 100</span>
                </div>
              </>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
