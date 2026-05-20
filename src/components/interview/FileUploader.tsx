"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, Music, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { validateAudioFile } from "@/lib/utils/audio";
import { formatFileSize } from "@/lib/utils/formatting";
import { SUPPORTED_AUDIO_EXTENSIONS } from "@/lib/utils/constants";

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  onFileRemoved?: () => void;
  disabled?: boolean;
}

export function FileUploader({ onFileSelected, onFileRemoved, disabled }: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  // Tracks nested drag-enter/leave events so we only toggle isDragOver when
  // the cursor actually leaves the drop zone, not just a child element.
  const dragCounterRef = useRef(0);

  const handleFile = useCallback(
    (file: File) => {
      const result = validateAudioFile(file);
      if (!result.valid) {
        setError(result.error ?? "Invalid file.");
        return;
      }
      setError(null);
      setSelectedFile(file);
      onFileSelected(file);
    },
    [onFileSelected]
  );

  // ── Drag-and-drop handlers ─────────────────────────────────
  // Per CLAUDE.md Phase 3: use pure HTML5 drag events, always call
  // e.preventDefault() to stop the browser from opening the file.

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current++;
      if (!disabled) setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    // Must call preventDefault here to allow the drop event to fire
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragOver(false);
      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [disabled, handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset so the same file can be re-selected after removal
      e.target.value = "";
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    setError(null);
    onFileRemoved?.();
  }, [onFileRemoved]);

  // ── Selected file card ─────────────────────────────────────

  if (selectedFile) {
    return (
      <div className="rounded-2xl glass border border-emerald-500/25 p-5 transition-all">
        <div className="flex items-center gap-4">
          {/* File icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/20">
            <Music className="h-5 w-5 text-emerald-400" />
          </div>

          {/* File info */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Ready to upload
              </span>
            </div>
          </div>

          {/* Remove button — plain Button, no asChild needed */}
          {!disabled && (
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={handleRemove}
              className="shrink-0 text-muted-foreground hover:text-foreground hover:bg-white/8"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ── Drop zone ──────────────────────────────────────────────

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cn(
          "relative flex flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed p-12 text-center",
          "transition-all duration-200 select-none outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring/50",
          isDragOver
            ? "border-violet-500 bg-violet-500/10 scale-[1.01] cursor-copy"
            : error
              ? "border-red-500/40 bg-red-500/5 cursor-pointer hover:border-red-500/60"
              : "border-white/15 cursor-pointer hover:border-violet-500/40 hover:bg-white/3",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none"
        )}
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept={SUPPORTED_AUDIO_EXTENSIONS.join(",")}
          className="sr-only"
          onChange={handleInputChange}
          disabled={disabled}
          aria-hidden
        />

        {/* Upload icon */}
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-2xl border transition-all duration-200",
            isDragOver
              ? "gradient-violet glow-violet border-transparent"
              : "bg-white/5 border-white/10"
          )}
        >
          <Upload
            className={cn(
              "h-7 w-7 transition-colors duration-200",
              isDragOver ? "text-white" : "text-muted-foreground"
            )}
          />
        </div>

        {/* Copy */}
        <div className="space-y-1.5">
          <p className="text-sm font-medium">
            {isDragOver ? "Drop to upload" : "Drag & drop your audio file"}
          </p>
          <p className="text-xs text-muted-foreground">
            or{" "}
            <span className="text-violet-400 underline underline-offset-2">
              click to browse
            </span>
            {" "}· MP3, WAV, M4A, WebM, OGG up to 500 MB
          </p>
        </div>
      </div>

      {/* Validation error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
