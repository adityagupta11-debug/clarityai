"use client";

import { MessageSquare, Sparkles, Clock, Target, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getScoreTier, formatDuration } from "@/lib/utils/formatting";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import type { QuestionAnalysis } from "@/types/analysis";

// ── Helpers ───────────────────────────────────────────────────────────────────

function QuestionScore({ score }: { score: number }) {
  const tier = getScoreTier(score);
  const bg =
    tier.label === "Excellent" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" :
    tier.label === "Good"      ? "bg-teal-500/15   border-teal-500/30   text-teal-300"     :
    tier.label === "Fair"      ? "bg-amber-500/15  border-amber-500/30  text-amber-300"    :
                                 "bg-rose-500/15   border-rose-500/30   text-rose-300";

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold shrink-0", bg)}>
      <span className="tabular-nums font-black">{score}</span>
      <span className="opacity-70">· {tier.label}</span>
    </span>
  );
}

// ── Response panels ───────────────────────────────────────────────────────────

function ResponsePanel({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          What You Said
        </span>
      </div>
      <div className="flex-1 rounded-xl bg-white/4 border border-white/8 p-4">
        <p className="text-sm text-foreground/70 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function ImprovedPanel({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-red-400 shrink-0" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-red-400">
          How to Improve
        </span>
      </div>

      {/* Gradient-border card — inset shadow fakes a 1px gradient border */}
      <div
        className="flex-1 rounded-xl p-4"
        style={{
          background:  "linear-gradient(135deg, oklch(0.55 0.25 25 / 0.07), oklch(0.48 0.22 15 / 0.07))",
          boxShadow:   "inset 0 0 0 1px oklch(0.55 0.25 25 / 0.30), 0 0 24px oklch(0.55 0.25 25 / 0.10)",
        }}
      >
        {/* Subtle AI badge */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-red-400/80">
            AI-enhanced response
          </span>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed font-[450]">{text}</p>
      </div>
    </div>
  );
}

// ── Accordion item ────────────────────────────────────────────────────────────

interface QuestionItemProps {
  qa:    QuestionAnalysis;
  index: number;
}

function QuestionItem({ qa, index }: QuestionItemProps) {
  const value = `q-${index}`;

  return (
    <AccordionItem
      value={value}
      className="border-white/8 rounded-xl mb-3 last:mb-0 overflow-hidden"
    >
      {/* Trigger ──────────────────────────────────────────────────────────── */}
      <AccordionTrigger
        className={cn(
          "flex items-start gap-3 px-5 py-4 text-left hover:no-underline group",
          "hover:bg-white/3 transition-colors rounded-xl"
        )}
      >
        {/* Question index badge */}
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-[10px] font-black text-red-300 mt-0.5">
          {index + 1}
        </span>

        {/* Question text */}
        <span className="flex-1 text-sm font-medium leading-snug text-foreground pr-2">
          {qa.question}
        </span>

        {/* Score chip + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <QuestionScore score={qa.score} />
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-aria-expanded:rotate-180" />
        </div>
      </AccordionTrigger>

      {/* Content ───────────────────────────────────────────────────────────── */}
      <AccordionContent className="px-5">
        <div className="space-y-5 pt-1 pb-5">

          {/* Meta chips row */}
          <div className="flex flex-wrap items-center gap-3">
            {qa.timeSpent > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(qa.timeSpent)}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Target className="h-3.5 w-3.5" />
              Relevance: <span className="font-semibold ml-0.5">{qa.relevanceScore}</span>
            </span>
          </div>

          {/* AI feedback */}
          <div className="rounded-lg bg-white/4 border border-white/8 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
              Feedback
            </p>
            <p className="text-sm text-foreground/80 leading-relaxed">{qa.feedback}</p>
          </div>

          {/* Side-by-side response panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ResponsePanel text={qa.response} />
            <ImprovedPanel text={qa.improvedResponse} />
          </div>

        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// ── Public export ─────────────────────────────────────────────────────────────

interface QuestionBreakdownProps {
  questions: QuestionAnalysis[];
}

export function QuestionBreakdown({ questions }: QuestionBreakdownProps) {
  if (questions.length === 0) {
    return (
      <section aria-label="Question Breakdown">
        <SectionHeader count={0} />
        <div className="glass border border-white/8 rounded-2xl p-10 text-center text-muted-foreground text-sm">
          No individual questions were identified in the transcript.
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Question Breakdown">
      <SectionHeader count={questions.length} />

      <Accordion
        multiple
        defaultValue={["q-0"]}
        className="glass border border-white/8 rounded-2xl p-3"
      >
        {questions.map((qa, i) => (
          <QuestionItem key={i} qa={qa} index={i} />
        ))}
      </Accordion>
    </section>
  );
}

function SectionHeader({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Question Deep Dive
      </h2>
      {count > 0 && (
        <span className="rounded-full border border-red-500/25 bg-red-500/10 px-2 py-0.5 text-xs font-bold text-red-400">
          {count} questions
        </span>
      )}
      <div className="h-px flex-1 bg-white/8" />
    </div>
  );
}
