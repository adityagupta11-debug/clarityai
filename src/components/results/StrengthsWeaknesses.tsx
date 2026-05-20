"use client";

import {
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Target,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Insight } from "@/types/analysis";

// ── Impact badge ──────────────────────────────────────────────────────────────

const IMPACT_STYLES: Record<Insight["impact"], string> = {
  high:   "bg-rose-500/15   text-rose-400   border-rose-500/25",
  medium: "bg-amber-500/15  text-amber-400  border-amber-500/25",
  low:    "bg-sky-500/15    text-sky-400    border-sky-500/25",
};

const IMPACT_LABELS: Record<Insight["impact"], string> = {
  high:   "High impact",
  medium: "Medium impact",
  low:    "Low impact",
};

function ImpactBadge({ impact }: { impact: Insight["impact"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        IMPACT_STYLES[impact]
      )}
    >
      {IMPACT_LABELS[impact]}
    </span>
  );
}

// ── Single insight card ───────────────────────────────────────────────────────

interface InsightCardProps {
  insight:  Insight;
  variant:  "strength" | "weakness";
  index:    number;
}

function InsightCard({ insight, variant, index }: InsightCardProps) {
  const isStrength = variant === "strength";

  const borderAccent  = isStrength ? "border-l-emerald-500/50" : "border-l-rose-500/50";
  const quoteBg       = isStrength ? "bg-emerald-500/6 border-emerald-500/20" : "bg-rose-500/6 border-rose-500/20";
  const quoteBar      = isStrength ? "border-l-emerald-500/60" : "border-l-rose-500/60";
  const numberColor   = isStrength ? "text-emerald-500/60" : "text-rose-500/60";

  return (
    <div
      className={cn(
        "group rounded-xl border border-white/8 bg-white/2 p-5 transition-all duration-200",
        "hover:border-white/14 hover:bg-white/4",
        "border-l-2", borderAccent
      )}
    >
      {/* Number + title row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <span className={cn("text-xs font-black tabular-nums", numberColor)}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <h4 className="text-sm font-semibold text-foreground leading-snug">
            {insight.title}
          </h4>
        </div>
        <ArrowUpRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-40 transition-opacity mt-0.5",
            isStrength ? "text-emerald-400" : "text-rose-400"
          )}
        />
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
        {insight.description}
      </p>

      {/* Evidence blockquote — direct transcript quote */}
      <blockquote
        className={cn(
          "rounded-r-lg border-l-2 px-4 py-3 mb-4",
          quoteBg, quoteBar
        )}
      >
        <p className="text-xs italic text-foreground/65 leading-relaxed">
          &ldquo;{insight.evidence}&rdquo;
        </p>
      </blockquote>

      {/* Impact badge */}
      <ImpactBadge impact={insight.impact} />
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  variant: "strength" | "weakness";
  count:   number;
}

function SectionHeader({ variant, count }: SectionHeaderProps) {
  const isStrength = variant === "strength";

  const Icon        = isStrength ? CheckCircle2 : AlertCircle;
  const SubIcon     = isStrength ? TrendingUp   : Target;
  const title       = isStrength ? "Key Strengths"      : "Areas to Improve";
  const subtitle    = isStrength ? "What you did well"  : "Opportunities for growth";
  const iconColor   = isStrength ? "text-emerald-400"   : "text-rose-400";
  const iconBg      = isStrength
    ? "bg-emerald-500/15 border-emerald-500/25"
    : "bg-rose-500/15    border-rose-500/25";
  const countColor  = isStrength ? "text-emerald-400"   : "text-rose-400";
  const countBg     = isStrength
    ? "bg-emerald-500/10 border-emerald-500/20"
    : "bg-rose-500/10    border-rose-500/20";

  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        {/* Icon cluster */}
        <div className={cn("relative flex h-9 w-9 items-center justify-center rounded-xl border", iconBg)}>
          <Icon className={cn("h-4 w-4", iconColor)} />
          <SubIcon
            className={cn(
              "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full p-0.5",
              isStrength
                ? "bg-emerald-500/30 text-emerald-300"
                : "bg-rose-500/30    text-rose-300"
            )}
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      {/* Count pill */}
      <span
        className={cn(
          "rounded-full border px-2.5 py-0.5 text-xs font-bold tabular-nums",
          countColor, countBg
        )}
      >
        {count}
      </span>
    </div>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

interface StrengthsWeaknessesProps {
  strengths:  Insight[];
  weaknesses: Insight[];
}

export function StrengthsWeaknesses({ strengths, weaknesses }: StrengthsWeaknessesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* Strengths column */}
      <section
        className="glass border border-white/8 rounded-2xl p-6"
        aria-label="Key Strengths"
      >
        <SectionHeader variant="strength" count={strengths.length} />
        <div className="space-y-4">
          {strengths.map((insight, i) => (
            <InsightCard
              key={`strength-${i}`}
              insight={insight}
              variant="strength"
              index={i}
            />
          ))}
          {strengths.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">
              No strengths identified.
            </p>
          )}
        </div>
      </section>

      {/* Weaknesses column */}
      <section
        className="glass border border-white/8 rounded-2xl p-6"
        aria-label="Areas to Improve"
      >
        <SectionHeader variant="weakness" count={weaknesses.length} />
        <div className="space-y-4">
          {weaknesses.map((insight, i) => (
            <InsightCard
              key={`weakness-${i}`}
              insight={insight}
              variant="weakness"
              index={i}
            />
          ))}
          {weaknesses.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">
              No areas for improvement identified.
            </p>
          )}
        </div>
      </section>

    </div>
  );
}
