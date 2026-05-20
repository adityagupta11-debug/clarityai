import Link from "next/link";
import { type Route } from "next";
import {
  Mic,
  Brain,
  MessageSquare,
  BarChart2,
  Zap,
  Upload,
  ChevronRight,
  CheckCircle2,
  Star,
  ArrowRight,
  Volume2,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// ── Inline Landing Navbar ─────────────────────────────────────────────────────
function LandingNav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/6"
      style={{ background: "oklch(0.09 0.025 35 / 0.85)", backdropFilter: "blur(20px)" }}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-red glow-red-sm transition-transform group-hover:scale-105">
            <Mic className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="gradient-text-brand">Clarity</span>
            <span className="text-white/80">AI</span>
          </span>
        </Link>

        {/* Links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
        </div>

        {/* CTA */}
        <Link
          href="/signup"
          className={cn(
            buttonVariants({ size: "sm" }),
            "gradient-red glow-red-sm hover:opacity-90 transition-opacity hidden sm:flex"
          )}
        >
          Get Started Free
        </Link>
        {/* Mobile CTA */}
        <Link href="/signup" className="sm:hidden text-sm font-semibold text-red-400">
          Sign up
        </Link>
      </div>
    </nav>
  );
}

// ── Mock Score Card (hero visual) ─────────────────────────────────────────────
function MockScoreCard() {
  const categories = [
    { label: "Communication", score: 88, color: "#e53e3e" },
    { label: "Vocabulary",    score: 79, color: "#4299e1" },
    { label: "Confidence",    score: 82, color: "#d69e2e" },
    { label: "Structure",     score: 91, color: "#48bb78" },
  ];

  const r = 38, sw = 7, circ = 2 * Math.PI * r;
  const cx = r + sw / 2 + 4, dim = cx * 2;
  const fill = (87 / 100) * circ;

  return (
    <div
      className="glass-moka rounded-2xl p-5 w-72 sm:w-80 animate-float"
      style={{ boxShadow: "0 24px 64px oklch(0 0 0 / 0.5), 0 0 0 1px oklch(1 0 0 / 0.08)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-white/90">Product Manager</p>
          <p className="text-[10px] text-white/40">Google · Behavioral</p>
        </div>
        <span className="status-completed text-[10px] px-2 py-0.5">Completed</span>
      </div>

      {/* Score + categories */}
      <div className="flex items-center gap-5">
        {/* Score ring */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} className="-rotate-90">
            <defs>
              <linearGradient id="hero-ring" x1="0" y1="0" x2={dim} y2={dim} gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="oklch(0.68 0.22 25)" />
                <stop offset="100%" stopColor="oklch(0.65 0.20 264)" />
              </linearGradient>
            </defs>
            <circle cx={cx} cy={cx} r={r} fill="none" stroke="oklch(1 0 0 / 0.07)" strokeWidth={sw} />
            <circle cx={cx} cy={cx} r={r} fill="none" stroke="url(#hero-ring)" strokeWidth={sw}
              strokeLinecap="round"
              strokeDasharray={`${fill} ${circ}`}
              style={{ filter: "drop-shadow(0 0 6px oklch(0.68 0.22 25 / 0.7))" }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-xl font-black leading-none text-white">87</span>
            <span className="text-[9px] text-white/40">/100</span>
          </div>
        </div>

        {/* Category mini-bars */}
        <div className="flex-1 space-y-2">
          {categories.map(({ label, score, color }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-[10px] text-white/50 w-20 shrink-0 truncate">{label}</span>
              <div className="flex-1 h-1 rounded-full bg-white/8">
                <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color, opacity: 0.85 }} />
              </div>
              <span className="text-[10px] font-bold text-white/70 w-5 text-right">{score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI insight teaser */}
      <div className="mt-4 rounded-lg px-3 py-2 text-[10px] text-white/60 leading-relaxed"
        style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.07)" }}>
        <span className="text-red-400 font-semibold">AI: </span>
        Strong STAR usage. Reduce hedging phrases like "I think maybe…"
      </div>
    </div>
  );
}

// ── Features data ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon:    Brain,
    title:   "AI-Powered Scoring",
    desc:    "Gemini 2.5 Flash evaluates every response across 5 categories — communication, vocabulary, confidence, relevance, and structure.",
    accent:  "red",
    iconBg:  "bg-red-500/15 border-red-500/25",
    iconClr: "text-red-400",
    glow:    "hover:shadow-[0_16px_40px_oklch(0.55_0.25_25/0.15)] hover:border-red-500/25",
  },
  {
    icon:    Volume2,
    title:   "Filler Word Tracker",
    desc:    `Every "um", "like", and "you know" is caught and counted. See your speaking pace, longest pause, and total filler word frequency.`,
    accent:  "blue",
    iconBg:  "bg-blue-500/15 border-blue-500/25",
    iconClr: "text-blue-400",
    glow:    "hover:shadow-[0_16px_40px_oklch(0.58_0.22_264/0.15)] hover:border-blue-500/25",
  },
  {
    icon:    MessageSquare,
    title:   "Question Deep Dive",
    desc:    "For every question the interviewer asked, see your answer side-by-side with an AI-rewritten ideal response.",
    accent:  "amber",
    iconBg:  "bg-amber-500/15 border-amber-500/25",
    iconClr: "text-amber-400",
    glow:    "hover:shadow-[0_16px_40px_oklch(0.75_0.15_60/0.15)] hover:border-amber-500/25",
  },
  {
    icon:    TrendingUp,
    title:   "Track Your Progress",
    desc:    "Every interview is saved. Watch your scores improve over time and identify your persistent weak spots with historical data.",
    accent:  "emerald",
    iconBg:  "bg-emerald-500/15 border-emerald-500/25",
    iconClr: "text-emerald-400",
    glow:    "hover:shadow-[0_16px_40px_oklch(0.72_0.17_160/0.15)] hover:border-emerald-500/25",
  },
] as const;

// ── How It Works steps ────────────────────────────────────────────────────────
const STEPS = [
  {
    n:     "01",
    icon:  Upload,
    title: "Upload or Record",
    desc:  "Drop in any audio file (MP3, M4A, WAV, WebM) or record directly in the browser. No special equipment needed.",
    clr:   "text-red-400",
    bg:    "bg-red-500/12 border-red-500/20",
  },
  {
    n:     "02",
    icon:  Brain,
    title: "AI Analyzes Everything",
    desc:  "AssemblyAI transcribes with speaker labels. Gemini 2.5 Flash scores every response and generates coaching feedback.",
    clr:   "text-blue-400",
    bg:    "bg-blue-500/12 border-blue-500/20",
  },
  {
    n:     "03",
    icon:  Zap,
    title: "Get Actionable Feedback",
    desc:  "Detailed scores, rewritten answers, speech metrics, and prioritized suggestions — all in under 3 minutes.",
    clr:   "text-amber-400",
    bg:    "bg-amber-500/12 border-amber-500/20",
  },
] as const;

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div
      className="min-h-screen text-white overflow-x-hidden"
      style={{ background: "oklch(0.09 0.025 35)" }}
    >
      <LandingNav />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">

        {/* Ambient orbs */}
        <div className="absolute -top-1/4 -left-1/4 w-[70vw] h-[70vw] max-w-3xl rounded-full animate-drift pointer-events-none"
          style={{ background: "radial-gradient(circle, oklch(0.55 0.25 25 / 0.10) 0%, transparent 65%)" }} />
        <div className="absolute -bottom-1/4 -right-1/4 w-[60vw] h-[60vw] max-w-2xl rounded-full animate-drift-slow pointer-events-none"
          style={{ background: "radial-gradient(circle, oklch(0.58 0.22 264 / 0.10) 0%, transparent 65%)" }} />
        <div className="absolute top-1/3 left-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, oklch(0.38 0.05 35 / 0.12) 0%, transparent 70%)" }} />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left: copy */}
            <div className="text-center lg:text-left">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-4 py-1.5 text-xs font-semibold text-red-400 mb-8">
                <Star className="h-3 w-3 fill-red-400" />
                Powered by Gemini 2.5 Flash · Free to start
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.06] mb-6">
                Stop Second-Guessing
                <br />
                <span className="gradient-text-brand">Yourself</span>{" "}
                <span className="text-white">in Interviews.</span>
              </h1>

              {/* Sub */}
              <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-10">
                Upload any recording. Our AI scores your{" "}
                <span className="text-red-400 font-medium">communication</span>,{" "}
                <span className="text-blue-400 font-medium">confidence</span>, and{" "}
                <span className="text-amber-400 font-medium">structure</span> — then
                rewrites a perfect answer for every single question.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "gradient-red glow-red hover:opacity-90 transition-opacity px-8 h-13 text-base font-bold"
                  )}
                >
                  Start Practicing Free
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
                <a
                  href="#how-it-works"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "border-white/15 hover:border-white/30 hover:bg-white/5 h-13 px-8 text-base text-white/80"
                  )}
                >
                  See How It Works
                </a>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 text-sm text-white/40">
                {["No credit card", "100 hrs free analysis", "Results in &lt; 3 min"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/70" />
                    <span dangerouslySetInnerHTML={{ __html: t }} />
                  </span>
                ))}
              </div>
            </div>

            {/* Right: mock card */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Outer glow */}
                <div className="absolute inset-0 rounded-3xl blur-3xl opacity-30 scale-110"
                  style={{ background: "linear-gradient(135deg, oklch(0.55 0.25 25 / 0.5), oklch(0.58 0.22 264 / 0.4))" }} />
                <MockScoreCard />
                {/* Floating badge */}
                <div
                  className="absolute -top-3 -right-3 sm:-right-6 glass-moka rounded-xl px-3 py-2 text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-float-delayed"
                  style={{ boxShadow: "0 8px 24px oklch(0 0 0 / 0.3)" }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  87/100 — Great!
                </div>
                {/* Floating speech chip */}
                <div
                  className="absolute -bottom-3 -left-3 sm:-left-6 glass-moka rounded-xl px-3 py-2 text-xs text-white/70 flex items-center gap-1.5 animate-float-reverse"
                  style={{ boxShadow: "0 8px 24px oklch(0 0 0 / 0.3)" }}
                >
                  <Volume2 className="h-3.5 w-3.5 text-blue-400" />
                  142 WPM · 3 filler words
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, oklch(0.09 0.025 35))" }} />
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <section className="border-y border-white/6" style={{ background: "oklch(0.11 0.03 35 / 0.6)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-3 divide-x divide-white/6 text-center">
            {[
              { value: "5",          label: "Categories Scored",        accent: "text-red-400" },
              { value: "< 3 min",    label: "Average Results Time",     accent: "text-blue-400" },
              { value: "100 hrs",    label: "Free Tier Analysis",       accent: "text-amber-400" },
            ].map(({ value, label, accent }) => (
              <div key={label} className="px-4 py-2 sm:px-8">
                <p className={cn("text-2xl sm:text-3xl font-black tabular-nums", accent)}>{value}</p>
                <p className="text-xs sm:text-sm text-white/40 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/50 mb-4">
              Everything You Need
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
              Built for Candidates Who{" "}
              <span className="gradient-text-brand">Want to Win</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto text-base sm:text-lg">
              Same feedback a £200/hr interview coach gives — delivered in minutes, not days.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, iconBg, iconClr, glow }) => (
              <div
                key={title}
                className={cn(
                  "glass-moka rounded-2xl p-6 flex flex-col gap-4",
                  "transition-all duration-200 hover:-translate-y-1 hover:border-white/15",
                  glow
                )}
              >
                <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl border", iconBg)}>
                  <Icon className={cn("h-5 w-5", iconClr)} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
                  <p className="text-xs text-white/50 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 sm:py-32 relative overflow-hidden">
        {/* Subtle moka bg */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, oklch(0.14 0.03 35 / 0.6) 0%, transparent 70%)" }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/50 mb-4">
              Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
              From Recording to{" "}
              <span className="gradient-text-brand">Results</span> in Minutes
            </h2>
            <p className="text-white/50 max-w-lg mx-auto">
              Three steps. No setup. No waiting days for a coach to respond.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
            {/* Connecting line — desktop only */}
            <div className="hidden md:block absolute top-10 left-[calc(33%+1rem)] right-[calc(33%+1rem)] h-px"
              style={{ background: "linear-gradient(90deg, oklch(0.55 0.25 25 / 0.4), oklch(0.58 0.22 264 / 0.4))" }} />

            {STEPS.map(({ n, icon: Icon, title, desc, clr, bg }, i) => (
              <div key={n} className="relative">
                {/* Card */}
                <div className="glass-moka rounded-2xl p-6 sm:p-8 h-full flex flex-col gap-5">
                  {/* Step number + icon */}
                  <div className="flex items-center gap-4">
                    <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border", bg)}>
                      <Icon className={cn("h-6 w-6", clr)} />
                    </div>
                    <span className="text-4xl font-black text-white/8 tabular-nums">{n}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
                  </div>

                  {/* Connector arrow — mobile only */}
                  {i < 2 && (
                    <div className="flex md:hidden justify-center mt-2">
                      <ChevronRight className="h-5 w-5 text-white/20 rotate-90" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAND ─────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 border-y border-white/6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-white/30 mb-10">
            What candidates say
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                quote: "I bombed my first PM interview. After using ClarityAI for 2 weeks I got an offer from my dream company. The per-question feedback is genuinely eye-opening.",
                name:  "Sarah K.",
                role:  "Product Manager",
                score: "+29 pts",
              },
              {
                quote: "I didn't realise I said 'basically' 47 times in one interview until this showed me. Now I'm hyper aware. My last mock scored 91.",
                name:  "David M.",
                role:  "Software Engineer",
                score: "+34 pts",
              },
              {
                quote: "The improved answer feature alone is worth it. Seeing exactly how to restructure my STAR responses changed my whole approach.",
                name:  "Priya N.",
                role:  "Business Analyst",
                score: "+22 pts",
              },
            ].map(({ quote, name, role, score }) => (
              <div key={name} className="glass-moka rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-white/65 leading-relaxed italic">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <p className="text-xs font-semibold text-white">{name}</p>
                    <p className="text-[10px] text-white/40">{role}</p>
                  </div>
                  <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
                    {score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 80% at 50% 50%, oklch(0.20 0.06 25 / 0.35) 0%, transparent 70%)",
          }} />

        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="glass-moka rounded-3xl p-10 sm:p-14"
            style={{ boxShadow: "0 0 80px oklch(0.55 0.25 25 / 0.12), 0 0 0 1px oklch(1 0 0 / 0.08)" }}>
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl gradient-red glow-red mb-6">
              <Mic className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
              Your next offer starts with{" "}
              <span className="gradient-text-brand">one recording.</span>
            </h2>
            <p className="text-white/50 mb-10 text-base sm:text-lg max-w-lg mx-auto">
              Free forever on the starter plan. No credit card. No catch.
              Just honest, AI-powered feedback on your interviews.
            </p>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "gradient-red glow-red hover:opacity-90 transition-opacity px-10 h-14 text-base font-bold"
              )}
            >
              Start Practicing for Free
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
            <p className="mt-4 text-xs text-white/30">
              Already have an account?{" "}
              <Link href="/login" className="text-white/50 hover:text-white transition-colors underline underline-offset-2">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/6 py-10"
        style={{ background: "oklch(0.07 0.02 35)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md gradient-red">
                <Mic className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-bold">
                <span className="gradient-text-brand">Clarity</span>
                <span className="text-white/50">AI</span>
              </span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-xs text-white/35">
              <a href="#features" className="hover:text-white/70 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white/70 transition-colors">How It Works</a>
              <Link href="/login" className="hover:text-white/70 transition-colors">Sign In</Link>
              <Link href="/signup" className="hover:text-white/70 transition-colors">Sign Up</Link>
            </div>

            <p className="text-xs text-white/25">
              &copy; {new Date().getFullYear()} ClarityAI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
