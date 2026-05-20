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

export const metadata: Metadata = {
  title: {
    default: "ClarityAI — AI-Powered Interview Analysis",
    template: "%s | ClarityAI",
  },
  description:
    "Upload your interview recordings and get instant AI-powered feedback on communication, vocabulary, confidence, and structure.",
  keywords: ["interview analysis", "AI feedback", "job interview", "communication skills"],
  authors: [{ name: "ClarityAI" }],
  openGraph: {
    title: "ClarityAI — AI-Powered Interview Analysis",
    description: "Upload your interview recordings and get instant AI-powered feedback.",
    type: "website",
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
