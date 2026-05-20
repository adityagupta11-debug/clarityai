import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://clarityai.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  title: {
    default: "ClarityAI | AI-Powered Interview Coach",
    template: "%s | ClarityAI",
  },

  description:
    "Stop winging it. ClarityAI scores your interview recordings across communication, confidence, vocabulary, and structure — then rewrites a perfect answer for every question. AI coaching in under 3 minutes, free.",

  keywords: [
    "AI interview coach",
    "interview prep",
    "interview analysis",
    "job interview practice",
    "mock interview feedback",
    "communication skills",
    "interview scoring",
    "AI career coaching",
    "interview training",
    "filler word detection",
    "STAR method",
    "behavioral interview",
    "technical interview prep",
    "job search",
    "career development",
  ],

  authors: [{ name: "ClarityAI" }],
  creator: "ClarityAI",

  robots: {
    index:     true,
    follow:    true,
    googleBot: { index: true, follow: true },
  },

  openGraph: {
    type:        "website",
    siteName:    "ClarityAI",
    url:         APP_URL,
    title:       "ClarityAI | AI-Powered Interview Coach",
    description:
      "Score your interview recordings with AI. Get coaching on communication, confidence, vocabulary & structure — with rewritten model answers. Free to start.",
    images: [
      {
        url:    "/og-image.png",
        width:  1200,
        height: 630,
        alt:    "ClarityAI dashboard showing an interview scored 87/100 with category breakdowns for communication, vocabulary, confidence, relevance, and structure",
      },
    ],
  },

  twitter: {
    card:        "summary_large_image",
    title:       "ClarityAI | AI-Powered Interview Coach",
    description:
      "Upload your interview recording. Our AI scores your communication, confidence & structure — then rewrites a perfect answer for every question.",
    images:  ["/og-image.png"],
    creator: "@clarityai",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AuthProvider>
          <TooltipProvider delay={300}>
            {children}
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
