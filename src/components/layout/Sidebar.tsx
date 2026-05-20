"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mic,
  History,
  Settings,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants, Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/interview/new", icon: Plus, label: "New Interview" },
  { href: "/history", icon: History, label: "History" },
  { href: "/settings", icon: Settings, label: "Settings" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const initials =
    user?.displayName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col glass-strong border-r border-white/8">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-6 border-b border-white/8">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-violet glow-violet-sm">
          <Mic className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-semibold tracking-tight">
          <span className="gradient-text">Clarity</span>
          <span className="text-foreground/80">AI</span>
        </span>
      </div>

      {/* New Interview CTA */}
      <div className="px-4 pt-4">
        <Link
          href="/interview/new"
          className={cn(
            buttonVariants(),
            "w-full gradient-violet glow-violet-sm hover:opacity-90 transition-opacity"
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
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-violet-500/15 text-violet-300 border border-violet-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-violet-400" : "text-muted-foreground"
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade CTA */}
      <div className="px-4 pb-3">
        <div className="rounded-xl p-4 glass border border-violet-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-medium text-violet-300">Free Plan</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Upgrade to Pro for unlimited interviews and advanced analytics.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs border-violet-500/30 hover:border-violet-500/60 hover:bg-violet-500/10"
          >
            Upgrade to Pro
          </Button>
        </div>
      </div>

      {/* User info */}
      {user && (
        <div className="flex items-center gap-3 px-4 py-4 border-t border-white/8">
          <Avatar className="h-8 w-8 shrink-0 ring-2 ring-violet-500/20">
            <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? "User"} />
            <AvatarFallback className="bg-violet-500/20 text-violet-300 text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate">{user.displayName ?? "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      )}
    </aside>
  );
}
