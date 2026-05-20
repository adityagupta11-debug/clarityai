"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Mic } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // While Firebase resolves auth state show a full-screen loader
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-violet glow-violet animate-pulse">
            <Mic className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>
        </div>
      </div>
    );
  }

  // Not yet redirected — return null to avoid flash of protected content
  if (!user) return null;

  return <>{children}</>;
}
