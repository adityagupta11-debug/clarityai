import { Settings } from "lucide-react";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-red-400" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your profile and preferences.
        </p>
      </div>
      <div className="rounded-lg border border-dashed border-white/15 p-12 text-center text-muted-foreground text-sm">
        Profile settings form — built in Phase 2.
      </div>
    </div>
  );
}
