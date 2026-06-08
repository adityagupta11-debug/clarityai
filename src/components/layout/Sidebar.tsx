"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Mic,
  History,
  Settings,
  Plus,
  Sparkles,
  TrendingUp,
  Menu,
  LogOut,
  X,
  Pin,
  PinOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants, Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { href: "/dashboard",      icon: LayoutDashboard, label: "Dashboard"      },
  { href: "/interview/new",  icon: Plus,            label: "New Interview"   },
  { href: "/history",        icon: History,         label: "History"         },
  { href: "/settings",       icon: Settings,        label: "Settings"        },
] as const;

// ── Shared navigation contents ────────────────────────────────────────────────
// Rendered inside both the fixed desktop sidebar and the mobile Sheet panel.

function SidebarContents({
  onNavClick,
  isPinned,
  onTogglePin,
}: {
  onNavClick?: () => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
}) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, signOut } = useAuth();

  const initials =
    user?.displayName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo + pin toggle */}
      <div className="flex h-16 items-center justify-between gap-2 px-5 border-b border-white/10 shrink-0">
        <Link href="/dashboard" onClick={onNavClick} className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-blue-cyan glow-cyan">
            <Mic className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight truncate">
            <span className="text-gradient-cyan">Clarity</span>
            <span className="text-white/80">AI</span>
          </span>
        </Link>

        {onTogglePin && (
          <button
            type="button"
            onClick={onTogglePin}
            aria-pressed={isPinned}
            title={isPinned ? "Unpin sidebar" : "Pin sidebar open"}
            className={cn(
              "hidden lg:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all active:scale-95",
              isPinned
                ? "border-[#00D6FF]/40 bg-[#00D6FF]/15 text-[#00D6FF] shadow-[0_0_14px_rgba(0,214,255,0.25)]"
                : "border-white/10 text-white/50 hover:text-white hover:bg-white/5"
            )}
          >
            {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* New Interview CTA */}
      <div className="px-4 pt-4 shrink-0">
        <Link
          href="/interview/new"
          onClick={onNavClick}
          className={cn(
            buttonVariants(),
            "w-full gradient-blue-cyan text-white shadow-[0_0_20px_rgba(0,214,255,0.3)] hover:brightness-110 active:scale-[0.97] transition-all"
          )}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          New Interview
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                "transition-all duration-150 active:scale-[0.97]",
                isActive
                  ? "bg-[#00D6FF]/10 text-[#00D6FF] border border-[#00D6FF]/20 shadow-[0_0_20px_rgba(0,214,255,0.1)]"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-[#00D6FF]" : "text-white/50"
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade CTA */}
      <div className="px-4 pb-3 shrink-0">
        <div className="rounded-xl p-4 bg-white/5 backdrop-blur-xl border border-[#00D6FF]/20 shadow-[0_0_20px_rgba(0,214,255,0.08)]">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-[#00D6FF]" />
            <span className="text-sm font-medium text-[#00D6FF]">Free Plan</span>
          </div>
          <p className="text-xs text-white/50 mb-3">
            Upgrade to Pro for unlimited interviews and advanced analytics.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs border-[#00D6FF]/30 text-white/80 hover:border-[#00D6FF]/60 hover:bg-[#00D6FF]/10 active:scale-[0.97] transition-all"
          >
            Upgrade to Pro
          </Button>
        </div>
      </div>

      {/* User info + sign-out */}
      {user && (
        <div className="flex items-center gap-3 px-4 py-4 border-t border-white/10 shrink-0">
          <Avatar className="h-8 w-8 shrink-0 ring-2 ring-[#00D6FF]/30">
            <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? "User"} />
            <AvatarFallback className="bg-[#00D6FF]/15 text-[#00D6FF] text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate text-white/90">{user.displayName ?? "User"}</p>
            <p className="text-xs text-white/50 truncate">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="shrink-0 text-white/50 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/5 active:scale-[0.97]"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Desktop sidebar — slide-out / pinned, visible on lg+ only ─────────────────
// `open` is controlled by the parent shell (hover or pinned). When closed it
// slides fully off-screen via translateX(-100%).

export function Sidebar({
  open,
  isPinned,
  onTogglePin,
  onMouseEnter,
  onMouseLeave,
}: {
  open: boolean;
  isPinned: boolean;
  onTogglePin: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <aside
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-hidden={!open}
      className={cn(
        "hidden lg:flex fixed top-0 bottom-0 left-0 z-50 w-64 flex-col overflow-hidden",
        "rounded-r-2xl border-r border-white/10 bg-[#070708]/95 backdrop-blur-2xl shadow-2xl",
        "transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <SidebarContents isPinned={isPinned} onTogglePin={onTogglePin} />
    </aside>
  );
}

// ── Mobile top bar — visible below lg, contains hamburger + logo ──────────────

export function MobileTopBar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const initials =
    user?.displayName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  return (
    <header className="lg:hidden sticky top-0 z-50 flex h-14 items-center justify-between px-4 border-b border-white/10 apple-glass shrink-0">
      {/* Hamburger sheet trigger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 active:scale-[0.95] transition-all"
          aria-label="Open navigation menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </SheetTrigger>

        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-72 max-w-[85vw] p-0 border-r border-white/10 apple-glass"
        >
          {/* Visually hidden title for screen readers */}
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SidebarContents onNavClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Centred logo */}
      <Link href="/dashboard" className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md gradient-blue-cyan glow-cyan">
          <Mic className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-base font-bold tracking-tight">
          <span className="text-gradient-cyan">Clarity</span>
          <span className="text-white/70">AI</span>
        </span>
      </Link>

      {/* User avatar (right) */}
      {user && (
        <Avatar className="h-8 w-8 ring-2 ring-[#00D6FF]/30">
          <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? "User"} />
          <AvatarFallback className="bg-[#00D6FF]/15 text-[#00D6FF] text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
      )}
    </header>
  );
}
