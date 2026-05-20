"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface UseAudioRecorderReturn {
  /** True while MediaRecorder is actively capturing (not paused, not stopped). */
  isRecording: boolean;
  /** True while a recording session is paused and can be resumed. */
  isPaused: boolean;
  /** Elapsed recording time in whole seconds. Excludes time spent paused. */
  recordingDuration: number;
  /** The final audio Blob, available only after stopRecording() completes. */
  audioBlob: Blob | null;
  /** MIME type chosen for this recording (e.g. "audio/webm;codecs=opus"). */
  mimeType: string;
  /** Human-readable error string, or null when no error. */
  error: string | null;
  startRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => void;
  /** Discards the current session and resets all state back to defaults. */
  clearRecording: () => void;
}

/**
 * Returns the best MIME type the current browser's MediaRecorder supports.
 * Preference order: webm/opus (Chrome/Firefox) → mp4 (Safari) → ogg/opus → ogg.
 */
function getBestMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

function getMicPermissionError(err: unknown): string {
  if (!(err instanceof DOMException)) {
    return "An unexpected error occurred while starting the recording.";
  }
  switch (err.name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return "Microphone access denied. Please allow it in your browser settings and try again.";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "No microphone found. Please connect one and try again.";
    case "NotReadableError":
    case "TrackStartError":
      return "Microphone is already in use by another application.";
    case "OverconstrainedError":
      return "No microphone matches the required constraints.";
    case "AbortError":
      return "Microphone access was interrupted. Please try again.";
    default:
      return `Could not access microphone: ${err.message}`;
  }
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mimeType, setMimeType] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Internal refs — mutations here never trigger re-renders
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Accurate duration tracking across pause/resume cycles.
  // We record the wall-clock start of each active segment and accumulate
  // the sum of completed segments in accumulatedRef.
  const segmentStartRef = useRef<number>(0); // Date.now() at last start/resume
  const accumulatedRef = useRef<number>(0);  // seconds from all completed segments

  // ── Timer helpers ──────────────────────────────────────────

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    segmentStartRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const segmentElapsed = (Date.now() - segmentStartRef.current) / 1000;
      setRecordingDuration(
        Math.round(accumulatedRef.current + segmentElapsed)
      );
    }, 1000);
  }, []);

  // ── Stream helper ──────────────────────────────────────────

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // ── Public API ─────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    // Guard: don't start a second session on top of an existing one
    if (recorderRef.current) return;

    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Your browser does not support audio recording.");
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      setError(getMicPermissionError(err));
      return;
    }

    streamRef.current = stream;
    const chosenMime = getBestMimeType();

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(
        stream,
        chosenMime ? { mimeType: chosenMime } : undefined
      );
    } catch {
      // Some browsers don't support the chosen MIME type at construction time
      recorder = new MediaRecorder(stream);
    }

    recorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const finalMime =
        recorder.mimeType || chosenMime || "audio/webm";
      const blob = new Blob(chunksRef.current, { type: finalMime });
      setAudioBlob(blob);
      // Stream tracks are stopped here after data is flushed
      releaseStream();
    };

    // Collect a chunk every 250 ms so short recordings aren't lost
    recorder.start(250);

    // Reset duration counters for this new session
    accumulatedRef.current = 0;
    setRecordingDuration(0);
    setMimeType(chosenMime);
    setIsRecording(true);
    setIsPaused(false);
    startTimer();
  }, [startTimer, releaseStream]);

  const pauseRecording = useCallback(() => {
    if (recorderRef.current?.state !== "recording") return;

    recorderRef.current.pause();
    clearTimer();

    // Bank the elapsed time from this segment before pausing
    accumulatedRef.current += (Date.now() - segmentStartRef.current) / 1000;

    setIsRecording(false);
    setIsPaused(true);
  }, [clearTimer]);

  const resumeRecording = useCallback(() => {
    if (recorderRef.current?.state !== "paused") return;

    recorderRef.current.resume();
    setIsRecording(true);
    setIsPaused(false);
    startTimer();
  }, [startTimer]);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return;

    // Bank remaining time if we're mid-segment (not paused)
    if (recorder.state === "recording") {
      accumulatedRef.current += (Date.now() - segmentStartRef.current) / 1000;
    }

    clearTimer();
    recorder.stop(); // triggers onstop → sets audioBlob, releases stream

    setRecordingDuration(Math.round(accumulatedRef.current));
    setIsRecording(false);
    setIsPaused(false);
    recorderRef.current = null;
  }, [clearTimer]);

  const clearRecording = useCallback(() => {
    clearTimer();

    // Remove onstop before stopping so the discarded blob is never surfaced
    if (recorderRef.current) {
      recorderRef.current.onstop = null;
      if (recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
      recorderRef.current = null;
    }

    releaseStream();
    chunksRef.current = [];
    accumulatedRef.current = 0;

    setIsRecording(false);
    setIsPaused(false);
    setRecordingDuration(0);
    setAudioBlob(null);
    setMimeType("");
    setError(null);
  }, [clearTimer, releaseStream]);

  // ── Cleanup on unmount ─────────────────────────────────────

  useEffect(() => {
    return () => {
      clearTimer();
      // Silence onstop so an unmounted component doesn't setState
      if (recorderRef.current) {
        recorderRef.current.onstop = null;
        if (recorderRef.current.state !== "inactive") {
          recorderRef.current.stop();
        }
      }
      releaseStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — refs are stable, helpers are stable

  return {
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
  };
}
