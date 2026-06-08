"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
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

  // Section 1: Hero (0% - 15%)
  const section1Opacity = getOpacity(progress, 0, 0, 0.1, 0.15);
  // Section 2: Explosion Left Text (15% - 40%)
  const section2Opacity = getOpacity(progress, 0.15, 0.2, 0.35, 0.4);
  // Section 3: Core Focus Right Text (40% - 65%)
  const section3Opacity = getOpacity(progress, 0.4, 0.45, 0.6, 0.65);
  // Section 4: Personalization Rings (65% - 85%)
  const section4Opacity = getOpacity(progress, 0.65, 0.7, 0.8, 0.85);
  // Section 5: Reassembled Final (85% - 100%)
  const section5Opacity = getOpacity(progress, 0.85, 0.9, 1.0, 1.0);

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
            
            {/* 1. Hero Assembled (0-15%) */}
            <div 
              id="overview"
              className="absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-75"
              style={{ 
                opacity: section1Opacity,
                transform: `translateY(${(1 - section1Opacity) * -20}px)`,
                pointerEvents: section1Opacity > 0.5 ? 'auto' : 'none'
              }}
            >
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#00D6FF] mb-6 glow-cyan">
                Meet ClarityAI
              </h2>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white/90 mb-6 drop-shadow-2xl">
                Interview with clarity.<br />
                Land with <span className="text-gradient-cyan">confidence.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/60 max-w-2xl font-medium tracking-wide">
                Upload your audio or record live. ClarityAI uses advanced AI to
                score your communication, count filler words, and rewrite your answers instantly.
              </p>
            </div>

            {/* 2. Explosion Left (15-40%) */}
            <div 
              id="technology"
              className="absolute inset-y-0 left-6 lg:left-8 flex flex-col justify-center max-w-lg transition-all duration-75"
              style={{ 
                opacity: section2Opacity,
                transform: `translateY(${(1 - section2Opacity) * 20}px)`,
                pointerEvents: section2Opacity > 0.5 ? 'auto' : 'none'
              }}
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white/90 mb-6 drop-shadow-xl">
                Built on real<br/>
                <span className="text-gradient-blue">intelligence.</span>
              </h2>
              <div className="space-y-6 border-l border-white/10 pl-6">
                <p className="text-lg text-white/60 leading-relaxed font-medium">
                  Every session is analyzed in real time — your answers, your tone, your pacing.
                </p>
                <p className="text-lg text-white/60 leading-relaxed font-medium">
                  ClarityAI doesn&apos;t just listen.<br />
                  <span className="text-white/90">It understands.</span>
                </p>
              </div>
            </div>

            {/* 3. Core Engine Right (40-65%) */}
            <div 
              id="how-it-works"
              className="absolute inset-y-0 right-6 lg:right-8 flex flex-col justify-center max-w-lg text-right transition-all duration-75"
              style={{ 
                opacity: section3Opacity,
                transform: `translateY(${(1 - section3Opacity) * 20}px)`,
                pointerEvents: section3Opacity > 0.5 ? 'auto' : 'none'
              }}
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white/90 mb-6 drop-shadow-xl">
                Feedback that<br/>
                actually <span className="text-gradient-cyan">means</span> something.
              </h2>
              <div className="space-y-6 border-r border-white/10 pr-6">
                <p className="text-lg text-white/60 leading-relaxed font-medium">
                  Record your interview or upload audio. ClarityAI leverages advanced AI to analyze your pacing, filler words, and narrative structure.
                </p>
                <p className="text-lg text-white/60 leading-relaxed font-medium">
                  Identifies patterns in your responses that hold you back.
                </p>
                <p className="text-lg text-[#00D6FF] font-semibold tracking-wide">
                  Providing instant feedback and rewritten model answers.
                </p>
              </div>
            </div>

            {/* 4. Personalization Center-ish (65-85%) */}
            <div 
              id="features"
              className="absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-75"
              style={{ 
                opacity: section4Opacity,
                transform: `scale(${0.95 + section4Opacity * 0.05})`,
                pointerEvents: section4Opacity > 0.5 ? 'auto' : 'none'
              }}
            >
              <div className="apple-glass rounded-3xl p-10 md:p-16 max-w-3xl mx-auto border border-white/10 shadow-2xl">
                <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white/90 mb-8">
                  Your coach.<br/>
                  Your pace.<br/>
                  <span className="text-gradient-blue">Your goals.</span>
                </h2>
                <p className="text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
                  Adaptive question sets and role-specific interview tracks. 
                  The AI adjusts to your experience level and target industry, 
                  pushing you exactly where you need to grow.
                </p>
              </div>
            </div>

            {/* 5. Final CTA Reassembled (85-100%) */}
            <div 
              className="absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-75"
              style={{ 
                opacity: section5Opacity,
                transform: `translateY(${(1 - section5Opacity) * 20}px)`,
                pointerEvents: section5Opacity > 0.5 ? 'auto' : 'none'
              }}
            >
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white/90 mb-6 drop-shadow-2xl">
                Stop practicing blind.<br />
                Start interviewing with <span className="text-gradient-cyan">clarity.</span>
              </h2>
              <p className="text-xl text-white/60 max-w-2xl font-medium tracking-wide mb-12">
                ClarityAI. Built for candidates who refuse to leave it to chance.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "btn-gradient-border glow-cyan px-8 h-14 text-base font-semibold transition-all hover:scale-105"
                  )}
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2 opacity-80" />
                </Link>
                
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors"
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
            <span className="text-sm font-bold tracking-tight text-white/80">
              ClarityAI
            </span>
            <div className="flex items-center gap-8 text-xs font-medium text-white/40">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <span>&copy; {new Date().getFullYear()} ClarityAI Inc. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
