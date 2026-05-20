import Link from "next/link";
import { type Route } from "next";
import { Mic } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/8 py-10 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md gradient-violet">
              <Mic className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold">
              <span className="gradient-text">Clarity</span>
              <span className="text-foreground/60">AI</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            {[
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
              { href: "/contact", label: "Contact" },
            ].map(({ href, label }) => (
              <Link
                key={label}
                href={href as Route}
                className="hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ClarityAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
