# ClarityAI

AI-powered interview coaching. Upload any recording, get a full breakdown of your communication, confidence, vocabulary, structure, and relevance — with per-question feedback and AI-rewritten ideal answers.

**Live:** [clarityai.vercel.app](https://clarityai.vercel.app)

---

## What it does

- **Transcription** — AssemblyAI with speaker diarization identifies who said what
- **AI Analysis** — Gemini 2.5 Flash scores 5 categories per interview and gives coaching feedback
- **Question Deep Dive** — side-by-side view of your answer vs. an AI-rewritten ideal response
- **Speech Metrics** — filler word count, speaking pace (WPM), longest pause, talk time
- **Progress Tracking** — all interviews saved, scores tracked over time

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Auth | Firebase Auth (Google + email/password) |
| Database | Firebase Firestore |
| File Storage | Firebase Cloud Storage |
| Transcription | AssemblyAI |
| AI Analysis | Gemini 2.5 Flash via Firebase AI Logic |
| Deployment | Vercel |

## Local Development

```bash
npm install
npm run dev
```

### Environment Variables

Create a `.env.local` file (see `.env.example` for the full list):

```env
# Firebase (client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY_BASE64=

# AssemblyAI
ASSEMBLYAI_API_KEY=

# App URL (used for webhook callback)
APP_URL=http://localhost:3000
```

> `FIREBASE_ADMIN_PRIVATE_KEY_BASE64` is the service account private key base64-encoded to avoid newline issues on Vercel. Generate it with:
> ```bash
> echo -n "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n" | base64
> ```

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login + signup pages
│   ├── api/             # API routes (transcribe, analyze, webhooks)
│   ├── dashboard/       # Main dashboard
│   ├── history/         # Interview history with search/filter
│   ├── interview/       # New interview + results pages
│   └── settings/        # User preferences
├── components/
│   ├── interview/       # AudioRecorder, FileUploader, InterviewCard
│   ├── layout/          # Sidebar, DashboardHeader, ProtectedRoute
│   ├── results/         # OverallScore, CategoryGrid, QuestionBreakdown, SpeechMetrics
│   └── ui/              # shadcn/ui primitives
├── hooks/               # useAuth, useInterviews, useInterview, useAnalysis
├── lib/
│   ├── firebase/        # Client SDK, Admin SDK, Auth, Firestore, Storage
│   ├── prompts/         # Gemini prompt templates
│   ├── services/        # AssemblyAI + Gemini service wrappers
│   └── utils/           # Formatting, audio helpers, constants
└── types/               # TypeScript types for Interview, Analysis, Transcript
```

## Commands

```bash
npm run dev     # Start dev server (localhost:3000)
npm run build   # Production build
npm run lint    # ESLint
```
