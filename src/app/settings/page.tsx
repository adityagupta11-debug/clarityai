"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  User,
  LogOut,
  Save,
  CheckCircle2,
  Loader2,
  Briefcase,
  GraduationCap,
  Crown,
  ShieldCheck,
  Mail,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { getUserPreferences, updateUserPreferences } from "@/lib/firebase/firestore";
import { EXPERIENCE_LEVELS } from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/formatting";

// ── Section panel ─────────────────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  subtitle,
  accentColor = "red",
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  accentColor?: "red" | "blue" | "amber" | "rose";
  children: React.ReactNode;
}) {
  const iconStyles: Record<string, string> = {
    red:   "gradient-red glow-red-sm",
    blue:  "bg-gradient-to-br from-blue-500 to-blue-600",
    amber: "bg-gradient-to-br from-amber-500 to-amber-600",
    rose:  "bg-gradient-to-br from-rose-600 to-rose-700",
  };

  return (
    <div
      className="rounded-2xl border border-white/8 overflow-hidden"
      style={{ background: "oklch(0.12 0.025 35 / 0.85)", backdropFilter: "blur(20px)" }}
    >
      {/* Accent stripe */}
      <div
        className={cn("h-0.5 opacity-60", iconStyles[accentColor])}
        style={accentColor !== "red" ? { background: undefined } : undefined}
      />

      <div className="p-5 sm:p-7">
        {/* Header row */}
        <div className="flex items-start gap-4 mb-6">
          <div className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white",
            iconStyles[accentColor]
          )}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-none mb-1">{title}</h2>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

// ── Info row — read-only datum ────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/6 last:border-0">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
        <p className="text-sm text-foreground truncate mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  // Preferences state (loaded from Firestore)
  const [preferredRole,    setPreferredRole]    = useState("");
  const [experienceLevel,  setExperienceLevel]  = useState("entry");
  const [plan,             setPlan]             = useState("free");
  const [memberSince,      setMemberSince]      = useState<Date | null>(null);
  const [prefsLoading,     setPrefsLoading]     = useState(true);

  // Save state
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sign-out state
  const [signingOut, setSigningOut] = useState(false);

  // ── Load preferences from Firestore ──
  useEffect(() => {
    if (!user) return;
    getUserPreferences(user.uid).then((prefs) => {
      if (prefs) {
        setPreferredRole(prefs.preferredRole ?? "");
        setExperienceLevel(prefs.experienceLevel ?? "entry");
        setPlan(prefs.plan ?? "free");
        setMemberSince(prefs.createdAt?.toDate() ?? null);
      }
      setPrefsLoading(false);
    });
  }, [user]);

  // ── Save preferences ──
  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);

    try {
      await updateUserPreferences(user.uid, {
        preferredRole:   preferredRole.trim() || null,
        experienceLevel,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError("Failed to save. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  // ── Sign out ──
  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    router.push("/");
  }

  const initials =
    user?.displayName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  return (
    <div className="max-w-2xl space-y-6 sm:space-y-7">

      {/* ── Page header ── */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl gradient-red glow-red">
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight gradient-text-brand">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your profile, preferences, and account.
          </p>
        </div>
      </div>

      {/* ══ Profile ════════════════════════════════════════════ */}
      <Section
        icon={User}
        title="Profile"
        subtitle="Your identity as stored in Firebase Auth — managed by your sign-in provider."
        accentColor="red"
      >
        {/* Avatar + name row */}
        <div className="flex items-center gap-4 mb-5">
          <Avatar className="h-14 w-14 ring-2 ring-red-500/20 shrink-0">
            <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? "User"} />
            <AvatarFallback className="bg-red-500/20 text-red-300 text-lg font-black">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-base font-semibold">{user?.displayName ?? "—"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {user?.providerData?.[0]?.providerId === "google.com"
                ? "Signed in with Google"
                : "Email / Password"}
            </p>
          </div>
        </div>

        {/* Read-only fields */}
        <div className="rounded-xl border border-white/6 bg-white/2 px-4">
          <InfoRow icon={Mail}     label="Email"       value={user?.email ?? "—"} />
          {memberSince && (
            <InfoRow icon={Calendar} label="Member since" value={formatDate(memberSince)} />
          )}
          <InfoRow
            icon={ShieldCheck}
            label="Account status"
            value={plan === "pro" ? "Pro plan" : "Free plan"}
          />
        </div>
      </Section>

      {/* ══ Interview Preferences ═══════════════════════════════ */}
      <Section
        icon={Briefcase}
        title="Interview Preferences"
        subtitle="Tailor the AI's feedback to your target role and experience level."
        accentColor="blue"
      >
        {prefsLoading ? (
          <div className="space-y-4">
            <div className="h-10 rounded-lg bg-white/5 animate-pulse" />
            <div className="h-10 rounded-lg bg-white/5 animate-pulse" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Experience level */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-blue-400" />
                Experience Level
              </Label>
              <Select
                value={experienceLevel}
                onValueChange={(val) => { if (val) setExperienceLevel(val); }}
              >
                <SelectTrigger className="bg-white/4 border-white/10 hover:border-white/18 focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/15 h-10 transition-all w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preferred role */}
            <div className="space-y-1.5">
              <Label htmlFor="preferred-role" className="text-sm font-medium flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-blue-400" />
                Target Role
                <span className="text-muted-foreground/60 text-xs font-normal">(optional)</span>
              </Label>
              <Input
                id="preferred-role"
                placeholder="e.g. Product Manager, Software Engineer…"
                value={preferredRole}
                onChange={(e) => setPreferredRole(e.target.value)}
                className="bg-white/4 border-white/10 hover:border-white/18 focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/15 h-10 placeholder:text-white/25 transition-all"
              />
            </div>

            {/* Save button + feedback */}
            <div className="flex items-center gap-3 pt-1">
              <Button
                onClick={handleSave}
                disabled={saving}
                className={cn(
                  "bg-gradient-to-br from-blue-500 to-blue-600 hover:opacity-90 active:scale-[0.97] transition-all h-9 px-5 text-sm",
                  saving && "opacity-70"
                )}
                style={{ boxShadow: "0 0 14px oklch(0.58 0.22 264 / 0.25)" }}
              >
                {saving ? (
                  <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />Saving…</>
                ) : (
                  <><Save className="h-3.5 w-3.5 mr-2" />Save Preferences</>
                )}
              </Button>

              {saved && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 animate-in fade-in slide-in-from-left-2 duration-200">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Saved
                </span>
              )}

              {saveError && (
                <span className="text-xs text-red-400">{saveError}</span>
              )}
            </div>
          </div>
        )}
      </Section>

      {/* ══ Plan & Account ══════════════════════════════════════ */}
      <Section
        icon={Crown}
        title="Plan & Account"
        subtitle="Your current subscription and account actions."
        accentColor="amber"
      >
        {/* Plan card */}
        <div className="rounded-xl border border-white/8 bg-white/3 p-4 mb-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/20">
                <Crown className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold capitalize">{plan} Plan</p>
                <p className="text-xs text-muted-foreground">
                  {plan === "free"
                    ? "100 hours analysis · 5 categories · Unlimited sessions"
                    : "Unlimited analysis · Priority processing"}
                </p>
              </div>
            </div>

            {plan === "free" && (
              <span className="shrink-0 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
                Free
              </span>
            )}
          </div>

          {plan === "free" && (
            <div className="mt-3 pt-3 border-t border-white/6">
              <p className="text-xs text-muted-foreground mb-2">
                Upgrade to Pro for unlimited analysis hours, priority processing, and advanced reporting.
              </p>
              <button className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors">
                Upgrade to Pro →
              </button>
            </div>
          )}
        </div>

        {/* Sign out */}
        <div className="flex items-center justify-between rounded-xl border border-rose-500/15 bg-rose-500/5 px-4 py-3">
          <div>
            <p className="text-sm font-medium">Sign out</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              You&apos;ll be redirected to the home page.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSignOut}
            disabled={signingOut}
            className="shrink-0 active:scale-[0.97] transition-all"
          >
            {signingOut
              ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Signing out…</>
              : <><LogOut className="h-3.5 w-3.5 mr-1.5" />Sign Out</>
            }
          </Button>
        </div>
      </Section>

    </div>
  );
}
