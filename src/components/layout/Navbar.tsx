"use client";

import Link from "next/link";
import { Bell, Mic, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  user?: {
    displayName: string;
    email: string;
    photoURL?: string | null;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const initials = user?.displayName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/8">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-violet glow-violet-sm transition-all duration-200 group-hover:scale-105">
            <Mic className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            <span className="gradient-text">Clarity</span>
            <span className="text-foreground/80">AI</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* New Interview CTA */}
              <Button asChild size="sm" className="gradient-violet glow-violet-sm hover:opacity-90 transition-opacity hidden sm:flex">
                <Link href="/interview/new">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  New Interview
                </Link>
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground hover:text-foreground">
                <Bell className="h-4 w-4" />
              </Button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                    <Avatar className="h-8 w-8 ring-2 ring-violet-500/30">
                      <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName} />
                      <AvatarFallback className="bg-violet-500/20 text-violet-300 text-xs font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-strong border-white/10">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/8" />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/history">Interview History</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/8" />
                  <DropdownMenuItem className="text-red-400 focus:text-red-400">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="gradient-violet hover:opacity-90 transition-opacity">
                <Link href="/signup">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
