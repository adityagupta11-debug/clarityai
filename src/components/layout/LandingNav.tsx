"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Each nav link maps to the scroll progress (0–1) where its section is fully
// in view. The overlays are absolutely positioned inside the sticky viewport,
// so a native anchor jump can't reach them — we translate progress into an
// actual scroll offset within the scrollytelling container instead.
const NAV_SECTIONS = [
  { label: "Overview", id: "overview", progress: 0 },
  { label: "Technology", id: "technology", progress: 0.27 },
  { label: "How It Works", id: "how-it-works", progress: 0.52 },
  { label: "Features", id: "features", progress: 0.75 },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetProgress: number
  ) => {
    e.preventDefault();
    const container = document.getElementById("scrolly-container");
    if (!container) return;
    const totalScrollable = container.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: container.offsetTop + targetProgress * totalScrollable,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      // Fade in background and blur after scrolling 50px
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled ? "apple-glass py-4" : "bg-transparent py-6"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <span className="text-xl font-bold tracking-tight text-white/90 transition-opacity hover:opacity-80">
            ClarityAI
          </span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
          {NAV_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(e) => scrollToSection(e, section.progress)}
              className="hover:text-white transition-colors duration-300"
            >
              {section.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden md:block text-sm font-medium text-white/60 hover:text-white transition-colors duration-300"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="btn-gradient-border px-5 py-2 text-sm font-semibold text-white/90 transition-all hover:brightness-125"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
