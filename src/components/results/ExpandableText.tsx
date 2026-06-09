"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ExpandableTextProps {
  text: string;
  className?: string;
  /** Word count above which the text is truncated. */
  threshold?: number;
  /** Collapsed height in rem. */
  collapsedRem?: number;
}

/**
 * Renders a paragraph that, when it exceeds `threshold` words, collapses to
 * `collapsedRem` with a clean fade-out and a "Read more" toggle. The height
 * change is animated via a max-height transition so it feels cinematic.
 */
export function ExpandableText({
  text,
  className,
  threshold = 55,
  collapsedRem = 4.5,
}: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.trim().split(/\s+/).length > threshold;

  if (!isLong) return <p className={className}>{text}</p>;

  return (
    <div className="group/exp">
      <div
        className="relative overflow-hidden transition-[max-height] duration-500 ease-in-out"
        style={{
          maxHeight: expanded ? "40rem" : `${collapsedRem}rem`,
          ...(expanded
            ? {}
            : {
                maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
              }),
        }}
      >
        <p className={className}>{text}</p>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className={cn(
          "mt-1.5 text-[11px] font-medium text-primary/80 dark:text-[#00D6FF]/80 underline-offset-4 transition-colors",
          "hover:text-primary dark:hover:text-[#00D6FF] hover:underline"
        )}
      >
        {expanded ? "Show less" : "Read more"}
      </button>
    </div>
  );
}
