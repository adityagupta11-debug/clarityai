export interface CommunicationScore {
  score: number;
  feedback: string;
  clarity: number;
  conciseness: number;
  articulation: number;
}

export interface VocabularyScore {
  score: number;
  feedback: string;
  sophisticationLevel: "basic" | "intermediate" | "advanced" | "expert";
  industryTermsUsed: string[];
  suggestedTerms: string[];
  overusedWords: { word: string; count: number }[];
}

export interface RelevanceScore {
  score: number;
  feedback: string;
  questionResponseAlignment: number;
  tangentCount: number;
}

export interface ConfidenceScore {
  score: number;
  feedback: string;
  assertivenessLevel: "low" | "moderate" | "high";
  hedgingPhrases: string[];
}

export interface StructureScore {
  score: number;
  feedback: string;
  usedSTAR: boolean;
  usedFramework: string | null;
  structuredResponses: number;
  unstructuredResponses: number;
}

export interface Insight {
  title: string;
  description: string;
  evidence: string;
  impact: "high" | "medium" | "low";
}

export interface Suggestion {
  title: string;
  description: string;
  category: string;
  priority: "critical" | "important" | "nice-to-have";
  example: string;
}

export interface QuestionAnalysis {
  question: string;
  response: string;
  score: number;
  feedback: string;
  improvedResponse: string;
  timeSpent: number;
  relevanceScore: number;
}

export interface SpeechMetrics {
  totalSpeakingTime: number;
  averagePace: number;
  fillerWords: { word: string; count: number }[];
  totalFillerCount: number;
  longestPause: number;
  averagePauseDuration: number;
  stutterInstances: number;
  speakingRatio: number;
}

export interface Analysis {
  overallScore: number;
  summary: string;
  categories: {
    communication: CommunicationScore;
    vocabulary: VocabularyScore;
    relevance: RelevanceScore;
    confidence: ConfidenceScore;
    structure: StructureScore;
  };
  strengths: Insight[];
  weaknesses: Insight[];
  suggestions: Suggestion[];
  questionBreakdown: QuestionAnalysis[];
  speechMetrics: SpeechMetrics;
  modelUsed: string;
  promptVersion: string;
  generatedAt: Date;
}
