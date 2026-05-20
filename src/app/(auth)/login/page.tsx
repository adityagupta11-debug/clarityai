import Link from "next/link";
import type { Metadata } from "next";
import { Mic } from "lucide-react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 ambient-bg">
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-violet glow-violet transition-transform group-hover:scale-105">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold">
              <span className="gradient-text">Clarity</span>
              <span className="text-foreground/80">AI</span>
            </span>
          </Link>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
