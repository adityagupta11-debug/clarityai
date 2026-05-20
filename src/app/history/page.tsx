import { History } from "lucide-react";

export const metadata = { title: "Interview History" };

export default function HistoryPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <History className="h-6 w-6 text-red-400" />
          Interview History
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Browse and filter all your past interview analyses.
        </p>
      </div>
      <div className="rounded-lg border border-dashed border-white/15 p-12 text-center text-muted-foreground text-sm">
        Interview list with filters — built in Phase 2.
      </div>
    </div>
  );
}
