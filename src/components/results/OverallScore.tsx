"use client";

import { useEffect, useRef, useId } from "react";
import { cn } from "@/lib/utils";
import { getScoreTier } from "@/lib/utils/formatting";

// ── Gauge geometry ────────────────────────────────────────────────────────────
// Defined in viewBox units — the SVG scales via CSS, so these are logical units,
// not pixel dimensions. Using a 180-unit viewBox keeps the maths simple.
const R            = 72;
const SW           = 11;
const PAD          = 6;
const CENTER       = R + SW / 2 + PAD;
const VB_SIZE      = CENTER * 2;          // viewBox logical size (≈ 179)
const CIRCUMFERENCE = 2 * Math.PI * R;

interface OverallScoreProps {
  score:       number;
  summary:     string;
  modelUsed?:  string;
}

export function OverallScore({ score, summary, modelUsed }: OverallScoreProps) {
  const tier       = getScoreTier(score);
  const gaugeRef   = useRef<SVGCircleElement>(null);
  const uid        = useId();
  const gradientId = `gauge-grad-${uid.replace(/:/g, "")}`;
  const glowId     = `gauge-glow-${uid.replace(/:/g, "")}`;

  const targetOffset = CIRCUMFERENCE * (1 - score / 100);

  // Tier-matched stroke colour for the arc's solid fallback
  const tierStroke =
    tier.label === "Excellent" ? "oklch(0.75 0.18 145)" :
    tier.label === "Good"      ? "oklch(0.72 0.16 170)" :
    tier.label === "Fair"      ? "oklch(0.78 0.18 60)"  :
                                 "oklch(0.65 0.22 25)";

  // Animate the gauge on mount via requestAnimationFrame so the browser
  // commits the initial "empty" frame before the transition begins.
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
    <div className="relative flex flex-col items-center gap-4 sm:gap-6 glass border border-white/8 rounded-2xl p-6 sm:p-8 overflow-hidden">

      {/* Ambient glow — brand red */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 40%, oklch(0.55 0.25 25 / 0.10) 0%, transparent 70%)",
        }}
      />

      {/* Label */}
      <p className="relative z-10 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Overall Score
      </p>

      {/* SVG gauge — scales to fill container up to 180px */}
      <div className="relative z-10 flex items-center justify-center w-full">
        <div className="relative w-full max-w-[180px]">
          <svg
            viewBox={`0 0 ${VB_SIZE} ${VB_SIZE}`}
            className="-rotate-90 w-full h-auto"
            aria-hidden
          >
            <defs>
              {/* Red → blue arc gradient matching the brand palette */}
              <linearGradient
                id={gradientId}
                x1="0" y1="0" x2={VB_SIZE} y2={VB_SIZE}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%"   stopColor="oklch(0.68 0.22 25)" />   {/* brand-red-400 */}
                <stop offset="55%"  stopColor="oklch(0.55 0.25 25)" />   {/* brand-red-500 */}
                <stop offset="100%" stopColor="oklch(0.58 0.22 264)" />  {/* brand-blue-500 */}
              </linearGradient>

              {/* Layered glow filter */}
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

            {/* Animated filled arc */}
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

          {/* Centered score content — rotated back 90° to cancel parent -rotate-90 */}
          <div className="absolute inset-0 rotate-90 flex flex-col items-center justify-center gap-0.5">
            <span
              className="text-5xl sm:text-6xl lg:text-7xl font-black tabular-nums leading-none text-foreground"
              style={{
                textShadow: [
                  "0 0 15px oklch(0.55 0.25 25 / 0.7)",
                  "0 0 35px oklch(0.55 0.25 25 / 0.4)",
                  "0 0 65px oklch(0.55 0.25 25 / 0.2)",
                ].join(", "),
              }}
            >
              {score}
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground leading-none">/100</span>
          </div>
        </div>
      </div>

      {/* Tier label */}
      <div className="relative z-10 flex flex-col items-center gap-1.5">
        <span className={cn("text-base font-bold tracking-tight", tier.color)}>
          {tier.label}
        </span>
        <div className="h-px w-16 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* AI summary */}
      <p className="relative z-10 text-xs text-muted-foreground text-center leading-relaxed max-w-[28ch] sm:max-w-[22ch]">
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
