import Link from "next/link";
import type { Metadata } from "next";
import { Mic, Activity, Sparkles, TrendingUp, ChevronDown } from "lucide-react";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = { title: "Sign Up" };

const FLOW_STEPS = [
  {
    icon: Mic,
    title: "Record or Upload",
    body: "Speak your answer live or drop in an audio file — ClarityAI takes it from there.",
  },
  {
    icon: Activity,
    title: "Real-Time Analysis",
    body: "AI reads your voice, tone, and pacing while counting every filler word as you talk.",
  },
  {
    icon: Sparkles,
    title: "Instant Feedback",
    body: "Get a clarity score and rewritten model answers within seconds of finishing.",
  },
  {
    icon: TrendingUp,
    title: "Track Your Growth",
    body: "Watch confidence, pacing, and clarity climb across every practice session.",
  },
];

export default function SignupPage() {
  return (
    <div className="min-h-screen flex w-full bg-[#050505] text-white selection:bg-[#00D6FF]/20">
      {/* ── Left Panel — Interactive floating flowchart (hidden on mobile) ── */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 p-12 relative overflow-hidden border-r border-white/5 bg-[#050505]">
        {/* Ambient cyan backdrop */}
        <div className="absolute inset-0 hero-radial-glow opacity-40" />
        <div className="absolute -left-24 top-1/3 w-72 h-72 bg-[#00D6FF]/10 rounded-full blur-[120px]" />

        <div className="relative z-10 mx-auto w-full max-w-md">
          {/* Brand — breathes + floats as one block */}
          <div className="float-breathe mb-12">
            <Link href="/" className="block w-fit mb-3">
              <span className="text-4xl font-bold tracking-tight text-gradient-cyan animate-title-breathe">
                ClarityAI
              </span>
            </Link>
            <p className="text-sm uppercase tracking-[0.3em] font-semibold text-cyan-accent">
              How it works
            </p>
          </div>

          {/* Flowchart */}
          <div className="flex flex-col items-stretch">
            {FLOW_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title}>
                  {/* Idle breathe+float wrapper (outer); hover-lift lives on the card */}
                  <div className="float-breathe" style={{ animationDelay: `${i * 0.6}s` }}>
                    <div className="flow-card rounded-2xl p-5 flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00D6FF]/10 border border-[#00D6FF]/25">
                        <Icon className="h-5 w-5 text-cyan-accent" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-white mb-1">{step.title}</p>
                        <p className="text-sm text-body-cyan leading-relaxed">{step.body}</p>
                      </div>
                    </div>
                  </div>

                  {/* Connector between steps */}
                  {i < FLOW_STEPS.length - 1 && (
                    <div className="flex justify-center py-2">
                      <ChevronDown className="h-4 w-4 text-cyan-accent/60" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Right Panel — Action ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 relative hero-radial-glow">
        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="flex justify-center mb-10 lg:hidden">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-bold tracking-tight text-gradient-cyan animate-title-breathe">
                ClarityAI
              </span>
            </Link>
          </div>

          {/* Ambient cyan glow — no box around the form */}
          <div className="absolute -top-20 -right-10 w-56 h-56 bg-[#00D6FF]/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="float-breathe relative z-10" style={{ animationDelay: "0.4s" }}>
            <SignupForm />
          </div>
        </div>
      </div>
    </div>
  );
}
