"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Brain,
  Target,
  Zap,
  Layout,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getScoreTier } from "@/lib/utils/formatting";
import { Progress } from "@/components/ui/progress";
import type {
  CommunicationScore,
  VocabularyScore,
  RelevanceScore,
  ConfidenceScore,
  StructureScore,
} from "@/types/analysis";

// ── Per-category static config ────────────────────────────────────────────────
// Every style value here is a static string so Tailwind's JIT scanner
// can include the classes at build time without dynamic class-name generation.

const CONFIG = {
  communication: {
    icon:        MessageSquare,
    label:       "Communication",
    description: "Clarity, conciseness & articulation",
    iconBg:      "bg-violet-500/15 border-violet-500/25",
    iconColor:   "text-violet-400",
    barClass:    "[&_[data-slot=progress-indicator]]:bg-violet-500 [&_[data-slot=progress-indicator]]:duration-700",
    hoverBorder: "hover:border-violet-500/30",
    hoverShadow: "hover:shadow-[0_16px_48px_oklch(0.606_0.25_293/0.15)]",
    barColor:    "oklch(0.606 0.25 293)",
  },
  vocabulary: {
    icon:        Brain,
    label:       "Vocabulary",
    description: "Sophistication, industry terms & precision",
    iconBg:      "bg-blue-500/15 border-blue-500/25",
    iconColor:   "text-blue-400",
    barClass:    "[&_[data-slot=progress-indicator]]:bg-blue-500 [&_[data-slot=progress-indicator]]:duration-700",
    hoverBorder: "hover:border-blue-500/30",
    hoverShadow: "hover:shadow-[0_16px_48px_oklch(0.55_0.22_264/0.15)]",
    barColor:    "oklch(0.55 0.22 264)",
  },
  relevance: {
    icon:        Target,
    label:       "Relevance",
    description: "Direct answering & minimal tangents",
    iconBg:      "bg-teal-500/15 border-teal-500/25",
    iconColor:   "text-teal-400",
    barClass:    "[&_[data-slot=progress-indicator]]:bg-teal-500 [&_[data-slot=progress-indicator]]:duration-700",
    hoverBorder: "hover:border-teal-500/30",
    hoverShadow: "hover:shadow-[0_16px_48px_oklch(0.6_0.15_185/0.15)]",
    barColor:    "oklch(0.6 0.15 185)",
  },
  confidence: {
    icon:        Zap,
    label:       "Confidence",
    description: "Assertiveness & absence of hedging",
    iconBg:      "bg-amber-500/15 border-amber-500/25",
    iconColor:   "text-amber-400",
    barClass:    "[&_[data-slot=progress-indicator]]:bg-amber-500 [&_[data-slot=progress-indicator]]:duration-700",
    hoverBorder: "hover:border-amber-500/30",
    hoverShadow: "hover:shadow-[0_16px_48px_oklch(0.75_0.15_80/0.15)]",
    barColor:    "oklch(0.75 0.15 80)",
  },
  structure: {
    icon:        Layout,
    label:       "Structure",
    description: "Logical flow & STAR framework usage",
    iconBg:      "bg-emerald-500/15 border-emerald-500/25",
    iconColor:   "text-emerald-400",
    barClass:    "[&_[data-slot=progress-indicator]]:bg-emerald-500 [&_[data-slot=progress-indicator]]:duration-700",
    hoverBorder: "hover:border-emerald-500/30",
    hoverShadow: "hover:shadow-[0_16px_48px_oklch(0.72_0.17_160/0.15)]",
    barColor:    "oklch(0.72 0.17 160)",
  },
} as const;

type CategoryKey = keyof typeof CONFIG;

// ── Shared primitives ─────────────────────────────────────────────────────────

/** Animated main score bar — starts at 0, fills to `score` after `delay` ms */
function AnimatedBar({
  score,
  barClass,
  delay,
}: {
  score:    number;
  barClass: string;
  delay:    number;
}) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setVal(score), delay);
    return () => clearTimeout(t);
  }, [score, delay]);

  return (
    <Progress
      value={val}
      className={cn(
        "[&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:bg-white/8 [&_[data-slot=progress-track]]:rounded-full",
        barClass
      )}
    />
  );
}

/** Thin labelled sub-metric bar — plain div for full colour control */
function MiniBar({
  label,
  value,
  color,
  delay,
}: {
  label: string;
  value: number;
  color: string;
  delay: number;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-muted-foreground w-24 shrink-0">{label}</span>
      <div className="flex-1 h-1 rounded-full bg-white/8 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[11px] font-medium tabular-nums text-muted-foreground w-5 text-right">
        {value}
      </span>
    </div>
  );
}

/** Sophistication / assertiveness level dot-progression indicator */
function LevelDots({
  level,
  options,
  colors,
}: {
  level:   string;
  options: readonly string[];
  colors:  readonly string[];
}) {
  const idx = options.indexOf(level);
  return (
    <div className="flex items-center gap-1.5">
      {options.map((opt, i) => (
        <div
          key={opt}
          title={opt}
          className={cn(
            "h-2 w-2 rounded-full transition-all",
            i <= idx ? "scale-100" : "scale-75 opacity-20"
          )}
          style={i <= idx ? { backgroundColor: colors[i] } : { backgroundColor: "oklch(1 0 0 / 0.15)" }}
        />
      ))}
      <span className="ml-1.5 text-xs font-semibold capitalize">{level}</span>
    </div>
  );
}

/** Small pill chip */
function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium",
        className
      )}
    >
      {children}
    </span>
  );
}

// ── Category-specific sub-metric sections ─────────────────────────────────────

function CommunicationSubMetrics({
  data,
  color,
  delay,
}: {
  data:  CommunicationScore;
  color: string;
  delay: number;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        Sub-scores
      </p>
      <MiniBar label="Clarity"      value={data.clarity}      color={color} delay={delay + 100} />
      <MiniBar label="Conciseness"  value={data.conciseness}  color={color} delay={delay + 200} />
      <MiniBar label="Articulation" value={data.articulation} color={color} delay={delay + 300} />
    </div>
  );
}

function VocabularySubMetrics({ data }: { data: VocabularyScore }) {
  const SOPHISTICATION_OPTIONS = ["basic", "intermediate", "advanced", "expert"] as const;
  const SOPHISTICATION_COLORS  = [
    "oklch(0.6 0.05 240)",   // grey-blue
    "oklch(0.55 0.22 264)",  // blue
    "oklch(0.606 0.25 293)", // violet
    "oklch(0.78 0.18 60)",   // gold
  ];

  return (
    <div className="space-y-4">
      {/* Sophistication level */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Sophistication
        </p>
        <LevelDots
          level={data.sophisticationLevel}
          options={SOPHISTICATION_OPTIONS}
          colors={SOPHISTICATION_COLORS}
        />
      </div>

      {/* Industry terms */}
      {data.industryTermsUsed.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Industry terms used
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.industryTermsUsed.slice(0, 5).map((term) => (
              <Chip key={term} className="border-blue-500/25 text-blue-300 bg-blue-500/8">
                {term}
              </Chip>
            ))}
            {data.industryTermsUsed.length > 5 && (
              <Chip className="border-white/15 text-muted-foreground">
                +{data.industryTermsUsed.length - 5}
              </Chip>
            )}
          </div>
        </div>
      )}

      {/* Overused words */}
      {data.overusedWords.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Overused
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.overusedWords.slice(0, 3).map(({ word, count }) => (
              <Chip key={word} className="border-rose-500/25 text-rose-400 bg-rose-500/8">
                {word}
                <span className="ml-1 opacity-60">×{count}</span>
              </Chip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RelevanceSubMetrics({
  data,
  color,
  delay,
}: {
  data:  RelevanceScore;
  color: string;
  delay: number;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Q&A alignment
        </p>
        <MiniBar
          label="Alignment"
          value={data.questionResponseAlignment}
          color={color}
          delay={delay + 100}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Off-topic tangents
        </p>
        <div className="flex items-center gap-1.5">
          {data.tangentCount === 0 ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400">None detected</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-amber-400">
                {data.tangentCount} {data.tangentCount === 1 ? "tangent" : "tangents"}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ConfidenceSubMetrics({ data }: { data: ConfidenceScore }) {
  const ASSERTIVENESS_OPTIONS = ["low", "moderate", "high"] as const;
  const ASSERTIVENESS_COLORS  = [
    "oklch(0.65 0.22 25)",  // red
    "oklch(0.78 0.18 60)",  // amber
    "oklch(0.72 0.17 160)", // emerald
  ];

  return (
    <div className="space-y-4">
      {/* Assertiveness level */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Assertiveness
        </p>
        <LevelDots
          level={data.assertivenessLevel}
          options={ASSERTIVENESS_OPTIONS}
          colors={ASSERTIVENESS_COLORS}
        />
      </div>

      {/* Hedging phrases */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Hedging phrases detected
        </p>
        {data.hedgingPhrases.length === 0 ? (
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">None — great confidence!</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {data.hedgingPhrases.slice(0, 4).map((phrase) => (
              <Chip key={phrase} className="border-amber-500/25 text-amber-400 bg-amber-500/8 italic">
                &ldquo;{phrase}&rdquo;
              </Chip>
            ))}
            {data.hedgingPhrases.length > 4 && (
              <Chip className="border-white/15 text-muted-foreground">
                <ChevronRight className="h-2.5 w-2.5 mr-0.5" />
                {data.hedgingPhrases.length - 4} more
              </Chip>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StructureSubMetrics({ data }: { data: StructureScore }) {
  const total = data.structuredResponses + data.unstructuredResponses;
  const pct   = total > 0 ? Math.round((data.structuredResponses / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* STAR method */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          STAR method
        </p>
        {data.usedSTAR ? (
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">Used</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <XCircle className="h-3.5 w-3.5 text-rose-400" />
            <span className="text-xs font-semibold text-rose-400">Not used</span>
          </div>
        )}
      </div>

      {/* Framework detected */}
      {data.usedFramework && (
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Framework
          </p>
          <Chip className="border-emerald-500/25 text-emerald-300 bg-emerald-500/8">
            {data.usedFramework}
          </Chip>
        </div>
      )}

      {/* Structured vs unstructured ratio */}
      {total > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Structured responses
            </p>
            <span className="text-xs font-bold text-emerald-400 tabular-nums">{pct}%</span>
          </div>
          <div className="flex gap-1 h-2">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-sm",
                  i < data.structuredResponses ? "bg-emerald-500" : "bg-rose-500/40"
                )}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
            <span>{data.structuredResponses} structured</span>
            <span>{data.unstructuredResponses} unstructured</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Score header ──────────────────────────────────────────────────────────────

function ScoreHeader({
  score,
  config,
}: {
  score:  number;
  config: (typeof CONFIG)[CategoryKey];
}) {
  const tier = getScoreTier(score);
  const Icon = config.icon;

  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="flex items-center gap-3">
        {/* Category icon */}
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
            config.iconBg
          )}
        >
          <Icon className={cn("h-5 w-5", config.iconColor)} />
        </div>

        <div>
          <h3 className="text-sm font-semibold leading-none mb-0.5">{config.label}</h3>
          <p className="text-[11px] text-muted-foreground">{config.description}</p>
        </div>
      </div>

      {/* Score + tier */}
      <div className="shrink-0 text-right">
        <p className="text-2xl font-black tabular-nums leading-none">{score}</p>
        <p className={cn("text-[11px] font-semibold mt-0.5", tier.color)}>{tier.label}</p>
      </div>
    </div>
  );
}

// ── Category card ─────────────────────────────────────────────────────────────

type CategoryScores = {
  communication: CommunicationScore;
  vocabulary:    VocabularyScore;
  relevance:     RelevanceScore;
  confidence:    ConfidenceScore;
  structure:     StructureScore;
};

function CategoryCard({
  categoryKey,
  data,
  index,
}: {
  categoryKey: CategoryKey;
  data:        CategoryScores[CategoryKey];
  index:       number;
}) {
  const config = CONFIG[categoryKey];
  const delay  = 150 + index * 100; // staggered entrance

  return (
    <div
      className={cn(
        "glass border border-white/8 rounded-2xl p-5 flex flex-col gap-5",
        "transition-all duration-200 ease-out",
        "hover:-translate-y-1 hover:scale-[1.008] hover:border-white/14",
        config.hoverBorder,
        config.hoverShadow
      )}
    >
      {/* Header: icon + name + score */}
      <ScoreHeader score={data.score} config={config} />

      {/* Animated main progress bar */}
      <AnimatedBar
        score={data.score}
        barClass={config.barClass}
        delay={delay}
      />

      {/* AI feedback */}
      <p className="text-xs text-muted-foreground leading-relaxed">
        {data.feedback}
      </p>

      {/* Divider */}
      <div className="h-px bg-white/6" />

      {/* Category-specific sub-metrics */}
      {categoryKey === "communication" && (
        <CommunicationSubMetrics
          data={data as CommunicationScore}
          color={config.barColor}
          delay={delay}
        />
      )}
      {categoryKey === "vocabulary" && (
        <VocabularySubMetrics data={data as VocabularyScore} />
      )}
      {categoryKey === "relevance" && (
        <RelevanceSubMetrics
          data={data as RelevanceScore}
          color={config.barColor}
          delay={delay}
        />
      )}
      {categoryKey === "confidence" && (
        <ConfidenceSubMetrics data={data as ConfidenceScore} />
      )}
      {categoryKey === "structure" && (
        <StructureSubMetrics data={data as StructureScore} />
      )}
    </div>
  );
}

// ── Public export ─────────────────────────────────────────────────────────────

interface CategoryGridProps {
  categories: {
    communication: CommunicationScore;
    vocabulary:    VocabularyScore;
    relevance:     RelevanceScore;
    confidence:    ConfidenceScore;
    structure:     StructureScore;
  };
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const keys = Object.keys(CONFIG) as CategoryKey[];

  return (
    <section aria-label="Category Breakdown">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Category Breakdown
        </h2>
        <div className="h-px flex-1 bg-white/8" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {keys.map((key, i) => (
          <CategoryCard
            key={key}
            categoryKey={key}
            data={categories[key]}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
