"use client";

import { useRouter } from "next/navigation";
import { Settings, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardHeaderProps {
  title: string;
  description?: string;
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();

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
    <div className="relative mb-10 pt-6 pb-4 sm:pt-10 sm:pb-6">
      {/* Centered branding hero */}
      <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
        <h1 className="animate-breathe text-5xl sm:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-[#7DE7FF] to-[#00D6FF]">
          ClarityAI
        </h1>
        <h2 className="animate-breathe mt-3 text-2xl sm:text-3xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-[#7DE7FF] to-[#00D6FF]">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm font-medium text-white/50">{description}</p>
        )}
      </div>

      {/* Account menu — floated to the top-right of the hero */}
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger className="absolute right-0 top-6 sm:top-10 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
            <Avatar className="h-9 w-9 ring-2 ring-[#00D6FF]/30 transition-all hover:ring-[#00D6FF]/60">
              <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? "User"} />
              <AvatarFallback className="bg-[#00D6FF]/15 text-[#00D6FF] text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 apple-glass border-white/10">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium leading-none">
                  {user.displayName ?? "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-white/8" />

            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <User className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-white/8" />

            <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
              <LogOut className="h-3.5 w-3.5 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
