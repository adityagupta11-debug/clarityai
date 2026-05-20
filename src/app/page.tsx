import Link from "next/link";
import {
  Mic,
  Sparkles,
  BarChart3,
  MessageSquare,
  Brain,
  Shield,
  Zap,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description:
      "Gemini Flash evaluates your communication, confidence, structure, and vocabulary with nuanced, actionable feedback.",
  },
  {
    icon: MessageSquare,
    title: "Speaker Diarization",
    description:
      "AssemblyAI separates interviewer and candidate voices, giving you a clean, timestamped transcript with speaker labels.",
  },
  {
    icon: BarChart3,
    title: "Detailed Scoring",
    description:
      "5-category scoring with per-question breakdowns, filler word detection, speaking pace, and STAR framework analysis.",
  },
  {
    icon: Zap,
    title: "Results in Minutes",
    description:
      "Upload your recording and get comprehensive AI analysis in under 5 minutes, not days of manual review.",
  },
  {
    icon: Shield,
    title: "Private & Secure",
    description:
      "Your recordings and transcripts are stored securely in Firebase. Only you can access your interview data.",
  },
  {
    icon: Sparkles,
    title: "Improved Answers",
    description:
      "Get AI-rewritten versions of your answers — see exactly how to phrase responses more effectively.",
  },
];

const categories = [
  { name: "Communication", color: "bg-violet-500", score: 85 },
  { name: "Vocabulary", color: "bg-blue-500", score: 78 },
  { name: "Confidence", color: "bg-emerald-500", score: 72 },
  { name: "Structure", color: "bg-amber-500", score: 88 },
  { name: "Relevance", color: "bg-pink-500", score: 80 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col ambient-bg">
      <Navbar />

      <main className="flex-1 relative z-10">
        {/* ── Hero ── */}
        <section className="px-4 pt-24 pb-20 text-center">
          <div className="mx-auto max-w-4xl">
            <Badge
              variant="outline"
              className="mb-6 border-violet-500/30 bg-violet-500/10 text-violet-300 px-4 py-1.5 text-xs font-medium"
            >
              <Sparkles className="h-3 w-3 mr-1.5" />
              AI-Powered Interview Coach
            </Badge>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Ace every{" "}
              <span className="gradient-text">interview</span>
              <br />
              with AI feedback
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload your interview recording and get instant, detailed analysis of your
              communication, confidence, vocabulary, and structure — powered by Gemini AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "gradient-violet glow-violet hover:opacity-90 transition-opacity px-8 h-12 text-base font-semibold"
                )}
              >
                Get started free
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-white/15 hover:border-white/30 hover:bg-white/5 h-12 px-8 text-base"
                )}
              >
                Sign in
              </Link>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Free forever · No credit card required · 100 hours of analysis included
            </p>
          </div>
        </section>

        {/* ── Score preview card ── */}
        <section className="px-4 pb-24">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl glass border border-white/10 overflow-hidden">
              {/* Mock results header */}
              <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium">Senior PM Interview · Google</span>
                </div>
                <Badge className="status-completed text-xs">Completed</Badge>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
                {/* Overall score gauge */}
                <div className="sm:col-span-2 flex flex-col items-center justify-center py-4">
                  <div className="relative flex h-32 w-32 items-center justify-center">
                    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50" cy="50" r="42"
                        fill="none" stroke="currentColor" strokeWidth="8"
                        className="text-white/5"
                      />
                      <circle
                        cx="50" cy="50" r="42"
                        fill="none"
                        stroke="oklch(0.606 0.25 293)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 42 * 0.82} ${2 * Math.PI * 42}`}
                      />
                    </svg>
                    <div className="text-center">
                      <span className="text-3xl font-bold">82</span>
                      <span className="text-xs text-muted-foreground block">/100</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-violet-300 mt-2">Overall Score</p>
                </div>

                {/* Category scores */}
                <div className="sm:col-span-3 space-y-3">
                  {categories.map(({ name, color, score }) => (
                    <div key={name} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-24 shrink-0">{name}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/5">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
                      </div>
                      <span className="text-xs font-medium w-6 text-right">{score}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths */}
              <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {["Strong STAR structure", "Industry vocabulary", "Confident delivery"].map((s) => (
                  <div
                    key={s}
                    className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/8 rounded-lg px-3 py-2 border border-emerald-500/15"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="px-4 pb-24">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Everything you need to{" "}
                <span className="gradient-text">level up</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                ClarityAI gives you the same feedback a professional coach would — in minutes, not hours.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map(({ icon: Icon, title, description }) => (
                <Card key={title} className="glass border-white/8 hover-lift">
                  <CardHeader className="pb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/15 border border-violet-500/20 mb-3">
                      <Icon className="h-5 w-5 text-violet-400" />
                    </div>
                    <CardTitle className="text-base">{title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="px-4 pb-24">
          <div className="mx-auto max-w-2xl text-center">
            <div className="rounded-2xl glass border border-violet-500/20 p-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-violet glow-violet mx-auto mb-6">
                <Mic className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Ready to get started?
              </h2>
              <p className="text-muted-foreground mb-8">
                Join thousands of candidates who use ClarityAI to prepare for their dream jobs.
              </p>
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "gradient-violet glow-violet hover:opacity-90 transition-opacity px-10 h-12 text-base font-semibold"
                )}
              >
                Analyze your first interview free
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
