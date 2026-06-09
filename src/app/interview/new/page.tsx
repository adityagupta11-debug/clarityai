"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  Building2,
  Briefcase,
  Lock,
  MessageSquare,
  Code2,
  Network,
  UserCheck,
  FileText,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { createInterview, subscribeToInterview } from "@/lib/firebase/firestore";
import { getAudioDuration } from "@/lib/utils/audio";
import { INTERVIEW_TYPES } from "@/lib/utils/constants";
import { type InterviewType } from "@/types/interview";

type UploadPhase = "idle" | "uploading" | "creating" | "transcribing" | "analyzing" | "done" | "error";

// ── Upload progress overlay ───────────────────────────────────────────────────

function UploadProgress({ phase, progress }: { phase: UploadPhase; progress: number }) {
  const isUploading     = phase === "uploading";
  const isCreating      = phase === "creating";
  const isTranscribing  = phase === "transcribing";
  const isAnalyzing     = phase === "analyzing";
  const afterCreating   = ["transcribing", "analyzing", "done"].includes(phase);
  const afterTranscribe = ["analyzing", "done"].includes(phase);

  const steps = [
    { label: "Uploading",     active: isUploading,    done: !isUploading && phase !== "idle" },
    { label: "Processing",    active: isCreating,      done: afterCreating },
    { label: "Transcribing",  active: isTranscribing,  done: afterTranscribe },
    { label: "Analysing",     active: isAnalyzing,     done: phase === "done" },
  ];

  return (
    <div className={cn(CARD_BASE, "overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500")}>
      {/* Animated cyan shimmer top bar */}
      <div
        className="h-0.5 w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, #00D6FF 40%, #0050FF 60%, transparent)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s linear infinite",
        }}
      />

      <div className="p-6 sm:p-8 space-y-6">
        {/* Step row */}
        <div className="flex items-center gap-3">
          {steps.map(({ label, active, done }, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-all duration-300",
                  active ? "gradient-blue-cyan glow-cyan text-white"
                         : done  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                 : "bg-white/[0.06] text-white/40 border border-white/10"
                )}
              >
                {active ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : done  ? <CheckCircle2 className="h-3.5 w-3.5" />
                                : i + 1}
              </div>

              <span className={cn(
                "text-sm font-medium transition-colors",
                active ? "text-white" : done ? "text-emerald-400" : "text-white/40"
              )}>
                {label}
              </span>

              {i < 3 && (
                <div className={cn(
                  "hidden sm:block h-px flex-1 mx-1 transition-all duration-700",
                  done ? "bg-gradient-to-r from-emerald-500/40 to-white/10" : "bg-white/10"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/50">Uploading…</span>
              <span className="text-xs font-bold tabular-nums text-[#00D6FF]">{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full gradient-blue-cyan transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {isCreating && (
          <p className="text-sm text-white/50 animate-pulse">Setting up your interview session…</p>
        )}
        {isTranscribing && (
          <p className="text-sm text-white/50 animate-pulse">Transcribing your audio — usually 20–60 seconds…</p>
        )}
        {isAnalyzing && (
          <p className="text-sm text-white/50 animate-pulse">Analysing your responses — almost there…</p>
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
  accent = "cyan",
}: {
  n: string;
  title: string;
  subtitle: string;
  accent?: "cyan" | "blue";
}) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white mt-0.5",
          accent === "cyan"
            ? "gradient-blue-cyan glow-cyan"
            : "bg-gradient-to-br from-blue-500 to-blue-600 shadow-[0_0_16px_rgba(0,80,255,0.35)]"
        )}
      >
        {n}
      </div>
      <div>
        <h2 className="text-base font-semibold leading-none mb-1 text-white/90">{title}</h2>
        <p className="text-xs text-white/50">{subtitle}</p>
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
      <Label htmlFor={htmlFor} className="text-sm font-medium flex items-center gap-1.5 text-white/80">
        {label}
        {required && <span className="text-[#00D6FF] text-xs">*</span>}
        {optional && <span className="text-white/35 text-xs font-normal">(optional)</span>}
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
  "bg-white/[0.03] border-white/10 hover:border-white/20 focus:border-[#00D6FF]/50 focus:ring-1 focus:ring-[#00D6FF]/20 transition-all placeholder:text-white/25 h-10";

// Shared premium frosted-glass surface — thin 10% border with an inset
// top-edge highlight to simulate a light source hitting the top of the card.
const CARD_BASE =
  "rounded-3xl bg-white/[0.02] backdrop-blur-2xl border border-white/10 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.08)]";

// Icon per interview type — used by the clickable type selector cards.
const TYPE_ICONS: Record<InterviewType, React.ComponentType<{ className?: string }>> = {
  behavioral:    MessageSquare,
  technical:     Code2,
  system_design: Network,
  hr_screening:  UserCheck,
  case_study:    Briefcase,
  other:         Sparkles,
};

// Additional context-gathering options (revealed after a type is chosen).
const DIFFICULTY_LEVELS = [
  { value: "beginner",     label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced",     label: "Advanced" },
] as const;

const SESSION_LENGTHS = [
  { value: "quick",    label: "Quick",     hint: "10 min" },
  { value: "standard", label: "Standard",  hint: "30 min" },
  { value: "full",     label: "Full Mock", hint: "60 min" },
] as const;

const AI_TONES = [
  { value: "friendly", label: "Friendly" },
  { value: "strict",   label: "Strict / Realistic" },
] as const;

// Shared selectable-pill styling (matches the interview-type cards).
const selectablePill = (active: boolean) =>
  cn(
    "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-out",
    "disabled:opacity-50 disabled:pointer-events-none",
    active
      ? "border-[#00D6FF]/40 bg-[#00D6FF]/10 text-white shadow-[0_8px_30px_-12px_rgba(0,214,255,0.4)]"
      : "border-white/10 bg-white/[0.02] text-white/60 hover:-translate-y-0.5 hover:bg-white/[0.04] hover:text-white"
  );

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

  // Progressive disclosure — the recording step stays locked until the user
  // confirms their interview details (only the title is strictly required).
  const [detailsConfirmed, setDetailsConfirmed] = useState(false);

  // Additional context — revealed once the user picks an interview type.
  const [typeChosen,     setTypeChosen]     = useState(false);
  const [jdMode,         setJdMode]         = useState<"paste" | "upload">("paste");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile,     setResumeFile]     = useState<File | null>(null);
  const [resumeDragOver, setResumeDragOver] = useState(false);
  const [difficulty,     setDifficulty]     = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [sessionLength,  setSessionLength]  = useState<"quick" | "standard" | "full">("standard");
  const [aiTone,         setAiTone]         = useState<"friendly" | "strict">("friendly");
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Mirror Firestore status → local phase while pipeline is running.
  // Must be a state variable (not a ref) so the useEffect re-fires when the
  // interview ID is set — refs don't trigger re-renders.
  const [activeInterviewId, setActiveInterviewId] = useState<string | null>(null);
  useEffect(() => {
    if (!activeInterviewId) return;
    return subscribeToInterview(activeInterviewId, (status) => {
      if      (status === "transcribing") setPhase("transcribing");
      else if (status === "analyzing")    setPhase("analyzing");
    });
  }, [activeInterviewId]);

  const isSubmitting = ["uploading", "creating", "transcribing", "analyzing"].includes(phase);
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

  // Validate the details step and unlock the recording step.
  const handleContinue = useCallback(() => {
    if (!title.trim()) {
      setTitleError("Interview title is required.");
      return;
    }
    setTitleError(null);
    setDetailsConfirmed(true);
  }, [title]);

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
      // Step 1 — upload audio to Firebase Storage
      const { path, url } = await uploadAudioFile(
        user.uid,
        activeAudio!,
        (pct) => setUploadProgress(pct)
      );

      // Step 2 — create the Firestore interview document
      setPhase("creating");
      const interviewId = await createInterview({
        userId:            user.uid,
        title:             title.trim(),
        company:           company.trim() || null,
        role:              role.trim() || null,
        interviewType,
        recordingPath:     path,
        recordingUrl:      url,   // stored so the transcription service can use it
        recordingDuration: audioDuration,
        recordingSize:     activeAudio!.size,
        mimeType:          activeAudio!.type || "audio/webm",
      });

      // Set the interview ID in state — triggers the subscribeToInterview useEffect
      setActiveInterviewId(interviewId);

      // Step 3 — run the full transcribe → analyse pipeline on the server.
      // /api/transcribe updates Firestore status as it progresses; the
      // subscribeToInterview listener above mirrors those changes to the
      // local phase so the progress stepper reflects the real server state.
      setPhase("transcribing");
      const apiRes = await fetch("/api/transcribe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ interviewId }),
      });

      if (!apiRes.ok) {
        const { error } = await apiRes.json().catch(() => ({ error: "Pipeline failed" }));
        throw new Error(error ?? "Pipeline failed");
      }

      // Step 4 — redirect straight to results
      setPhase("done");
      router.push(`/interview/${interviewId}/results` as Route);

    } catch (err) {
      console.error("Pipeline failed:", err);
      setPhase("error");
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    }
  }

  return (
    <div className="w-full">

      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="mb-10 animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
        {/* Centered hero */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4 flex h-14 w-14 items-center justify-center">
            <div className="pointer-events-none absolute h-20 w-20 rounded-full bg-[#00D6FF]/25 blur-2xl" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl gradient-blue-cyan animate-float shadow-[0_0_30px_rgba(0,214,255,0.45)]">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, system-ui, sans-serif' }}
            className="animate-title-breathe text-3xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/40"
          >
            New Interview
          </h1>
          <p className="animate-subtitle-pulse text-sm font-medium text-white/50 mt-2 max-w-md">
            Add your details, upload or record, and get AI coaching in under 3 minutes.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">

        {/* Two-column on laptop/desktop, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ══ Section 1: Interview Details ════════════════════════ */}
        <div className={cn(CARD_BASE, "overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-700 ease-out")}>
          {/* Thin cyan accent top border */}
          <div className="h-px bg-[linear-gradient(to_right,transparent,#0050FF_25%,#00D6FF_75%,transparent)] opacity-80" />

          <div className="p-5 sm:p-7">
            <StepHeader
              n="01"
              title="Interview Details"
              subtitle="Give this session a name so you can find it later."
              accent="cyan"
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
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/45 pointer-events-none" />
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
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/45 pointer-events-none" />
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

              {/* Interview type — clickable hovering cards */}
              <Field label="Interview Type">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {INTERVIEW_TYPES.map(({ value, label }) => {
                    const Icon = TYPE_ICONS[value];
                    const selected = typeChosen && interviewType === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => { setInterviewType(value as InterviewType); setTypeChosen(true); }}
                        disabled={isSubmitting}
                        aria-pressed={selected}
                        className={cn(
                          "group/type flex flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition-all duration-300 ease-out",
                          "disabled:opacity-50 disabled:pointer-events-none",
                          selected
                            ? "border-[#00D6FF]/40 bg-[#00D6FF]/10 text-white shadow-[0_8px_30px_-12px_rgba(0,214,255,0.4)]"
                            : "border-white/10 bg-white/[0.02] text-white/60 hover:-translate-y-0.5 hover:bg-white/[0.04] hover:text-white"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5 transition-colors duration-300",
                            selected ? "text-[#00D6FF]" : "text-white/45 group-hover/type:text-white/80"
                          )}
                        />
                        <span className="text-xs font-medium leading-tight">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* ── Additional context — slides in once a type is chosen ── */}
              {typeChosen && (
                <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-500 ease-out">
                  <div className="h-px bg-white/[0.08]" />

                  {/* Job Description / Resume */}
                  <Field label="Job Description / Resume" optional>
                    <div className="space-y-3">
                      {/* Tab toggle */}
                      <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.02] p-1">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => setJdMode("paste")}
                          className={cn(
                            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200",
                            jdMode === "paste" ? "bg-[#00D6FF]/15 text-[#00D6FF]" : "text-white/50 hover:text-white"
                          )}
                        >
                          <FileText className="h-3.5 w-3.5" /> Paste JD
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => setJdMode("upload")}
                          className={cn(
                            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200",
                            jdMode === "upload" ? "bg-[#00D6FF]/15 text-[#00D6FF]" : "text-white/50 hover:text-white"
                          )}
                        >
                          <Upload className="h-3.5 w-3.5" /> Upload Resume
                        </button>
                      </div>

                      {jdMode === "paste" ? (
                        <textarea
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          disabled={isSubmitting}
                          rows={5}
                          placeholder="Paste the Job Description here to get tailored AI coaching..."
                          className={cn(inputCls, "w-full h-auto min-h-[120px] py-2.5 leading-relaxed resize-y")}
                        />
                      ) : (
                        <div>
                          <input
                            ref={resumeInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="sr-only"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) setResumeFile(f); e.target.value = ""; }}
                            aria-hidden
                          />
                          {resumeFile ? (
                            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/25 bg-white/[0.02] p-3">
                              <FileText className="h-4 w-4 shrink-0 text-emerald-400" />
                              <span className="min-w-0 flex-1 truncate text-sm text-white/80">{resumeFile.name}</span>
                              <button
                                type="button"
                                onClick={() => setResumeFile(null)}
                                className="shrink-0 text-white/40 hover:text-white transition-colors"
                                aria-label="Remove resume"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div
                              role="button"
                              tabIndex={isSubmitting ? -1 : 0}
                              onDragOver={(e) => { e.preventDefault(); if (!isSubmitting) setResumeDragOver(true); }}
                              onDragLeave={(e) => { e.preventDefault(); setResumeDragOver(false); }}
                              onDrop={(e) => { e.preventDefault(); setResumeDragOver(false); if (isSubmitting) return; const f = e.dataTransfer.files?.[0]; if (f) setResumeFile(f); }}
                              onClick={() => !isSubmitting && resumeInputRef.current?.click()}
                              onKeyDown={(e) => { if (!isSubmitting && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); resumeInputRef.current?.click(); } }}
                              className={cn(
                                "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center outline-none cursor-pointer select-none transition-all duration-200",
                                resumeDragOver
                                  ? "border-[#00D6FF] bg-[#00D6FF]/10"
                                  : "border-white/15 hover:border-[#00D6FF]/40 hover:bg-white/[0.03]",
                                isSubmitting && "opacity-50 pointer-events-none"
                              )}
                            >
                              <div className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200",
                                resumeDragOver ? "gradient-blue-cyan glow-cyan border-transparent" : "bg-white/5 border-white/10"
                              )}>
                                <Upload className={cn("h-5 w-5", resumeDragOver ? "text-white" : "text-white/50")} />
                              </div>
                              <p className="text-xs text-white/50">
                                Drop your resume or{" "}
                                <span className="text-[#00D6FF] underline underline-offset-2">browse</span>
                                {" "}· PDF, DOC
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Field>

                  {/* Difficulty Level */}
                  <Field label="Difficulty Level">
                    <div className="grid grid-cols-3 gap-2.5">
                      {DIFFICULTY_LEVELS.map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => setDifficulty(value)}
                          aria-pressed={difficulty === value}
                          className={cn(selectablePill(difficulty === value), "text-center")}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </Field>

                  {/* Interview Length */}
                  <Field label="Interview Length">
                    <div className="grid grid-cols-3 gap-2.5">
                      {SESSION_LENGTHS.map(({ value, label, hint }) => (
                        <button
                          key={value}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => setSessionLength(value)}
                          aria-pressed={sessionLength === value}
                          className={cn(selectablePill(sessionLength === value), "flex flex-col items-center gap-0.5")}
                        >
                          <span>{label}</span>
                          <span className={cn("text-[11px]", sessionLength === value ? "text-[#00D6FF]/80" : "text-white/35")}>
                            {hint}
                          </span>
                        </button>
                      ))}
                    </div>
                  </Field>

                  {/* AI Tone */}
                  <Field label="AI Tone">
                    <div className="flex flex-wrap gap-2.5">
                      {AI_TONES.map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => setAiTone(value)}
                          aria-pressed={aiTone === value}
                          className={cn(selectablePill(aiTone === value), "flex-1 min-w-[130px]")}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              )}
            </div>

            {/* Progressive unlock — confirm details to reveal the recording step */}
            {!detailsConfirmed ? (
              <div className="mt-6 flex justify-end">
                <Button
                  type="button"
                  onClick={handleContinue}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto gradient-blue-cyan text-white rounded-full px-7 h-11 text-sm font-bold shadow-[0_0_25px_rgba(0,214,255,0.35)] hover:shadow-[0_0_40px_rgba(0,214,255,0.55)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 ease-out"
                >
                  Continue to recording
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="mt-6 flex items-center gap-2 text-xs font-medium text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                Details saved — you can still edit them above.
              </div>
            )}
          </div>
        </div>

        {/* ══ Section 2: Audio Recording (locked until details confirmed) ══ */}
        <div
          className={cn(
            CARD_BASE,
            "overflow-hidden transition-all duration-500",
            detailsConfirmed
              ? "animate-in fade-in slide-in-from-bottom-3 duration-700 ease-out"
              : "opacity-70"
          )}
        >
          {/* Thin blue accent top border — fades to transparent at both edges */}
          <div
            className={cn(
              "h-px bg-[linear-gradient(to_right,transparent,#0050FF_25%,#00D6FF_75%,transparent)]",
              detailsConfirmed ? "opacity-80" : "opacity-25"
            )}
          />

          <div className="p-5 sm:p-7">
            <StepHeader
              n="02"
              title="Your Recording"
              subtitle="Upload an existing file or record directly in your browser."
              accent="blue"
            />

            {!detailsConfirmed ? (
              /* Locked placeholder */
              <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01] py-14 px-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <Lock className="h-6 w-6 text-white/40" />
                </div>
                <p className="text-sm font-semibold text-white/70">Recording locked</p>
                <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-white/40">
                  Fill in your interview details and hit{" "}
                  <span className="font-medium text-white/70">Continue</span> to upload a file
                  or record live.
                </p>
              </div>
            ) : (
            <>
            <Tabs defaultValue="file" onValueChange={handleTabChange} className="space-y-5">
              {/* Minimal segmented pill toggle */}
              <TabsList className="grid w-full grid-cols-2 gap-1 h-auto group-data-horizontal/tabs:h-auto items-stretch rounded-full border border-white/10 bg-white/[0.03] p-1">
                <TabsTrigger
                  value="file"
                  disabled={isSubmitting}
                  className={cn(
                    "flex h-auto w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300",
                    "text-white/50 hover:text-white/80",
                    "data-active:bg-white/[0.08] data-active:text-white data-active:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                  )}
                >
                  <FileAudio className="h-4 w-4" />
                  Upload File
                </TabsTrigger>
                <TabsTrigger
                  value="record"
                  disabled={isSubmitting}
                  className={cn(
                    "flex h-auto w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300",
                    "text-white/50 hover:text-white/80",
                    "data-active:bg-white/[0.08] data-active:text-white data-active:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                  )}
                >
                  <Mic className="h-4 w-4" />
                  Record Audio
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

            {/* Analyse action — lives right inside the recording step */}
            {!isSubmitting && (
              <div className="float-breathe mt-6 flex justify-center">
                <Button
                  type="submit"
                  disabled={!isReady || !user}
                  className={cn(
                    "btn-premium breathe-btn w-full sm:w-auto px-10 h-12 text-sm font-bold rounded-full",
                    !isReady && "opacity-40 cursor-not-allowed"
                  )}
                >
                  Analyse Interview
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
            </>
            )}
          </div>
        </div>

        </div>{/* end two-column grid */}

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

        {/* ══ Submit footer (revealed once recording is unlocked) ══ */}
        {detailsConfirmed && !isSubmitting && (
          <div className={cn(CARD_BASE, "p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out")}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Readiness indicator */}
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                  isReady
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    : "bg-white/[0.06] border-white/10 text-white/40"
                )}>
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className={cn(
                    "text-sm font-medium transition-colors",
                    isReady ? "text-emerald-400" : "text-white/50"
                  )}>
                    {isReady ? "Ready to analyse" : "Almost there…"}
                  </p>
                  <p className="text-[11px] text-white/40 mt-0.5">
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
                  "w-full sm:w-auto gradient-blue-cyan text-white px-8 h-11 text-sm font-bold rounded-full",
                  "shadow-[0_0_25px_rgba(0,214,255,0.35)] hover:shadow-[0_0_40px_rgba(0,214,255,0.55)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 ease-out",
                  !isReady && "opacity-40 cursor-not-allowed hover:scale-100 hover:shadow-[0_0_25px_rgba(0,214,255,0.35)]"
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
