import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = { title: "Sign Up" };

export default function SignupPage() {
  return (
    <div className="min-h-screen flex w-full bg-[#050505] text-white selection:bg-[#00D6FF]/20">
      {/* ── Left Panel — Brand & Visuals (hidden on mobile) ── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden border-r border-white/5 bg-[#050505]">
        {/* Stunning still frame from the WebP sequence */}
        <Image
          src="/sequence/frame_130_delay-0.2s.webp"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        {/* Legibility + cinematic overlays */}
        <div className="absolute inset-0 bg-[#050505]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/60" />
        <div className="absolute inset-0 hero-radial-glow opacity-30" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 w-fit group">
            <span className="text-xl font-bold tracking-tight text-white/90 transition-opacity group-hover:opacity-80">
              ClarityAI
            </span>
          </Link>
        </div>

        {/* Fading value props */}
        <div className="relative z-10 max-w-lg mt-auto">
          <h2 className="text-4xl font-bold tracking-tight text-white/90 mb-6 leading-tight drop-shadow-xl">
            Elevate your interview game.
          </h2>
          <div className="space-y-4 border-l border-white/10 pl-6 mb-12">
            <p className="text-lg text-white/60 font-medium">
              Join thousands of professionals mastering their communication with AI.
            </p>
          </div>

          <div className="flex flex-col gap-4 text-sm font-medium text-white/60">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 rounded-full bg-white/5 items-center justify-center border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-[#00D6FF]" />
              </div>
              Mock interviews tailored to your target role
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 rounded-full bg-white/5 items-center justify-center border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-[#00D6FF]" />
              </div>
              Instant feedback on pacing and filler words
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 rounded-full bg-white/5 items-center justify-center border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-[#00D6FF]" />
              </div>
              Smart AI answer rewriting
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Action ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 relative hero-radial-glow">
        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="flex justify-center mb-10 lg:hidden">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-xl font-bold tracking-tight text-white/90">
                ClarityAI
              </span>
            </Link>
          </div>

          <div className="apple-glass rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Ambient cyan glow inside the card */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00D6FF]/20 rounded-full blur-[80px]" />
            <div className="relative z-10">
              <SignupForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
