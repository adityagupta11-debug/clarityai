"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { type Route } from "next";
import { Menu, X, Home, LayoutDashboard, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS: { href: Route; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { href: "/" as Route,          label: "Home",      icon: Home },
  { href: "/dashboard" as Route, label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings" as Route,  label: "Profile",   icon: User },
  { href: "/settings" as Route,  label: "Settings",  icon: Settings },
];

export function HamburgerMenu() {
  const [open, setOpen] = useState(false);

  // While the drawer is open: lock body scroll and allow Esc to dismiss.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* Trigger — minimal hamburger with a soft blue glow on hover */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white/70 transition-all duration-300 hover:text-white hover:border-[#00D6FF]/40 hover:bg-white/[0.04] hover:shadow-[0_0_18px_rgba(0,214,255,0.25)] active:scale-95"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Dimming overlay — click to close */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      {/* Sliding glassmorphism drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col",
          "border-l border-white/10 bg-[#050505]/80 backdrop-blur-2xl shadow-2xl",
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Drawer header + close */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
          <span className="text-base font-bold tracking-tight text-white/90">ClarityAI</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition-all duration-200 hover:text-white hover:bg-white/5 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col gap-1 p-4">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-all duration-200 hover:bg-white/5 hover:text-white"
            >
              <Icon className="h-4 w-4 text-white/40" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
