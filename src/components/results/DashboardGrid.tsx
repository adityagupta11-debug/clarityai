"use client";

import { MessageSquare, BookOpen, BarChart2, ShieldCheck, Layout } from "lucide-react";
import { cn } from "@/lib/utils";
import { getScoreTier } from "@/lib/utils/formatting";
import { OverallScore } from "./OverallScore";
import { StrengthsWeaknesses } from "./StrengthsWeaknesses";
import { CategoryGrid } from "./CategoryGrid";
import { QuestionBreakdown } from "./QuestionBreakdown";
import { SpeechMetrics } from "./SpeechMetrics";
import type { SerializedAnalysis, SerializedInterview } from "@/app/interview/[id]/results/page";

interface DashboardGridProps {
  interview: SerializedInterview;
  analysis:  SerializedAnalysis;
}

// ── Category mini-cards ───────────────────────────────────────────────────────
// These will be replaced by full <CategoryCard> components in the next step.

const CATEGORY_META = [
  { key: "communication", label: "Communication", icon: MessageSquare, description: "Clarity and articulation of ideas." },
  { key: "vocabulary",    label: "Vocabulary",    icon: BookOpen,      description: "Use of professional industry terms." },
  { key: "relevance",     label: "Relevance",     icon: BarChart2,     description: "Directness and focus on the topic." },
  { key: "confidence",    label: "Confidence",    icon: ShieldCheck,   description: "Assertiveness and absence of filler words." },
  { key: "structure",     label: "Structure",     icon: Layout,        description: "Logical flow and framework usage." },
] as const;

function CategoryMiniCard({
  icon: Icon,
  label,
  description,
  score,
}: {
  icon:        React.ComponentType<{ className?: string }>;
  label:       string;
  description: string;
  score:       number;
}) {
  const tier   = getScoreTier(score);
  const r      = 22;
  const sw     = 5;
  const circ   = 2 * Math.PI * r;
  const cx     = r + sw / 2 + 2;
  const dim    = cx * 2;

  const stroke =
    tier.label === "Excellent" ? "oklch(0.74 0.13 160)" :
    tier.label === "Good"      ? "oklch(0.72 0.12 185)" :
    tier.label === "Fair"      ? "oklch(0.78 0.13 70)"  :
                                 "oklch(0.66 0.12 35)";

  return (
    <div className="dash-card h-full bg-muted dark:bg-white/[0.03] backdrop-blur-xl border border-border dark:border-white/8 rounded-xl p-4 flex flex-col items-center gap-2.5 hover:bg-accent dark:hover:bg-white/[0.05]">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />

      {/* Mini score ring */}
      <div className="relative flex items-center justify-center">
        <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} className="-rotate-90">
          <circle
            cx={cx} cy={cx} r={r}
            fill="none" stroke="currentColor" strokeWidth={sw}
            className="text-foreground/10 dark:text-white/8"
          />
          <circle
            cx={cx} cy={cx} r={r}
            fill="none" stroke={stroke} strokeWidth={sw}
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * circ} ${circ}`}
            style={{ filter: `drop-shadow(0 0 4px ${stroke})` }}
          />
        </svg>
        <span className="absolute text-sm font-bold tabular-nums">{score}</span>
      </div>

      <span className="text-[11px] font-medium text-muted-foreground text-center leading-tight">
        {label}
      </span>
      <span className={cn("text-[10px] font-semibold", tier.color)}>
        {tier.label}
      </span>

      {/* Contextual description — subtle, wraps to 1–2 lines */}
      <p className="text-[11px] leading-snug text-muted-foreground dark:text-white/40 text-center text-balance">
        {description}
      </p>
    </div>
  );
}

// ── DashboardGrid ─────────────────────────────────────────────────────────────

export function DashboardGrid({ analysis }: DashboardGridProps) {
  return (
    <div className="font-serif mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">

      {/* ── Row 1: Overall score gauge + category mini-cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Overall score spans 1 col */}
        <OverallScore
          score={analysis.overallScore}
          summary={analysis.summary}
          modelUsed={analysis.modelUsed}
        />

        {/* Category mini-cards span 2 cols */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORY_META.map(({ key, label, icon, description }) => (
            <CategoryMiniCard
              key={key}
              icon={icon}
              label={label}
              description={description}
              score={analysis.categories[key].score}
            />
          ))}
        </div>
      </div>

      {/* ── Row 2: Strengths & Weaknesses ── */}
      <StrengthsWeaknesses
        strengths={analysis.strengths}
        weaknesses={analysis.weaknesses}
      />

      {/* ── Row 3: Category deep-dive cards ── */}
      <CategoryGrid categories={analysis.categories} />

      {/* ── Row 4: Speech metrics ── */}
      <SpeechMetrics metrics={analysis.speechMetrics} />

      {/* ── Row 5: Question deep-dive accordion ── */}
      <QuestionBreakdown questions={analysis.questionBreakdown} />

    </div>
  );
}
