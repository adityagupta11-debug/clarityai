import { Sidebar, MobileTopBar } from "@/components/layout/Sidebar";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex">
        {/* Fixed desktop sidebar — hidden on mobile */}
        <Sidebar />

        {/* Main area: full width on mobile, offset by sidebar on desktop */}
        <div className="flex-1 flex flex-col min-h-screen lg:pl-64">
          {/* Mobile-only top navigation bar */}
          <MobileTopBar />

          <main className="flex-1">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-6 sm:pt-8 pb-16">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
