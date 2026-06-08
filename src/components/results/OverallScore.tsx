"use client";

import { useEffect, useRef, useState, useId } from "react";
import { cn } from "@/lib/utils";
import { getScoreTier } from "@/lib/utils/formatting";

// ── Gauge geometry ────────────────────────────────────────────────────────────
// Defined in viewBox units — the SVG scales via CSS, so these are logical units,
// not pixel dimensions. Using a 180-unit viewBox keeps the maths simple.
const R            = 72;
const SW           = 7;
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

  // ── Collapsible feedback ──
  // Collapsed height fits ~4 lines of text-sm/leading-relaxed (≈ 5.5rem).
  const COLLAPSED_REM = 5.5;
  const summaryRef = useRef<HTMLParagraphElement>(null);
  const [isFeedbackExpanded, setIsFeedbackExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // Only show the toggle when the feedback actually exceeds the collapsed height.
  useEffect(() => {
    const el = summaryRef.current;
    if (!el) return;
    const measure = () =>
      setIsOverflowing(el.scrollHeight > COLLAPSED_REM * 16 + 2);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [summary]);

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
    <div className="dash-card h-full relative flex flex-col items-center gap-3 bg-white/[0.03] backdrop-blur-xl border border-white/8 rounded-xl p-4 overflow-hidden">

      {/* Ambient glow — soft electric cyan */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(0,214,255,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Label */}
      <p className="relative z-10 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Overall Score
      </p>

      {/* SVG gauge — scales to fill container up to 180px */}
      <div className="relative z-10 flex items-center justify-center w-full">
        <div className="relative w-full max-w-[120px]">
          <svg
            viewBox={`0 0 ${VB_SIZE} ${VB_SIZE}`}
            className="-rotate-90 w-full h-auto"
            aria-hidden
          >
            <defs>
              {/* Cyan → blue arc gradient matching the brand palette */}
              <linearGradient
                id={gradientId}
                x1="0" y1="0" x2={VB_SIZE} y2={VB_SIZE}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%"   stopColor="#00D6FF" />   {/* brand-cyan */}
                <stop offset="100%" stopColor="#0050FF" />   {/* brand-blue */}
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
            />
          </svg>

          {/* Centered score content — sits upright over the rotated gauge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <span
              className="text-3xl sm:text-4xl font-black tabular-nums leading-none text-foreground"
              style={{
                textShadow: "0 0 18px rgba(0,214,255,0.25)",
              }}
            >
              {score}
            </span>
            <span className="text-[10px] text-muted-foreground leading-none">/100</span>
          </div>
        </div>
      </div>

      {/* Tier label */}
      <div className="relative z-10 flex flex-col items-center gap-1.5">
        <span className={cn("text-sm font-bold tracking-tight", tier.color)}>
          {tier.label}
        </span>
        <div className="h-px w-16 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* AI summary — truncated with a smooth expand toggle */}
      <div className="relative z-10 w-full max-w-[28ch] sm:max-w-[22ch]">
        <div
          className="relative overflow-hidden transition-[max-height] duration-500 ease-in-out"
          style={{
            maxHeight: isFeedbackExpanded ? "40rem" : `${COLLAPSED_REM}rem`,
            // Clean fade-out at the truncation point while collapsed
            ...(!isFeedbackExpanded && isOverflowing
              ? {
                  maskImage: "linear-gradient(to bottom, black 68%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, black 68%, transparent 100%)",
                }
              : {}),
          }}
        >
          <p
            ref={summaryRef}
            className="text-sm text-muted-foreground text-center leading-relaxed"
          >
            {summary}
          </p>
        </div>

        {isOverflowing && (
          <button
            type="button"
            onClick={() => setIsFeedbackExpanded((v) => !v)}
            aria-expanded={isFeedbackExpanded}
            className="mx-auto mt-2 block text-[11px] font-medium text-muted-foreground/80 underline decoration-white/20 underline-offset-4 transition-colors hover:text-foreground hover:decoration-white/50"
          >
            {isFeedbackExpanded ? "View Less" : "Read Full Feedback"}
          </button>
        )}
      </div>

      {/* AI badge — generic, no vendor/model leak */}
      {modelUsed && (
        <div className="relative z-10 flex items-center gap-1.5 rounded-full border border-white/8 bg-white/4 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00D6FF] animate-pulse" />
          <span className="text-[10px] text-muted-foreground font-medium">AI-powered analysis</span>
        </div>
      )}
    </div>
  );
}
