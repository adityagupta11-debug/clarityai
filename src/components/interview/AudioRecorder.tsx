"use client";

import { useEffect, useRef, useCallback } from "react";
import { Mic, Square, Pause, Play, RotateCcw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

interface AudioRecorderProps {
  /** Called once after stopRecording() — blob carries the audio data, duration is in seconds. */
  onRecordingComplete: (blob: Blob, duration: number) => void;
  disabled?: boolean;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function AudioRecorder({ onRecordingComplete, disabled }: AudioRecorderProps) {
  const {
    isRecording,
    isPaused,
    recordingDuration,
    audioBlob,
    mimeType,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    clearRecording,
  } = useAudioRecorder();

  // Kept-current refs so effects always read the latest value without
  // adding fast-changing state (timer ticks, parent re-renders) to deps.
  const onRecordingCompleteRef = useRef(onRecordingComplete);
  useEffect(() => { onRecordingCompleteRef.current = onRecordingComplete; }, [onRecordingComplete]);

  // Snapshot the final duration the moment stopRecording() commits it.
  // recordingDuration changes every second while recording — keeping it out
  // of the blob effect prevents re-running the effect on every timer tick.
  const recordingDurationRef = useRef(0);
  useEffect(() => { recordingDurationRef.current = recordingDuration; }, [recordingDuration]);

  // Object URL for the <audio> preview.
  // A single effect on audioBlob manages the full lifecycle:
  //   • creates a URL when the blob arrives
  //   • revokes the previous URL when the blob changes (e.g. "record again")
  //   • revokes on unmount via the cleanup function
  // Per CLAUDE.md Phase 3: ALWAYS revoke object URLs to prevent memory leaks.
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    if (!audioBlob) return;

    const url = URL.createObjectURL(audioBlob);
    audioUrlRef.current = url;

    // Pass both blob and final duration to the parent
    onRecordingCompleteRef.current(audioBlob, recordingDurationRef.current);

    return () => {
      URL.revokeObjectURL(url);
      audioUrlRef.current = null;
    };
  }, [audioBlob]);

  const isActive = isRecording || isPaused;
  const hasRecording = audioBlob !== null;

  // Derive the current audio src from the ref (stable — not re-rendered on ref change)
  const audioSrc = audioUrlRef.current;

  const handleClear = useCallback(() => {
    clearRecording();
  }, [clearRecording]);

  return (
    <div className="space-y-4">
      {/* Recorder card */}
      <div className="rounded-2xl glass border border-white/10 p-8">

        {/* ── Visual indicator + timer ── */}
        <div className="flex flex-col items-center gap-4 mb-8">

          {/* Animated mic ring */}
          <div className="relative flex items-center justify-center">
            {/* Outer ping rings — only visible while actively recording */}
            {isRecording && (
              <>
                <span className="absolute inline-flex h-28 w-28 rounded-full bg-red-500/20 animate-ping" />
                <span
                  className="absolute inline-flex h-24 w-24 rounded-full bg-red-500/15 animate-ping"
                  style={{ animationDelay: "0.3s", animationDuration: "1.2s" }}
                />
              </>
            )}

            {/* Core circle */}
            <div
              className={cn(
                "relative flex h-20 w-20 items-center justify-center rounded-full border-2 transition-all duration-300",
                isRecording
                  ? "border-red-500 bg-red-500/15 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                  : isPaused
                    ? "border-amber-500 bg-amber-500/15"
                    : hasRecording
                      ? "border-emerald-500 bg-emerald-500/15"
                      : "border-white/20 bg-white/5"
              )}
            >
              <Mic
                className={cn(
                  "h-8 w-8 transition-colors duration-300",
                  isRecording
                    ? "text-red-400"
                    : isPaused
                      ? "text-amber-400"
                      : hasRecording
                        ? "text-emerald-400"
                        : "text-muted-foreground"
                )}
              />
            </div>
          </div>

          {/* Timer */}
          <div
            className={cn(
              "font-mono text-5xl font-semibold tabular-nums tracking-widest transition-colors duration-300",
              isRecording
                ? "text-red-400"
                : isPaused
                  ? "text-amber-400"
                  : "text-foreground"
            )}
          >
            {formatTime(recordingDuration)}
          </div>

          {/* Status label */}
          <span
            className={cn(
              "text-xs font-medium tracking-wide uppercase transition-colors duration-300",
              isRecording
                ? "text-red-400"
                : isPaused
                  ? "text-amber-400"
                  : hasRecording
                    ? "text-emerald-400"
                    : "text-muted-foreground"
            )}
          >
            {isRecording
              ? "● Recording"
              : isPaused
                ? "⏸ Paused"
                : hasRecording
                  ? "✓ Complete"
                  : "Ready"}
          </span>
        </div>

        {/* ── Controls ── */}
        <div className="flex items-center justify-center gap-3">

          {/* Not started, no blob → Start */}
          {!isActive && !hasRecording && (
            <Button
              className="gradient-violet hover:opacity-90 transition-opacity px-8 h-10"
              onClick={startRecording}
              disabled={disabled}
            >
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          )}

          {/* Actively recording → Pause + Stop */}
          {isRecording && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={pauseRecording}
                className="h-11 w-11 border-white/15 hover:border-white/30 hover:bg-white/5"
                title="Pause"
              >
                <Pause className="h-5 w-5" />
                <span className="sr-only">Pause</span>
              </Button>

              <Button
                variant="destructive"
                size="icon"
                onClick={stopRecording}
                className="h-11 w-11"
                title="Stop"
              >
                <Square className="h-4 w-4 fill-current" />
                <span className="sr-only">Stop recording</span>
              </Button>
            </>
          )}

          {/* Paused → Resume + Stop */}
          {isPaused && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={resumeRecording}
                className="h-11 w-11 border-white/15 hover:border-white/30 hover:bg-white/5"
                title="Resume"
              >
                <Play className="h-5 w-5 fill-current" />
                <span className="sr-only">Resume</span>
              </Button>

              <Button
                variant="destructive"
                size="icon"
                onClick={stopRecording}
                className="h-11 w-11"
                title="Stop"
              >
                <Square className="h-4 w-4 fill-current" />
                <span className="sr-only">Stop recording</span>
              </Button>
            </>
          )}

          {/* Has blob → Record again */}
          {hasRecording && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={disabled}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Record Again
            </Button>
          )}
        </div>
      </div>

      {/* ── Mic permission / device error ── */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Audio preview ── */}
      {hasRecording && audioSrc && (
        <div className="rounded-xl glass border border-white/10 px-4 pt-3 pb-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Preview</p>
            <p className="text-xs text-muted-foreground">
              {formatTime(recordingDuration)} ·{" "}
              {mimeType.split(";")[0].split("/")[1]?.toUpperCase() ?? "Audio"}
            </p>
          </div>
          {/* color-scheme: dark nudges browsers to render native controls in dark mode */}
          <audio
            key={audioSrc}
            src={audioSrc}
            controls
            className="w-full"
            style={{ colorScheme: "dark", height: "36px" }}
          />
        </div>
      )}
    </div>
  );
}
