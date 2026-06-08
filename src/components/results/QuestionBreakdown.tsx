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
import { ExpandableText } from "./ExpandableText";

// ── Helpers ───────────────────────────────────────────────────────────────────

function QuestionScore({ score }: { score: number }) {
  const tier = getScoreTier(score);
  const bg =
    tier.label === "Excellent" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" :
    tier.label === "Good"      ? "bg-teal-500/15   border-teal-500/30   text-teal-300"     :
    tier.label === "Fair"      ? "bg-amber-500/15  border-amber-500/30  text-amber-300"    :
                                 "bg-rose-500/15   border-rose-500/30   text-rose-300";

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-semibold shrink-0", bg)}>
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
      <div className="tactile flex-1 rounded-xl bg-white/4 border border-white/8 p-4">
        <p className="text-base text-foreground/70 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function ImprovedPanel({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-[#00D6FF] shrink-0" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#00D6FF]">
          How to Improve
        </span>
      </div>

      {/* Gradient-border card — inset shadow fakes a 1px gradient border */}
      <div
        className="flex-1 rounded-xl p-4"
        style={{
          background:  "linear-gradient(135deg, rgba(0,214,255,0.06), rgba(0,80,255,0.06))",
          boxShadow:   "inset 0 0 0 1px rgba(0,214,255,0.25), 0 0 24px rgba(0,214,255,0.08)",
        }}
      >
        {/* Subtle AI badge */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00D6FF] animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#00D6FF]/80">
            AI-enhanced response
          </span>
        </div>
        <p className="text-base text-foreground/90 leading-relaxed font-[450]">{text}</p>
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
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00D6FF]/15 text-[10px] font-black text-[#00D6FF] mt-0.5">
          {index + 1}
        </span>

        {/* Question text */}
        <span className="flex-1 text-base font-medium leading-snug text-foreground pr-2">
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
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(qa.timeSpent)}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Target className="h-3.5 w-3.5" />
              Relevance: <span className="font-semibold ml-0.5">{qa.relevanceScore}</span>
            </span>
          </div>

          {/* AI feedback */}
          <div className="tactile rounded-lg bg-white/4 border border-white/8 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
              Feedback
            </p>
            <ExpandableText
              text={qa.feedback}
              className="text-base text-foreground/80 leading-relaxed"
            />
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
        <div className="dash-card bg-white/[0.03] backdrop-blur-xl border border-white/8 rounded-2xl p-10 text-center text-muted-foreground text-base">
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
        className="bg-white/[0.03] backdrop-blur-xl border border-white/8 rounded-2xl p-3"
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
      <h2 className="text-base font-semibold text-muted-foreground uppercase tracking-wide">
        Question Deep Dive
      </h2>
      {count > 0 && (
        <span className="rounded-full border border-[#00D6FF]/25 bg-[#00D6FF]/10 px-2 py-0.5 text-sm font-bold text-[#00D6FF]">
          {count} questions
        </span>
      )}
      <div className="h-px flex-1 bg-white/8" />
    </div>
  );
}
