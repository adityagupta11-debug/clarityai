"use client";

import { useEffect, useRef, useId } from "react";
import { cn } from "@/lib/utils";
import { getScoreTier } from "@/lib/utils/formatting";

// ── Gauge geometry ────────────────────────────────────────────────────────────
const R            = 72;          // arc radius (px)
const SW           = 11;          // stroke width (px)
const PAD          = 6;           // padding around arc
const CENTER       = R + SW / 2 + PAD;
const SVG_SIZE     = CENTER * 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

interface OverallScoreProps {
  score:        number;
  summary:      string;
  modelUsed?:   string;
}

export function OverallScore({ score, summary, modelUsed }: OverallScoreProps) {
  const tier        = getScoreTier(score);
  const gaugeRef    = useRef<SVGCircleElement>(null);
  const uid         = useId();
  const gradientId  = `gauge-grad-${uid.replace(/:/g, "")}`;
  const glowId      = `gauge-glow-${uid.replace(/:/g, "")}`;

  // Target dashoffset: 0 = fully filled, CIRCUMFERENCE = fully empty.
  const targetOffset = CIRCUMFERENCE * (1 - score / 100);

  // Stroke colour that matches the tier
  const tierStroke =
    tier.label === "Excellent" ? "oklch(0.75 0.18 145)" :
    tier.label === "Good"      ? "oklch(0.72 0.16 170)" :
    tier.label === "Fair"      ? "oklch(0.78 0.18 60)"  :
                                 "oklch(0.65 0.22 25)";

  // Animate the gauge fill on mount.
  // requestAnimationFrame separates the initial paint (gauge empty) from
  // the transition (gauge fills to score%), ensuring the browser renders
  // the empty state before the animation begins — same mechanism Framer
  // Motion uses internally.
  useEffect(() => {
    const el = gaugeRef.current;
    if (!el) return;

    const raf = requestAnimationFrame(() => {
      el.style.transition = "stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1)";
      el.style.strokeDashoffset = String(targetOffset);
    });

    return () => {
      cancelAnimationFrame(raf);
      if (el) el.style.transition = "";
    };
  }, [targetOffset]);

  return (
    <div className="relative flex flex-col items-center gap-6 glass border border-white/8 rounded-2xl p-8 overflow-hidden">

      {/* Ambient glow behind the gauge */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 40%, oklch(0.541 0.281 293 / 0.12) 0%, transparent 70%)",
        }}
      />

      {/* Label */}
      <p className="relative z-10 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Overall Score
      </p>

      {/* SVG gauge */}
      <div className="relative z-10 flex items-center justify-center">
        <svg
          width={SVG_SIZE}
          height={SVG_SIZE}
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          className="-rotate-90"
          aria-hidden
        >
          <defs>
            {/* Violet → fuchsia arc gradient */}
            <linearGradient
              id={gradientId}
              x1="0" y1="0" x2={SVG_SIZE} y2={SVG_SIZE}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%"   stopColor="oklch(0.70 0.22 293)" />  {/* red-400 */}
              <stop offset="55%"  stopColor="oklch(0.606 0.25 293)" /> {/* red-500 */}
              <stop offset="100%" stopColor="oklch(0.65 0.22 330)" />  {/* fuchsia */}
            </linearGradient>

            {/* Glow filter for the arc */}
            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx={CENTER} cy={CENTER} r={R}
            fill="none"
            stroke="oklch(1 0 0 / 0.06)"
            strokeWidth={SW}
          />

          {/* Filled arc — starts empty (dashoffset = CIRCUMFERENCE),
              animates to target in useEffect */}
          <circle
            ref={gaugeRef}
            cx={CENTER} cy={CENTER} r={R}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={SW}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE}
            filter={`url(#${glowId})`}
          />
        </svg>

        {/* Centered content — rotated back 90° to cancel the parent -rotate-90 */}
        <div className="absolute inset-0 rotate-90 flex flex-col items-center justify-center gap-0.5">
          {/* Score number with multi-layer glow */}
          <span
            className="text-7xl font-black tabular-nums leading-none text-foreground"
            style={{
              textShadow: [
                "0 0 15px oklch(0.606 0.25 293 / 0.7)",
                "0 0 35px oklch(0.606 0.25 293 / 0.4)",
                "0 0 65px oklch(0.606 0.25 293 / 0.2)",
              ].join(", "),
            }}
          >
            {score}
          </span>
          <span className="text-sm text-muted-foreground leading-none">/100</span>
        </div>
      </div>

      {/* Tier label */}
      <div className="relative z-10 flex flex-col items-center gap-1.5">
        <span
          className={cn(
            "text-base font-bold tracking-tight",
            tier.color
          )}
        >
          {tier.label}
        </span>

        {/* Thin decorative separator */}
        <div className="h-px w-16 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* AI summary */}
      <p className="relative z-10 text-xs text-muted-foreground text-center leading-relaxed max-w-[22ch]">
        {summary}
      </p>

      {/* Model badge */}
      {modelUsed && (
        <div className="relative z-10 flex items-center gap-1.5 rounded-full border border-white/8 bg-white/4 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
          <span className="text-[10px] text-muted-foreground font-medium">{modelUsed}</span>
        </div>
      )}
    </div>
  );
}
