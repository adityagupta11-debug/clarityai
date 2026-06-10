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

  // While Firebase resolves auth state show a full-screen branded loader.
  // `app-scope` keeps the brand colours theme-correct (cyan dark / mocha light).
  if (loading) {
    return (
      <div
        role="status"
        aria-label="Loading"
        className="app-scope flex min-h-screen items-center justify-center bg-background"
      >
        <div className="flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-500">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="spinner-brand absolute inset-0" aria-hidden />
            <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-blue-cyan glow-cyan">
              <Mic className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="text-sm font-semibold tracking-wide text-gradient-cyan">ClarityAI</p>
        </div>
      </div>
    );
  }

  // Not yet redirected — return null to avoid flash of protected content
  if (!user) return null;

  return <>{children}</>;
}
