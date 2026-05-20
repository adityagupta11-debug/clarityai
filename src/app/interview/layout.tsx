import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

// Wraps all /interview/* pages with client-side auth protection.
// No sidebar chrome — interview pages use their own full-screen layouts.
export default function InterviewLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
