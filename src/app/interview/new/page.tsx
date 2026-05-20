"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { type Route } from "next";
import {
  Sparkles,
  FileAudio,
  Mic,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { FileUploader } from "@/components/interview/FileUploader";
import { AudioRecorder } from "@/components/interview/AudioRecorder";
import { useAuth } from "@/hooks/useAuth";
import { uploadAudioFile } from "@/lib/firebase/storage";
import { createInterview } from "@/lib/firebase/firestore";
import { getAudioDuration } from "@/lib/utils/audio";
import { INTERVIEW_TYPES } from "@/lib/utils/constants";
import { type InterviewType } from "@/types/interview";

type UploadPhase = "idle" | "uploading" | "creating" | "done" | "error";

// ── Progress status card ────────────────────────────────────────────────────

function UploadProgress({
  phase,
  progress,
}: {
  phase: UploadPhase;
  progress: number;
}) {
  const isUploading = phase === "uploading";
  const isCreating = phase === "creating";

  return (
    <Card className="glass border-violet-500/20">
      <CardContent className="py-7 space-y-5">
        {/* Steps */}
        <div className="flex items-center gap-3">
          {/* Step 1 — Upload */}
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all",
                isUploading
                  ? "gradient-violet glow-violet-sm text-white"
                  : phase === "creating" || phase === "done"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-white/8 text-muted-foreground"
              )}
            >
              {isUploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : phase === "creating" || phase === "done" ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                "1"
              )}
            </div>
            <span
              className={cn(
                "text-sm font-medium",
                isUploading ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Uploading audio
            </span>
          </div>

          {/* Connector */}
          <div
            className={cn(
              "h-px flex-1 transition-all duration-500",
              phase === "creating" || phase === "done"
                ? "bg-violet-500/40"
                : "bg-white/10"
            )}
          />

          {/* Step 2 — Create */}
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all",
                isCreating
                  ? "gradient-violet glow-violet-sm text-white"
                  : phase === "done"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-white/8 text-muted-foreground"
              )}
            >
              {isCreating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : phase === "done" ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                "2"
              )}
            </div>
            <span
              className={cn(
                "text-sm font-medium",
                isCreating ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Creating interview
            </span>
          </div>
        </div>

        {/* Progress bar — only during upload */}
        {isUploading && (
          <div className="space-y-1.5">
            <Progress
              value={progress}
              className="[&_[data-slot=progress-track]]:bg-white/8 [&_[data-slot=progress-indicator]]:gradient-violet"
            />
            <p className="text-xs text-muted-foreground text-right tabular-nums">
              {progress}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function NewInterviewPage() {
  const { user } = useAuth();
  const router = useRouter();

  // ── Form fields
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [interviewType, setInterviewType] = useState<InterviewType>("behavioral");

  // ── Audio source
  const [activeTab, setActiveTab] = useState("file");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDuration, setAudioDuration] = useState(0); // seconds

  // ── Upload state
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Field-level validation messages
  const [titleError, setTitleError] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  const isSubmitting = phase === "uploading" || phase === "creating";
  const activeAudio: File | Blob | null =
    activeTab === "file" ? audioFile : audioBlob;

  // ── Handlers ────────────────────────────────────────────────

  const handleFileSelected = useCallback(async (file: File) => {
    setAudioFile(file);
    setAudioError(null);
    try {
      const dur = await getAudioDuration(file);
      setAudioDuration(Math.round(dur));
    } catch {
      setAudioDuration(0); // duration unknown — still allow upload
    }
  }, []);

  const handleFileRemoved = useCallback(() => {
    setAudioFile(null);
    setAudioDuration(0);
  }, []);

  const handleRecordingComplete = useCallback(
    (blob: Blob, duration: number) => {
      setAudioBlob(blob);
      setAudioDuration(duration);
      setAudioError(null);
    },
    []
  );

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    // Clear whichever source isn't active so stale data isn't submitted
    setAudioFile(null);
    setAudioBlob(null);
    setAudioDuration(0);
    setAudioError(null);
  }, []);

  // ── Submit ───────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Validate
    let valid = true;
    if (!title.trim()) {
      setTitleError("Interview title is required.");
      valid = false;
    } else {
      setTitleError(null);
    }
    if (!activeAudio) {
      setAudioError(
        activeTab === "file"
          ? "Please select an audio file."
          : "Please record your interview first."
      );
      valid = false;
    } else {
      setAudioError(null);
    }
    if (!valid || !user) return;

    setPhase("uploading");
    setUploadProgress(0);
    setSubmitError(null);

    try {
      // 1. Upload the audio file to Firebase Storage
      const { path } = await uploadAudioFile(
        user.uid,
        activeAudio!,
        (pct) => setUploadProgress(pct)
      );

      // 2. Create the Firestore document
      setPhase("creating");
      const interviewId = await createInterview({
        userId: user.uid,
        title: title.trim(),
        company: company.trim() || null,
        role: role.trim() || null,
        interviewType,
        recordingPath: path,
        recordingDuration: audioDuration,
        recordingSize: activeAudio!.size,
        mimeType: activeAudio!.type || "audio/webm",
      });

      // 3. Redirect to the interview status page
      setPhase("done");
      router.push(`/interview/${interviewId}` as Route);
    } catch (err) {
      console.error("Upload failed:", err);
      setPhase("error");
      setSubmitError("Something went wrong. Please try again.");
    }
  }

  // ── Render ───────────────────────────────────────────────────

  return (
    <div className="max-w-2xl space-y-0">
      <DashboardHeader
        title="New Interview"
        description="Upload a recording or capture directly in your browser."
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-5">

        {/* ── Section 1: Interview Details ─────────────────── */}
        <Card className="glass border-white/8">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold">
                1
              </span>
              Interview Details
            </CardTitle>
            <CardDescription className="text-xs">
              Give this session a name so you can find it later.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm">
                Title
                <span className="text-red-400 ml-0.5">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. Senior PM Interview at Google"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) setTitleError(null);
                }}
                disabled={isSubmitting}
                className={cn(
                  "bg-white/5 border-white/10 focus:border-violet-500/50 transition-colors",
                  titleError && "border-red-500/50 focus:border-red-500/50"
                )}
              />
              {titleError && (
                <p className="flex items-center gap-1.5 text-xs text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  {titleError}
                </p>
              )}
            </div>

            {/* Company + Role on one row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="company" className="text-sm">
                  Company
                  <span className="text-muted-foreground ml-1 text-xs">(optional)</span>
                </Label>
                <Input
                  id="company"
                  placeholder="e.g. Google"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  disabled={isSubmitting}
                  className="bg-white/5 border-white/10 focus:border-violet-500/50 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-sm">
                  Role
                  <span className="text-muted-foreground ml-1 text-xs">(optional)</span>
                </Label>
                <Input
                  id="role"
                  placeholder="e.g. Product Manager"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isSubmitting}
                  className="bg-white/5 border-white/10 focus:border-violet-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Interview Type */}
            <div className="space-y-1.5">
              <Label className="text-sm">Interview Type</Label>
              <Select
                value={interviewType}
                onValueChange={(val) => {
                  if (val) setInterviewType(val as InterviewType);
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full bg-white/5 border-white/10 focus:border-violet-500/50">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {INTERVIEW_TYPES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* ── Section 2: Audio Source ───────────────────────── */}
        <Card className="glass border-white/8">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold">
                2
              </span>
              Audio Recording
            </CardTitle>
            <CardDescription className="text-xs">
              Upload an existing file or record directly in your browser.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs
              defaultValue="file"
              onValueChange={handleTabChange}
              className="space-y-4"
            >
              <TabsList className="w-full">
                <TabsTrigger
                  value="file"
                  className="flex-1 gap-2"
                  disabled={isSubmitting}
                >
                  <FileAudio className="h-3.5 w-3.5" />
                  Upload File
                </TabsTrigger>
                <TabsTrigger
                  value="record"
                  className="flex-1 gap-2"
                  disabled={isSubmitting}
                >
                  <Mic className="h-3.5 w-3.5" />
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

            {/* Audio-level validation error */}
            {audioError && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle className="h-3 w-3" />
                {audioError}
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── Upload progress card (replaces submit when active) ── */}
        {isSubmitting && (
          <UploadProgress phase={phase} progress={uploadProgress} />
        )}

        {/* ── Submit error ──────────────────────────────────── */}
        {phase === "error" && submitError && (
          <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Upload failed</p>
              <p className="text-xs mt-0.5 text-red-400/80">{submitError}</p>
            </div>
          </div>
        )}

        {/* ── Submit button ─────────────────────────────────── */}
        {!isSubmitting && (
          <div className="flex items-center justify-between pt-1">
            {/* Readiness summary */}
            <p className="text-xs text-muted-foreground">
              {activeAudio && title.trim() ? (
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Ready to analyse
                </span>
              ) : (
                "Fill in the title and add a recording to continue."
              )}
            </p>

            <Button
              type="submit"
              disabled={!title.trim() || !activeAudio || !user}
              className={cn(
                "gradient-violet hover:opacity-90 transition-opacity px-6",
                (!title.trim() || !activeAudio) && "opacity-50"
              )}
            >
              Analyse Interview
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
