export interface TranscriptWord {
  text: string;
  startMs: number;
  endMs: number;
  confidence: number;
  speaker: string;
}

export interface TranscriptSegment {
  speaker: string;
  text: string;
  startMs: number;
  endMs: number;
  confidence: number;
  words: TranscriptWord[];
}

export interface Transcript {
  fullText: string;
  segments: TranscriptSegment[];
  wordCount: number;
  speakerCount: number;
  confidence: number;
  processingTime: number;
  createdAt: Date;
}
