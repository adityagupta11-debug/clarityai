import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

// Wraps all /interview/* pages with auth + the global sidebar shell.
// Interview pages manage their own width, so the shell container is disabled.
export default function InterviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardShell contained={false}>{children}</DashboardShell>
    </ProtectedRoute>
  );
}
