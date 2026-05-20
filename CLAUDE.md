# ClarityAI — Project Instructions

## Commands
- **Dev Server**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint`

## CRITICAL: UI & Component Rules (shadcn v4)
- **NO Radix UI / NO `asChild`**: This project uses **shadcn v4 with `@base-ui/react`** (not Radix UI).
- **No `asChild` prop**: Standard Radix patterns like `<Button asChild><Link ...></Link></Button>` will NOT work.
- **Navigation Buttons**: Use a standard `Link` from `next/link` and style it with the button variants helper:
  ```tsx
  import Link from "next/link";
  import { buttonVariants } from "@/components/ui/button";
  import { cn } from "@/lib/utils";

  <Link href="/dashboard" className={cn(buttonVariants({ variant: "default" }))}>
    Go to Dashboard
  </Link>
  ```
- **Dropdown / Menu Items**: For navigation within menus, use standard `onClick` event handlers with the Next.js router instead of embedding links:
  ```tsx
  import { useRouter } from "next/navigation";
  const router = useRouter();

  <DropdownMenuItem onClick={() => router.push("/profile")}>
    Profile
  </DropdownMenuItem>
  ```

## Tech Stack & Architecture
- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Auth**: Firebase Auth (Google + email/password)
- **Database**: Firebase Firestore (NoSQL)
- **File Storage**: Firebase Cloud Storage (audio files)
- **Transcription**: AssemblyAI API (with speaker diarization)
- **AI Analysis**: Gemini Flash via Firebase AI Logic (structured JSON output)

## Key Conventions
- Use Next.js App Router (not Pages Router)
- All API routes go in `src/app/api/`
- Use Server Components by default; add `"use client"` only when needed (interactivity, hooks, browser APIs)
- External services are abstracted in `src/lib/services/` — one file per service
- Firebase client SDK in `src/lib/firebase/config.ts`, Admin SDK in `src/lib/firebase/admin.ts`
- TypeScript types live in `src/types/`
- Prompt templates in `src/lib/prompts/`
- Security: transcript and analysis subcollections are server-write-only (Admin SDK). Client can only read.
