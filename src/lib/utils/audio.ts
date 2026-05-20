import { AUDIO_MAX_SIZE_BYTES, SUPPORTED_AUDIO_TYPES } from "./constants";

export interface AudioValidationResult {
  valid: boolean;
  error?: string;
}

export function validateAudioFile(file: File): AudioValidationResult {
  if (!SUPPORTED_AUDIO_TYPES.includes(file.type as (typeof SUPPORTED_AUDIO_TYPES)[number])) {
    return {
      valid: false,
      error: `Unsupported format. Please upload MP3, WAV, M4A, MP4, WebM, or OGG.`,
    };
  }

  if (file.size > AUDIO_MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `File too large. Maximum size is 500 MB.`,
    };
  }

  return { valid: true };
}

export function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);

    audio.addEventListener("loadedmetadata", () => {
      URL.revokeObjectURL(url);
      resolve(audio.duration);
    });

    audio.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load audio file"));
    });

    audio.src = url;
  });
}

export function formatMimeType(mimeType: string): string {
  const map: Record<string, string> = {
    "audio/mpeg": "MP3",
    "audio/mp3": "MP3",
    "audio/wav": "WAV",
    "audio/m4a": "M4A",
    "audio/mp4": "M4A",
    "audio/webm": "WebM",
    "audio/ogg": "OGG",
  };
  return map[mimeType] ?? mimeType.split("/")[1]?.toUpperCase() ?? "Audio";
}
