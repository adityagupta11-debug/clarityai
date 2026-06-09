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
        {/* Logo — brand name stays pure white */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <span className="breathe-link text-xl font-bold tracking-tight text-white">
            ClarityAI
          </span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-body-cyan">
          {NAV_SECTIONS.map((section, i) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(e) => scrollToSection(e, section.progress)}
              className="breathe-link float-nav"
              style={{ animationDelay: `${i * 0.45}s` }}
            >
              {section.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-5">
          <Link
            href="/login"
            className="breathe-link float-nav hidden md:block text-sm font-medium text-body-cyan"
            style={{ animationDelay: "1.8s" }}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="btn-premium breathe-btn float-nav px-6 py-2.5 text-sm font-semibold"
            style={{ animationDelay: "2.25s" }}
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
