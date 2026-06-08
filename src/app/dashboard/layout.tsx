import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardShell>{children}</DashboardShell>
    </ProtectedRoute>
  );
}
