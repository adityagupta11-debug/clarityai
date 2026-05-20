import { Sidebar } from "@/components/layout/Sidebar";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <Sidebar />
        {/* pl-64 offsets the fixed sidebar; pt gives breathing room */}
        <main className="flex-1 pl-64 min-h-screen">
          <div className="mx-auto max-w-5xl px-6 pt-8 pb-16">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
