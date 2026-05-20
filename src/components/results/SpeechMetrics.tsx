"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Mic, Gauge, PauseCircle, Volume2, Repeat2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDuration, formatWPM, formatPercent } from "@/lib/utils/formatting";
import type { SpeechMetrics as SpeechMetricsType } from "@/types/analysis";

// ── Recharts custom shapes ────────────────────────────────────────────────────

interface BarShapeProps {
  x?:      number;
  y?:      number;
  width?:  number;
  height?: number;
  fill?:   string;
}

function RoundedBar({ x = 0, y = 0, width = 0, height = 0, fill }: BarShapeProps) {
  if (height <= 0 || width <= 0) return null;
  const r = Math.min(6, width / 2);
  // Rounded only on the top
  return (
    <path
      d={`M ${x + r},${y} L ${x + width - r},${y} Q ${x + width},${y} ${x + width},${y + r} L ${x + width},${y + height} L ${x},${y + height} L ${x},${y + r} Q ${x},${y} ${x + r},${y} Z`}
      fill={fill}
    />
  );
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────────

function FillerTooltip({
  active,
  payload,
  label,
}: {
  active?:  boolean;
  payload?: Array<{ value?: number | string }>;
  label?:   string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass border border-white/10 rounded-lg px-3.5 py-2.5 shadow-xl">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
        {label}
      </p>
      <p className="text-sm font-black text-violet-300 tabular-nums">
        {payload[0]?.value}{" "}
        <span className="text-xs font-normal text-muted-foreground">
          {payload[0]?.value === 1 ? "time" : "times"}
        </span>
      </p>
    </div>
  );
}

// ── Filler word chart ─────────────────────────────────────────────────────────

function FillerChart({ words }: { words: { word: string; count: number }[] }) {
  // Recharts needs DOM for size measurement — guard against SSR
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-36 rounded-xl bg-white/3 border border-emerald-500/20">
        <Volume2 className="h-6 w-6 text-emerald-400" />
        <p className="text-sm font-semibold text-emerald-400">No filler words detected — excellent!</p>
      </div>
    );
  }

  const sorted = [...words].sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-3">
      {/* Top-offender chips */}
      <div className="flex flex-wrap gap-1.5">
        {sorted.slice(0, 5).map(({ word, count }, i) => (
          <span
            key={word}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
              i === 0
                ? "border-rose-500/30 bg-rose-500/12 text-rose-300"
                : i === 1
                  ? "border-amber-500/30 bg-amber-500/12 text-amber-300"
                  : "border-white/15 bg-white/4 text-muted-foreground"
            )}
          >
            &ldquo;{word}&rdquo;
            <span className="font-black tabular-nums">×{count}</span>
          </span>
        ))}
      </div>

      {/* Bar chart */}
      {!mounted ? (
        <div className="h-36 rounded-xl bg-white/4 animate-pulse" />
      ) : (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sorted}
              margin={{ top: 8, right: 8, left: -20, bottom: 4 }}
              barCategoryGap="30%"
            >
              <defs>
                <linearGradient id="filler-bar-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="oklch(0.606 0.25 293)" stopOpacity={1} />
                  <stop offset="100%" stopColor="oklch(0.65 0.22 330)"  stopOpacity={0.75} />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                stroke="oklch(1 0 0 / 0.06)"
                strokeDasharray="4 4"
              />
              <XAxis
                dataKey="word"
                tick={{ fill: "oklch(0.58 0.05 293)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "oklch(0.58 0.05 293)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={(props) => (
                  <FillerTooltip
                    active={props.active}
                    payload={props.payload as unknown as Array<{ value?: number | string }>}
                    label={String(props.label ?? "")}
                  />
                )}
                cursor={{ fill: "oklch(1 0 0 / 0.04)", radius: 4 } as object}
              />
              <Bar
                dataKey="count"
                fill="url(#filler-bar-grad)"
                shape={<RoundedBar />}
                isAnimationActive
                animationDuration={800}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon:  Icon,
  label,
  value,
  sub,
  accent = "text-foreground",
}: {
  icon:    React.ComponentType<{ className?: string }>;
  label:   string;
  value:   string;
  sub?:    React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="glass border border-white/8 rounded-xl p-4 flex flex-col gap-2 hover-lift">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="text-[10px] font-semibold uppercase tracking-widest">{label}</span>
      </div>
      <p className={cn("text-2xl font-black tabular-nums leading-none", accent)}>{value}</p>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

// ── WPM pace bar ──────────────────────────────────────────────────────────────
// Visual indicator showing where the candidate's pace falls on the slow→fast spectrum

function PaceBar({ wpm }: { wpm: number }) {
  // Typical interview pace: 120–150 WPM = ideal range
  const ZONES = [
    { label: "Slow",   max:  100, color: "bg-blue-400" },
    { label: "Clear",  max:  120, color: "bg-teal-400" },
    { label: "Ideal",  max:  150, color: "bg-emerald-400" },
    { label: "Brisk",  max:  180, color: "bg-amber-400" },
    { label: "Fast",   max: 9999, color: "bg-rose-400" },
  ];
  const zone = ZONES.find((z) => wpm < z.max) ?? ZONES[ZONES.length - 1]!;

  // Map WPM to a 0–100% position on the bar (clamped between 60 and 220 WPM)
  const pct = Math.min(100, Math.max(0, ((wpm - 60) / (220 - 60)) * 100));

  return (
    <div className="mt-2 space-y-1.5">
      <div className="relative h-2 w-full rounded-full overflow-hidden bg-white/8">
        {/* Ideal zone highlight */}
        <div
          className="absolute h-full bg-emerald-500/20 rounded-full"
          style={{ left: `${((120 - 60) / (220 - 60)) * 100}%`, width: `${((150 - 120) / (220 - 60)) * 100}%` }}
        />
        {/* Position marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-background shadow-md -translate-x-1/2 transition-all duration-500"
          style={{ left: `${pct}%`, backgroundColor: `var(--color-${zone.color.replace("bg-", "").replace("-400", "")}-400, oklch(0.72 0.16 170))` }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground/60 font-medium">
        <span>Slow</span>
        <span className="text-emerald-400/80">Ideal (120–150)</span>
        <span>Fast</span>
      </div>
      <p className={cn("text-[11px] font-semibold", zone.color.replace("bg-", "text-"))}>
        {zone.label} pace
      </p>
    </div>
  );
}

// ── Public export ─────────────────────────────────────────────────────────────

interface SpeechMetricsProps {
  metrics: SpeechMetricsType;
}

export function SpeechMetrics({ metrics }: SpeechMetricsProps) {
  const {
    totalSpeakingTime,
    averagePace,
    longestPause,
    averagePauseDuration,
    totalFillerCount,
    fillerWords,
    speakingRatio,
    stutterInstances,
  } = metrics;

  return (
    <section aria-label="Speech Metrics">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Speech Metrics
        </h2>
        <div className="h-px flex-1 bg-white/8" />
      </div>

      <div className="space-y-5">
        {/* ── Top stats grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <StatCard
            icon={Mic}
            label="Speaking Time"
            value={formatDuration(totalSpeakingTime / 1000)}
            accent="text-violet-300"
          />
          <StatCard
            icon={Gauge}
            label="Avg Pace"
            value={formatWPM(averagePace)}
            accent="text-foreground"
            sub={<PaceBar wpm={averagePace} />}
          />
          <StatCard
            icon={PauseCircle}
            label="Longest Pause"
            value={longestPause > 0 ? `${(longestPause / 1000).toFixed(1)}s` : "—"}
            sub={
              averagePauseDuration > 0 && (
                <span>Avg pause: {(averagePauseDuration / 1000).toFixed(1)}s</span>
              )
            }
          />
          <StatCard
            icon={Volume2}
            label="Filler Words"
            value={String(totalFillerCount)}
            accent={totalFillerCount === 0 ? "text-emerald-400" : totalFillerCount < 10 ? "text-amber-400" : "text-rose-400"}
            sub={totalFillerCount === 0 ? "🎉 None detected" : `${fillerWords.length} unique types`}
          />
          <StatCard
            icon={Clock}
            label="Speaking Ratio"
            value={formatPercent(speakingRatio)}
            sub="of total interview"
          />
          <StatCard
            icon={Repeat2}
            label="Stutters"
            value={String(stutterInstances)}
            accent={stutterInstances === 0 ? "text-emerald-400" : "text-amber-400"}
            sub={stutterInstances === 0 ? "Clean delivery" : "repeated words"}
          />
        </div>

        {/* ── Filler words chart ── */}
        <div className="glass border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Filler Word Frequency
            </p>
            {totalFillerCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {totalFillerCount} total across all responses
              </span>
            )}
          </div>
          <FillerChart words={fillerWords} />
        </div>
      </div>
    </section>
  );
}
