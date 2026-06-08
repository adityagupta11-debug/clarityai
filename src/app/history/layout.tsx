import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardShell>{children}</DashboardShell>
    </ProtectedRoute>
  );
}
