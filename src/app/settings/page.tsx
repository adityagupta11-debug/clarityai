"use client";

import { useState, useEffect, useRef } from "react";
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
  Mail,
  Camera,
  Sun,
  Moon,
  Check,
  Gauge,
  Scale,
  Bell,
  Trash2,
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
import { useTheme, type Theme } from "@/components/theme/ThemeProvider";
import { getUserPreferences, updateUserPreferences } from "@/lib/firebase/firestore";
import { EXPERIENCE_LEVELS } from "@/lib/utils/constants";

// ── Shared theme-aware styles ─────────────────────────────────────────────────

const INPUT_CLS =
  "h-10 bg-white border-border text-foreground placeholder:text-muted-foreground/60 " +
  "focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all " +
  "dark:bg-white/[0.03] dark:border-white/10 dark:text-white dark:placeholder:text-white/25 " +
  "dark:focus:border-[#00D6FF]/50 dark:focus:ring-[#00D6FF]/20";

const VOICE_SPEEDS = [
  { value: "slow",   label: "Slow (0.75×)" },
  { value: "normal", label: "Normal (1×)" },
  { value: "fast",   label: "Fast (1.25×)" },
];

const STRICTNESS = [
  { value: "lenient",  label: "Lenient" },
  { value: "balanced", label: "Balanced" },
  { value: "strict",   label: "Strict" },
];

// ── Section panel ─────────────────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-colors dark:border-white/8 dark:bg-white/[0.02] dark:backdrop-blur-2xl dark:shadow-2xl">
      <div className="p-5 sm:p-7">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-[#00D6FF]/15 dark:text-[#00D6FF]">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

// ── iOS-style toggle ──────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
        checked ? "bg-primary dark:bg-[#00D6FF]" : "bg-muted dark:bg-white/10"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked && "translate-x-5"
        )}
      />
    </button>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3.5 last:border-0 dark:border-white/6">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

// ── Appearance theme card ─────────────────────────────────────────────────────

function ThemeCard({
  value,
  active,
  onSelect,
}: {
  value: Theme;
  active: boolean;
  onSelect: (t: Theme) => void;
}) {
  const isDark = value === "dark";
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={active}
      className={cn(
        "group relative flex flex-col gap-3 rounded-2xl border p-4 text-left transition-all duration-200",
        active
          ? "border-primary ring-2 ring-primary/40 dark:border-[#00D6FF]/50 dark:ring-[#00D6FF]/30"
          : "border-border hover:border-foreground/20 dark:border-white/10 dark:hover:border-white/20"
      )}
    >
      {/* Mini preview of the theme */}
      <div
        className={cn(
          "h-20 w-full overflow-hidden rounded-lg border",
          isDark ? "border-white/10 bg-[#0A0A0C]" : "border-black/5 bg-[#F8F5F2]"
        )}
      >
        <div className="flex h-full">
          <div className={cn("h-full w-1/3", isDark ? "bg-white/[0.04]" : "bg-white")} />
          <div className="flex-1 space-y-1.5 p-2.5">
            <div className={cn("h-2 w-3/4 rounded-full", isDark ? "bg-white/20" : "bg-[#3E2723]/20")} />
            <div className={cn("h-2 w-1/2 rounded-full", isDark ? "bg-[#00D6FF]/70" : "bg-[#6F4E37]/70")} />
            <div className={cn("h-2 w-2/3 rounded-full", isDark ? "bg-white/10" : "bg-[#3E2723]/10")} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isDark ? (
            <Moon className="h-4 w-4 text-foreground/70" />
          ) : (
            <Sun className="h-4 w-4 text-foreground/70" />
          )}
          <span className="text-sm font-medium text-foreground">
            {isDark ? "Dark Mode" : "Light Mode"}
          </span>
        </div>
        {active && <Check className="h-4 w-4 text-primary dark:text-[#00D6FF]" />}
      </div>
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // Profile (local — name editable, email read-only from auth)
  const [fullName, setFullName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Persisted preferences
  const [preferredRole,   setPreferredRole]   = useState("");
  const [experienceLevel, setExperienceLevel] = useState("entry");
  const [plan,            setPlan]            = useState("free");
  const [prefsLoading,    setPrefsLoading]    = useState(true);

  // Local-only interview prefs
  const [voiceSpeed, setVoiceSpeed] = useState("normal");
  const [strictness, setStrictness] = useState("balanced");

  // Notifications (local)
  const [emailSummaries, setEmailSummaries] = useState(true);
  const [featureUpdates, setFeatureUpdates] = useState(true);
  const [reminders,      setReminders]      = useState(false);

  // Save / sign-out state
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setFullName(user?.displayName ?? "");
  }, [user]);

  useEffect(() => {
    if (!user) return;
    getUserPreferences(user.uid).then((prefs) => {
      if (prefs) {
        setPreferredRole(prefs.preferredRole ?? "");
        setExperienceLevel(prefs.experienceLevel ?? "entry");
        setPlan(prefs.plan ?? "free");
      }
      setPrefsLoading(false);
    });
  }, [user]);

  // Revoke object URLs to avoid leaks.
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  function handleAvatarPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
    e.target.value = "";
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      await updateUserPreferences(user.uid, {
        preferredRole: preferredRole.trim() || null,
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

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    router.push("/");
  }

  const initials =
    user?.displayName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  const primaryBtn =
    "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.97] transition-all " +
    "dark:gradient-blue-cyan dark:text-white dark:shadow-[0_0_20px_rgba(0,214,255,0.3)] dark:hover:brightness-110";

  return (
    <div className="mx-auto max-w-2xl space-y-6 sm:space-y-7">

      {/* ── Page header ── */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground dark:gradient-blue-cyan dark:glow-cyan">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your account preferences and app appearance.
          </p>
        </div>
      </div>

      {/* ══ Profile ══ */}
      <Section icon={User} title="Profile" subtitle="Your name, email, and profile picture.">
        <div className="mb-5 flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16 ring-2 ring-primary/20 dark:ring-[#00D6FF]/30">
              <AvatarImage src={avatarPreview ?? user?.photoURL ?? undefined} alt={fullName || "User"} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold dark:bg-[#00D6FF]/15 dark:text-[#00D6FF]">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="Upload profile picture"
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-foreground/70 shadow-sm transition-colors hover:text-primary dark:border-white/10 dark:bg-[#0A0A0C] dark:hover:text-[#00D6FF]"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handleAvatarPick} />
          </div>
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Profile picture</p>
            <p className="mt-0.5">PNG or JPG, square works best.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="full-name" className="text-sm font-medium text-foreground">Full Name</Label>
            <Input
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className={INPUT_CLS}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              Email Address
            </Label>
            <Input
              id="email"
              value={user?.email ?? ""}
              readOnly
              className={cn(INPUT_CLS, "cursor-not-allowed opacity-70")}
            />
          </div>
        </div>
      </Section>

      {/* ══ Appearance ══ */}
      <Section icon={Sun} title="Appearance" subtitle="Choose how ClarityAI looks on this device.">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <ThemeCard value="dark"  active={theme === "dark"}  onSelect={setTheme} />
          <ThemeCard value="light" active={theme === "light"} onSelect={setTheme} />
        </div>
      </Section>

      {/* ══ Interview Preferences ══ */}
      <Section icon={Briefcase} title="Interview Preferences" subtitle="Tailor the AI coaching to your target role and style.">
        {prefsLoading ? (
          <div className="space-y-4">
            <div className="h-10 animate-pulse rounded-lg bg-foreground/5" />
            <div className="h-10 animate-pulse rounded-lg bg-foreground/5" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Experience level */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                  Experience Level
                </Label>
                <Select value={experienceLevel} onValueChange={(v) => v && setExperienceLevel(v)}>
                  <SelectTrigger className={cn(INPUT_CLS, "w-full")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* AI voice speed */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
                  AI Voice Speed
                </Label>
                <Select value={voiceSpeed} onValueChange={(v) => v && setVoiceSpeed(v)}>
                  <SelectTrigger className={cn(INPUT_CLS, "w-full")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICE_SPEEDS.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target role */}
              <div className="space-y-1.5">
                <Label htmlFor="preferred-role" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                  Target Role
                </Label>
                <Input
                  id="preferred-role"
                  placeholder="e.g. Product Manager, SDE…"
                  value={preferredRole}
                  onChange={(e) => setPreferredRole(e.target.value)}
                  className={INPUT_CLS}
                />
              </div>

              {/* Feedback strictness */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                  Feedback Strictness
                </Label>
                <Select value={strictness} onValueChange={(v) => v && setStrictness(v)}>
                  <SelectTrigger className={cn(INPUT_CLS, "w-full")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STRICTNESS.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button onClick={handleSave} disabled={saving} className={cn(primaryBtn, "h-9 px-5 text-sm")}>
                {saving ? (
                  <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Saving…</>
                ) : (
                  <><Save className="mr-2 h-3.5 w-3.5" />Save Preferences</>
                )}
              </Button>
              {saved && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-500 animate-in fade-in slide-in-from-left-2 duration-200 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Saved
                </span>
              )}
              {saveError && <span className="text-xs text-destructive">{saveError}</span>}
            </div>
          </div>
        )}
      </Section>

      {/* ══ Notifications ══ */}
      <Section icon={Bell} title="Notifications" subtitle="Decide what we email you about.">
        <div>
          <ToggleRow
            title="Email summaries"
            description="A digest of your interview performance after each analysis."
            checked={emailSummaries}
            onChange={setEmailSummaries}
          />
          <ToggleRow
            title="New feature updates"
            description="Occasional notes about new tools and improvements."
            checked={featureUpdates}
            onChange={setFeatureUpdates}
          />
          <ToggleRow
            title="Interview reminders"
            description="Nudges to keep your practice streak going."
            checked={reminders}
            onChange={setReminders}
          />
        </div>
      </Section>

      {/* ══ Account & Plan ══ */}
      <Section icon={Crown} title="Account & Plan" subtitle="Your subscription and account actions.">
        {/* Plan card */}
        <div className="mb-5 rounded-xl border border-border bg-secondary/40 p-4 dark:border-white/8 dark:bg-white/3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold capitalize text-foreground">{plan} Plan</p>
                <p className="text-xs text-muted-foreground">
                  {plan === "free"
                    ? "100 hours analysis · 5 categories · Unlimited sessions"
                    : "Unlimited analysis · Priority processing"}
                </p>
              </div>
            </div>
            {plan === "free" && (
              <span className="shrink-0 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                Free
              </span>
            )}
          </div>

          {plan === "free" && (
            <div className="mt-4">
              <Button className={cn(primaryBtn, "h-9 px-5 text-sm")}>
                <Crown className="mr-2 h-3.5 w-3.5" />
                Upgrade to Pro
              </Button>
            </div>
          )}
        </div>

        {/* Destructive actions */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3 dark:border-white/8 dark:bg-transparent">
            <div>
              <p className="text-sm font-medium text-foreground">Sign out</p>
              <p className="mt-0.5 text-xs text-muted-foreground">You&apos;ll be returned to the home page.</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleSignOut}
              disabled={signingOut}
              className="shrink-0 active:scale-[0.97] transition-all"
            >
              {signingOut
                ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Signing out…</>
                : <><LogOut className="mr-1.5 h-3.5 w-3.5" />Sign Out</>}
            </Button>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-destructive">Delete account</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Permanently remove your account and all data.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive active:scale-[0.97] transition-all"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
