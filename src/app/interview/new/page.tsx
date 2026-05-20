"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type Route } from "next";
import {
  Sparkles,
  FileAudio,
  Mic,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building2,
  Briefcase,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { FileUploader } from "@/components/interview/FileUploader";
import { AudioRecorder } from "@/components/interview/AudioRecorder";
import { useAuth } from "@/hooks/useAuth";
import { uploadAudioFile } from "@/lib/firebase/storage";
import { createInterview } from "@/lib/firebase/firestore";
import { getAudioDuration } from "@/lib/utils/audio";
import { INTERVIEW_TYPES } from "@/lib/utils/constants";
import { type InterviewType } from "@/types/interview";

type UploadPhase = "idle" | "uploading" | "creating" | "done" | "error";

// ── Upload progress overlay ───────────────────────────────────────────────────

function UploadProgress({ phase, progress }: { phase: UploadPhase; progress: number }) {
  const isUploading = phase === "uploading";
  const isCreating  = phase === "creating";

  const steps = [
    { label: "Uploading audio",    active: isUploading, done: isCreating || phase === "done" },
    { label: "Creating interview", active: isCreating,  done: phase === "done" },
  ];

  return (
    <div
      className="rounded-2xl border border-white/8 overflow-hidden"
      style={{ background: "oklch(0.13 0.025 35 / 0.9)", backdropFilter: "blur(20px)" }}
    >
      {/* Animated red top bar */}
      <div className="h-0.5 w-full gradient-red" style={{
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s linear infinite",
      }} />

      <div className="p-6 sm:p-8 space-y-6">
        {/* Step row */}
        <div className="flex items-center gap-3">
          {steps.map(({ label, active, done }, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-all duration-300",
                  active ? "gradient-red glow-red-sm text-white"
                         : done  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                 : "bg-white/6 text-muted-foreground border border-white/10"
                )}
              >
                {active ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : done  ? <CheckCircle2 className="h-3.5 w-3.5" />
                                : i + 1}
              </div>

              <span className={cn(
                "text-sm font-medium transition-colors",
                active ? "text-foreground" : done ? "text-emerald-400" : "text-muted-foreground"
              )}>
                {label}
              </span>

              {i === 0 && (
                <div className={cn(
                  "hidden sm:block h-px flex-1 mx-2 transition-all duration-700",
                  done ? "bg-gradient-to-r from-emerald-500/40 to-white/10" : "bg-white/8"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Uploading…</span>
              <span className="text-xs font-bold tabular-nums text-red-400">{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/8 overflow-hidden">
              <div
                className="h-full rounded-full gradient-red transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {isCreating && (
          <p className="text-sm text-muted-foreground animate-pulse">
            Setting up your interview session…
          </p>
        )}
      </div>
    </div>
  );
}

// ── Section header — numbered step pill + title ───────────────────────────────

function StepHeader({
  n,
  title,
  subtitle,
  accent = "red",
}: {
  n: string;
  title: string;
  subtitle: string;
  accent?: "red" | "blue";
}) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white mt-0.5",
          accent === "red"
            ? "gradient-red glow-red-sm"
            : "bg-gradient-to-br from-blue-500 to-blue-600"
        )}
        style={accent === "blue" ? { boxShadow: "0 0 14px oklch(0.58 0.22 264 / 0.30)" } : undefined}
      >
        {n}
      </div>
      <div>
        <h2 className="text-base font-semibold leading-none mb-1">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

// ── Field wrapper — consistent label + input + error treatment ────────────────

function Field({
  label,
  htmlFor,
  required,
  optional,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium flex items-center gap-1.5">
        {label}
        {required && <span className="text-red-400 text-xs">*</span>}
        {optional && <span className="text-muted-foreground/60 text-xs font-normal">(optional)</span>}
      </Label>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400 animate-in slide-in-from-top-1 duration-150">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ── Styled input — shared class string ───────────────────────────────────────

const inputCls =
  "bg-white/4 border-white/10 hover:border-white/18 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all placeholder:text-white/25 h-10";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NewInterviewPage() {
  const { user } = useAuth();
  const router   = useRouter();

  const [title,         setTitle]         = useState("");
  const [company,       setCompany]       = useState("");
  const [role,          setRole]          = useState("");
  const [interviewType, setInterviewType] = useState<InterviewType>("behavioral");

  const [activeTab,     setActiveTab]     = useState("file");
  const [audioFile,     setAudioFile]     = useState<File | null>(null);
  const [audioBlob,     setAudioBlob]     = useState<Blob | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);

  const [phase,          setPhase]          = useState<UploadPhase>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitError,    setSubmitError]    = useState<string | null>(null);
  const [titleError,     setTitleError]     = useState<string | null>(null);
  const [audioError,     setAudioError]     = useState<string | null>(null);

  const isSubmitting = phase === "uploading" || phase === "creating";
  const activeAudio: File | Blob | null = activeTab === "file" ? audioFile : audioBlob;
  const isReady = !!title.trim() && !!activeAudio;

  const handleFileSelected = useCallback(async (file: File) => {
    setAudioFile(file);
    setAudioError(null);
    try {
      const dur = await getAudioDuration(file);
      setAudioDuration(Math.round(dur));
    } catch {
      setAudioDuration(0);
    }
  }, []);

  const handleFileRemoved = useCallback(() => {
    setAudioFile(null);
    setAudioDuration(0);
  }, []);

  const handleRecordingComplete = useCallback((blob: Blob, duration: number) => {
    setAudioBlob(blob);
    setAudioDuration(duration);
    setAudioError(null);
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setAudioFile(null);
    setAudioBlob(null);
    setAudioDuration(0);
    setAudioError(null);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    let valid = true;
    if (!title.trim()) { setTitleError("Interview title is required."); valid = false; }
    else setTitleError(null);

    if (!activeAudio) {
      setAudioError(activeTab === "file"
        ? "Please select an audio file."
        : "Please record your interview first.");
      valid = false;
    } else setAudioError(null);

    if (!valid || !user) return;

    setPhase("uploading");
    setUploadProgress(0);
    setSubmitError(null);

    try {
      const { path } = await uploadAudioFile(user.uid, activeAudio!, (pct) => setUploadProgress(pct));

      setPhase("creating");
      const interviewId = await createInterview({
        userId:            user.uid,
        title:             title.trim(),
        company:           company.trim() || null,
        role:              role.trim() || null,
        interviewType,
        recordingPath:     path,
        recordingDuration: audioDuration,
        recordingSize:     activeAudio!.size,
        mimeType:          activeAudio!.type || "audio/webm",
      });

      setPhase("done");
      router.push(`/interview/${interviewId}` as Route);
    } catch (err) {
      console.error("Upload failed:", err);
      setPhase("error");
      setSubmitError("Something went wrong during upload. Please try again.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-5 group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to Dashboard
        </Link>

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl gradient-red glow-red">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight gradient-text-brand">
              New Interview
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Add your details, upload or record, and get AI coaching in under 3 minutes.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">

        {/* ══ Section 1: Interview Details ════════════════════════ */}
        <div
          className="rounded-2xl border border-white/8 overflow-hidden"
          style={{ background: "oklch(0.12 0.025 35 / 0.85)", backdropFilter: "blur(20px)" }}
        >
          {/* Thin red accent top border */}
          <div className="h-0.5 gradient-red opacity-60" />

          <div className="p-5 sm:p-7">
            <StepHeader
              n="01"
              title="Interview Details"
              subtitle="Give this session a name so you can find it later."
              accent="red"
            />

            <div className="space-y-4">
              {/* Title */}
              <Field label="Title" htmlFor="title" required error={titleError}>
                <Input
                  id="title"
                  placeholder="e.g. Senior PM Interview at Google"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); if (titleError) setTitleError(null); }}
                  disabled={isSubmitting}
                  className={cn(inputCls, titleError && "border-red-500/40")}
                />
              </Field>

              {/* Company + Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Company" htmlFor="company" optional>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
                    <Input
                      id="company"
                      placeholder="Google"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      disabled={isSubmitting}
                      className={cn(inputCls, "pl-8")}
                    />
                  </div>
                </Field>

                <Field label="Role" htmlFor="role" optional>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
                    <Input
                      id="role"
                      placeholder="Product Manager"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      disabled={isSubmitting}
                      className={cn(inputCls, "pl-8")}
                    />
                  </div>
                </Field>
              </div>

              {/* Interview type */}
              <Field label="Interview Type" htmlFor="type">
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none z-10" />
                  <Select
                    value={interviewType}
                    onValueChange={(val) => { if (val) setInterviewType(val as InterviewType); }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className={cn(inputCls, "pl-8 w-full")}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERVIEW_TYPES.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Field>
            </div>
          </div>
        </div>

        {/* ══ Section 2: Audio Recording ══════════════════════════ */}
        <div
          className="rounded-2xl border border-white/8 overflow-hidden"
          style={{ background: "oklch(0.12 0.025 35 / 0.85)", backdropFilter: "blur(20px)" }}
        >
          {/* Thin blue accent top border */}
          <div className="h-0.5" style={{ background: "linear-gradient(90deg, oklch(0.58 0.22 264), oklch(0.70 0.18 264))", opacity: 0.6 }} />

          <div className="p-5 sm:p-7">
            <StepHeader
              n="02"
              title="Your Recording"
              subtitle="Upload an existing file or record directly in your browser."
              accent="blue"
            />

            <Tabs defaultValue="file" onValueChange={handleTabChange} className="space-y-5">
              {/* Custom tab list */}
              <TabsList className="w-full h-11 p-1 rounded-xl bg-white/4 border border-white/8">
                <TabsTrigger
                  value="file"
                  disabled={isSubmitting}
                  className={cn(
                    "flex-1 h-9 gap-2 rounded-lg text-sm font-medium transition-all",
                    "data-active:bg-red-500/15 data-active:text-red-300 data-active:border data-active:border-red-500/20",
                    "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <FileAudio className="h-4 w-4" />
                  <span>Upload File</span>
                </TabsTrigger>
                <TabsTrigger
                  value="record"
                  disabled={isSubmitting}
                  className={cn(
                    "flex-1 h-9 gap-2 rounded-lg text-sm font-medium transition-all",
                    "data-active:bg-blue-500/15 data-active:text-blue-300 data-active:border data-active:border-blue-500/20",
                    "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Mic className="h-4 w-4" />
                  <span>Record Audio</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="file">
                <FileUploader
                  onFileSelected={handleFileSelected}
                  onFileRemoved={handleFileRemoved}
                  disabled={isSubmitting}
                />
              </TabsContent>

              <TabsContent value="record">
                <AudioRecorder
                  onRecordingComplete={handleRecordingComplete}
                  disabled={isSubmitting}
                />
              </TabsContent>
            </Tabs>

            {audioError && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/8 border border-red-500/20 px-3 py-2.5 text-xs text-red-400 animate-in slide-in-from-top-1 duration-150">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {audioError}
              </div>
            )}
          </div>
        </div>

        {/* ══ Upload progress (replaces submit footer while active) ══ */}
        {isSubmitting && (
          <UploadProgress phase={phase} progress={uploadProgress} />
        )}

        {/* ══ Submit error ════════════════════════════════════════ */}
        {phase === "error" && submitError && (
          <div className="flex items-start gap-3 rounded-2xl bg-red-500/8 border border-red-500/20 px-5 py-4 text-sm text-red-400 animate-in slide-in-from-top-1 duration-200">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Upload failed</p>
              <p className="text-xs mt-0.5 text-red-400/70">{submitError}</p>
            </div>
          </div>
        )}

        {/* ══ Submit footer ═══════════════════════════════════════ */}
        {!isSubmitting && (
          <div
            className="rounded-2xl border border-white/8 p-5 sm:p-6"
            style={{ background: "oklch(0.12 0.025 35 / 0.85)", backdropFilter: "blur(20px)" }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Readiness indicator */}
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all",
                  isReady
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    : "bg-white/6 border-white/10 text-muted-foreground"
                )}>
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className={cn(
                    "text-sm font-medium transition-colors",
                    isReady ? "text-emerald-400" : "text-muted-foreground"
                  )}>
                    {isReady ? "Ready to analyse" : "Almost there…"}
                  </p>
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                    {!title.trim() && !activeAudio
                      ? "Add a title and recording to continue"
                      : !title.trim()
                        ? "Add a title to continue"
                        : !activeAudio
                          ? "Add a recording to continue"
                          : "AI analysis takes under 3 minutes"}
                  </p>
                </div>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={!isReady || !user}
                className={cn(
                  "w-full sm:w-auto gradient-red glow-red-sm px-8 h-11 text-sm font-bold",
                  "hover:opacity-90 active:scale-[0.97] transition-all",
                  !isReady && "opacity-40 cursor-not-allowed"
                )}
              >
                Analyse Interview
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

      </form>
    </div>
  );
}
