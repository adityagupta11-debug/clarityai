"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, PlayCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { LandingNav } from "@/components/layout/LandingNav";
import { ScrollyTellingCanvas } from "@/components/layout/ScrollyTellingCanvas";

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId = 0;
    let ticking = false;

    const compute = () => {
      ticking = false;
      if (!containerRef.current) return;

      // Calculate scroll progress through the container.
      // Top of container enters the top of viewport: progress = 0
      // Bottom of container leaves the bottom of viewport: progress = 1
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const distanceScrolled = -rect.top;
      const totalScrollableDistance = rect.height - viewportHeight;

      let p = distanceScrolled / totalScrollableDistance;
      p = Math.max(0, Math.min(1, p)); // Clamp between 0 and 1

      setProgress(p);
    };

    // Coalesce bursts of scroll events into a single update per frame
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      rafId = requestAnimationFrame(compute);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check
    compute();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Helper to calculate opacity based on start, peak, and end points of a section
  const getOpacity = (
    currentProgress: number,
    startIn: number,
    fullyIn: number,
    startOut: number,
    fullyOut: number
  ) => {
    if (currentProgress <= startIn || currentProgress >= fullyOut) return 0;
    if (currentProgress >= fullyIn && currentProgress <= startOut) return 1;
    if (currentProgress > startIn && currentProgress < fullyIn) {
      return (currentProgress - startIn) / (fullyIn - startIn);
    }
    if (currentProgress > startOut && currentProgress < fullyOut) {
      return 1 - (currentProgress - startOut) / (fullyOut - startOut);
    }
    return 0;
  };

  // Brand intro: the ClarityAI wordmark shown the instant you land (progress 0),
  // sitting over the background logo. It holds, then fades as you start scrolling,
  // cross-dissolving into the hero below.
  const introOpacity =
    progress <= 0.03 ? 1 : progress >= 0.1 ? 0 : 1 - (progress - 0.03) / 0.07;

  // Crossfade windows are gently overlapped so one section is always easing in
  // as the previous eases out — no dead frames, no hard cuts.
  // Section 1: Hero (fades in as the intro fades out)
  const section1Opacity = getOpacity(progress, 0.05, 0.11, 0.13, 0.18);
  // Section 2: Technology (plateau ~0.27)
  const section2Opacity = getOpacity(progress, 0.13, 0.21, 0.34, 0.4);
  // Section 3: How It Works (plateau ~0.52)
  const section3Opacity = getOpacity(progress, 0.4, 0.47, 0.59, 0.65);
  // Section 4: Features (plateau ~0.75)
  const section4Opacity = getOpacity(progress, 0.64, 0.71, 0.8, 0.86);
  // Section 5: Final CTA
  const section5Opacity = getOpacity(progress, 0.85, 0.91, 1.0, 1.0);

  return (
    <div className="bg-[#050505] text-white selection:bg-[#00D6FF]/20">
      <LandingNav />

      {/* The massive scroll container (500vh gives enough room to scroll slowly) */}
      <div id="scrolly-container" ref={containerRef} className="relative h-[600vh]">
        
        {/* The Sticky Viewport */}
        <div className="sticky top-0 h-screen w-full overflow-hidden hero-radial-glow">
          
          {/* Canvas Background Animation */}
          <ScrollyTellingCanvas progress={progress} />

          {/* Grain overlay for cinematic film feel */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
          />

          {/* Content Overlays */}
          <div className="absolute inset-0 z-10 mx-auto max-w-7xl px-6 lg:px-8">
            
            {/* 0. Brand Intro — first thing on landing, dissolves into the hero on scroll */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none transition-[opacity,transform] duration-300 ease-out"
              style={{
                opacity: introOpacity,
                transform: `scale(${1 + (1 - introOpacity) * 0.06})`,
              }}
            >
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight text-white drop-shadow-2xl animate-title-breathe">
                ClarityAI
              </h1>
              <div className="mt-12 flex flex-col items-center gap-3 text-body-cyan-dim">
                <span className="text-[10px] uppercase tracking-[0.3em] font-semibold">
                  Scroll to explore
                </span>
                <ChevronDown className="h-5 w-5 text-cyan-accent animate-bounce" />
              </div>
            </div>

            {/* 1. Hero Assembled */}
            <div
              id="overview"
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-2 transition-[opacity,transform] duration-300 ease-out"
              style={{
                opacity: section1Opacity,
                transform: `translateY(${(1 - section1Opacity) * -20}px)`,
                pointerEvents: section1Opacity > 0.5 ? 'auto' : 'none'
              }}
            >
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-cyan-accent mb-6">
                Meet <span className="text-white">ClarityAI</span>
              </h2>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6 drop-shadow-2xl">
                Interview with clarity.<br />
                Land with <span className="text-cyan-accent">confidence.</span>
              </h1>
              <p className="text-lg md:text-xl text-body-cyan max-w-2xl font-medium tracking-wide">
                Upload your audio or record live. <span className="text-white">ClarityAI</span> uses advanced AI to
                score your communication, count filler words, and rewrite your answers instantly.
              </p>
            </div>

            {/* 2. Technology */}
            <div
              id="technology"
              className="absolute inset-y-0 left-0 right-0 sm:right-auto flex flex-col justify-center w-full sm:max-w-xl px-2 sm:px-0 transition-[opacity,transform] duration-300 ease-out"
              style={{
                opacity: section2Opacity,
                transform: `translateY(${(1 - section2Opacity) * 20}px)`,
                pointerEvents: section2Opacity > 0.5 ? 'auto' : 'none'
              }}
            >
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-cyan-accent mb-4">
                The Technology
              </h2>
              <h3 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 drop-shadow-xl">
                Built on real<br />
                <span className="text-cyan-accent">intelligence.</span>
              </h3>
              <p className="text-lg text-body-cyan leading-relaxed font-medium mb-8">
                The moment you speak, <span className="text-white">ClarityAI</span> analyzes your
                delivery in real time — turning raw audio into a precise, structured read of how you
                actually communicate under pressure.
              </p>
              <div className="space-y-4 border-l rule-cyan pl-6">
                <div>
                  <p className="text-base font-semibold text-cyan-accent">Voice &amp; Tone</p>
                  <p className="text-base text-body-cyan-dim leading-relaxed">
                    Detects confidence, warmth, and conviction in your delivery — flagging where you
                    sound uncertain or rushed.
                  </p>
                </div>
                <div>
                  <p className="text-base font-semibold text-cyan-accent">Pacing &amp; Rhythm</p>
                  <p className="text-base text-body-cyan-dim leading-relaxed">
                    Tracks words-per-minute and pause patterns to keep you clear and composed, never
                    racing or trailing off.
                  </p>
                </div>
                <div>
                  <p className="text-base font-semibold text-cyan-accent">Filler-Word Detection</p>
                  <p className="text-base text-body-cyan-dim leading-relaxed">
                    Counts every &ldquo;um,&rdquo; &ldquo;like,&rdquo; and &ldquo;you know&rdquo; in
                    real time, so you can hear exactly what&apos;s diluting your message.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. How It Works */}
            <div
              id="how-it-works"
              className="absolute inset-y-0 left-0 right-0 sm:left-auto flex flex-col justify-center w-full sm:max-w-xl ml-auto px-2 sm:px-0 text-right transition-[opacity,transform] duration-300 ease-out"
              style={{
                opacity: section3Opacity,
                transform: `translateY(${(1 - section3Opacity) * 20}px)`,
                pointerEvents: section3Opacity > 0.5 ? 'auto' : 'none'
              }}
            >
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-cyan-accent mb-4">
                How It Works
              </h2>
              <h3 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 drop-shadow-xl">
                Feedback that<br />
                actually <span className="text-cyan-accent">means</span> something.
              </h3>
              <div className="space-y-6 border-r rule-cyan pr-6">
                <p className="text-lg text-body-cyan leading-relaxed font-medium">
                  Record your interview or upload audio. <span className="text-white">ClarityAI</span> leverages
                  advanced AI to analyze your pacing, filler words, and narrative structure.
                </p>
                <p className="text-lg text-body-cyan leading-relaxed font-medium">
                  It surfaces the patterns in your responses that quietly hold you back.
                </p>
                <p className="text-lg text-cyan-accent font-semibold tracking-wide">
                  Then delivers instant feedback and rewritten model answers.
                </p>
              </div>
            </div>

            {/* 4. Features */}
            <div
              id="features"
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 transition-[opacity,transform] duration-300 ease-out"
              style={{
                opacity: section4Opacity,
                transform: `scale(${0.96 + section4Opacity * 0.04})`,
                pointerEvents: section4Opacity > 0.5 ? 'auto' : 'none'
              }}
            >
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-cyan-accent mb-6">
                Features
              </h2>
              <h3 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-8 leading-[1.1] drop-shadow-2xl">
                Your coach.<br />
                Your pace.<br />
                <span className="text-cyan-accent">Your goals.</span>
              </h3>
              <p className="text-lg md:text-xl text-body-cyan max-w-2xl mx-auto leading-relaxed font-medium tracking-wide">
                Adaptive question sets and role-specific interview tracks. The AI adjusts to your
                experience level and target industry, pushing you exactly where you need to grow.
              </p>
            </div>

            {/* 5. Final CTA */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 transition-[opacity,transform] duration-300 ease-out"
              style={{
                opacity: section5Opacity,
                transform: `translateY(${(1 - section5Opacity) * 20}px)`,
                pointerEvents: section5Opacity > 0.5 ? 'auto' : 'none'
              }}
            >
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 drop-shadow-2xl">
                Stop practicing blind.<br />
                Start interviewing with <span className="text-white">clarity.</span>
              </h2>
              <p className="text-xl text-body-cyan max-w-2xl font-medium tracking-wide mb-12">
                <span className="text-white">ClarityAI</span> — built for candidates who refuse to leave it to chance.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "btn-premium breathe-btn px-8 h-14 text-base font-semibold"
                  )}
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>

                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="breathe-link flex items-center gap-2 text-sm font-medium text-body-cyan"
                >
                  <PlayCircle className="h-5 w-5" />
                  See how it works
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* ── FOOTER (Normal scroll flow after the sticky section) ── */}
      <footer className="bg-[#050505] border-t border-white/5 py-12 relative z-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <span className="text-sm font-bold tracking-tight text-white">
              ClarityAI
            </span>
            <div className="flex items-center gap-8 text-xs font-medium text-body-cyan-dim">
              <a href="#" className="breathe-link">Privacy Policy</a>
              <a href="#" className="breathe-link">Terms of Service</a>
              <span>&copy; {new Date().getFullYear()} ClarityAI Inc. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
