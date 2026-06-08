"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar, MobileTopBar } from "@/components/layout/Sidebar";

const PIN_KEY = "clarity-sidebar-pinned";

/**
 * App shell for the authenticated area. Owns the sidebar's open/pin state:
 *   • hover the left edge (or the floating hamburger) → slide the sidebar out
 *   • click the pin toggle → keep it open and push the content over
 * Pin preference is persisted to localStorage so it survives navigation/reloads.
 */
export function DashboardShell({
  children,
  contained = true,
}: {
  children: React.ReactNode;
  /** Wrap children in the centered max-w container (off for full-bleed pages). */
  contained?: boolean;
}) {
  const [isPinned, setIsPinned] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Restore the persisted pin preference after mount.
  useEffect(() => {
    if (localStorage.getItem(PIN_KEY) === "true") setIsPinned(true);
  }, []);

  const togglePin = () => {
    setIsPinned((prev) => {
      const next = !prev;
      localStorage.setItem(PIN_KEY, String(next));
      return next;
    });
  };

  // Pinned forces open and ignores hover; otherwise hover controls visibility.
  const open = isPinned || hovered;

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-[#00D6FF]/20 overflow-hidden">
      {/* ── Deepest layer: slow-drifting dark mesh (dark mode only) ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 hidden dark:block bg-mesh-drift" />

      {/* ── Ambient radial glows (dark mode only) ── */}
      <div className="pointer-events-none fixed inset-0 -z-0 hidden dark:block">
        <div className="absolute -top-32 right-0 h-[40rem] w-[40rem] rounded-full bg-[#00D6FF]/10 blur-[140px]" />
        <div className="absolute -bottom-40 -left-20 h-[38rem] w-[38rem] rounded-full bg-[#7C3AED]/10 blur-[150px]" />
        <div className="absolute left-1/2 top-1/3 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[#00D6FF]/[0.04] blur-[120px]" />
      </div>

      {/* ── Thin invisible hover trigger on the extreme left edge (desktop) ── */}
      <div
        className="hidden lg:block fixed inset-y-0 left-0 w-2.5 z-40"
        onMouseEnter={() => setHovered(true)}
        aria-hidden
      />

      {/* ── Floating hamburger — visible only while the sidebar is closed ── */}
      <button
        type="button"
        onMouseEnter={() => setHovered(true)}
        onClick={togglePin}
        aria-label="Open navigation"
        className={cn(
          "hidden lg:flex fixed top-4 left-4 z-40 h-10 w-10 items-center justify-center rounded-xl",
          "border border-border bg-card/80 backdrop-blur-xl text-foreground/70 shadow-sm transition-all duration-300",
          "hover:text-foreground hover:border-foreground/30",
          "dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70 dark:hover:text-white dark:hover:border-[#00D6FF]/40 dark:hover:shadow-[0_0_18px_rgba(0,214,255,0.25)]",
          open ? "pointer-events-none opacity-0" : "opacity-100"
        )}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* ── Desktop slide-out / pinned sidebar ── */}
      <Sidebar
        open={open}
        isPinned={isPinned}
        onTogglePin={togglePin}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          if (!isPinned) setHovered(false);
        }}
      />

      {/* ── Mobile top bar (hamburger Sheet) ── */}
      <MobileTopBar />

      {/* ── Main content — shifts right only when pinned; small gutter otherwise
             leaves room for the floating hamburger without covering content ── */}
      <div
        className={cn(
          "relative z-10 flex min-h-screen flex-col transition-[padding] duration-300 ease-in-out",
          isPinned ? "lg:pl-64" : "lg:pl-16"
        )}
      >
        <main className="flex-1">
          {contained ? (
            <div className="relative mx-auto max-w-5xl px-4 sm:px-6 pt-6 sm:pt-8 pb-16">
              {/* Ambient card backlight (dark mode only) */}
              <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden dark:block h-[36rem] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(0,163,255,0.05),transparent_70%)]" />
              {children}
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
