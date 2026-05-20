import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Zod schemas — mirror every interface in src/types/analysis.ts for the
// portion that Gemini generates.  Three server-computed fields are intentionally
// absent from the Gemini schema and added by the service layer before saving:
//   • speechMetrics  – derived from AssemblyAI word-level timestamps
//   • modelUsed      – set by gemini.ts at call-time
//   • promptVersion  – set by gemini.ts at call-time
//   • generatedAt    – server timestamp set by Firestore write
// ─────────────────────────────────────────────────────────────────────────────

const scoreField = z.number().min(0).max(100);

// ── Category sub-schemas ──────────────────────────────────────────────────────

export const CommunicationScoreSchema = z.object({
  score:         scoreField,
  feedback:      z.string().min(1),
  clarity:       scoreField,
  conciseness:   scoreField,
  articulation:  scoreField,
});

export const VocabularyScoreSchema = z.object({
  score:                scoreField,
  feedback:             z.string().min(1),
  sophisticationLevel:  z.enum(["basic", "intermediate", "advanced", "expert"]),
  industryTermsUsed:    z.array(z.string()),
  suggestedTerms:       z.array(z.string()),
  overusedWords:        z.array(z.object({ word: z.string(), count: z.number().int().min(0) })),
});

export const RelevanceScoreSchema = z.object({
  score:                      scoreField,
  feedback:                   z.string().min(1),
  questionResponseAlignment:  scoreField,
  tangentCount:               z.number().int().min(0),
});

export const ConfidenceScoreSchema = z.object({
  score:              scoreField,
  feedback:           z.string().min(1),
  assertivenessLevel: z.enum(["low", "moderate", "high"]),
  hedgingPhrases:     z.array(z.string()),
});

export const StructureScoreSchema = z.object({
  score:                 scoreField,
  feedback:              z.string().min(1),
  usedSTAR:              z.boolean(),
  usedFramework:         z.string().nullable(),
  structuredResponses:   z.number().int().min(0),
  unstructuredResponses: z.number().int().min(0),
});

// ── Insight, Suggestion, QuestionAnalysis ────────────────────────────────────

export const InsightSchema = z.object({
  title:       z.string().min(1),
  description: z.string().min(1),
  evidence:    z.string().min(1), // direct quote from transcript
  impact:      z.enum(["high", "medium", "low"]),
});

export const SuggestionSchema = z.object({
  title:       z.string().min(1),
  description: z.string().min(1),
  category:    z.string().min(1),
  priority:    z.enum(["critical", "important", "nice-to-have"]),
  example:     z.string().min(1), // "Instead of X, try saying Y"
});

export const QuestionAnalysisSchema = z.object({
  question:         z.string().min(1),
  response:         z.string().min(1),
  score:            scoreField,
  feedback:         z.string().min(1),
  improvedResponse: z.string().min(1),
  timeSpent:        z.number().min(0),        // seconds — Gemini estimates from word count
  relevanceScore:   scoreField,
});

// ── Root Gemini response schema ───────────────────────────────────────────────

export const GeminiResponseSchema = z.object({
  overallScore: scoreField,
  summary:      z.string().min(1),

  categories: z.object({
    communication: CommunicationScoreSchema,
    vocabulary:    VocabularyScoreSchema,
    relevance:     RelevanceScoreSchema,
    confidence:    ConfidenceScoreSchema,
    structure:     StructureScoreSchema,
  }),

  // The prompt instructs Gemini to return exactly 3 of each; we use .min(1)
  // here so a partial response (2 or 4 items) doesn't hard-fail validation.
  strengths:  z.array(InsightSchema).min(1),
  weaknesses: z.array(InsightSchema).min(1),
  suggestions: z.array(SuggestionSchema).min(1),

  questionBreakdown: z.array(QuestionAnalysisSchema),
});

/** TypeScript type for the parsed Gemini response — use this in gemini.ts */
export type GeminiAnalysisResponse = z.infer<typeof GeminiResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// JSON Schema object for Gemini's `responseSchema` API parameter.
//
// Firebase AI Logic (and the Vertex AI Gemini API) accept a JSON Schema-
// compatible object in the `generationConfig.responseSchema` field.  The
// format uses lowercase type strings ("object", "array", "string", "number",
// "boolean", "integer") and a `nullable: true` extension for nullable fields.
//
// This is intentionally kept in sync with GeminiResponseSchema above — if you
// add a field to one, add it to the other.
// ─────────────────────────────────────────────────────────────────────────────

const scoreProperty = { type: "number", minimum: 0, maximum: 100 };

const communicationScoreProperties = {
  score:        scoreProperty,
  feedback:     { type: "string" },
  clarity:      scoreProperty,
  conciseness:  scoreProperty,
  articulation: scoreProperty,
};

const vocabularyScoreProperties = {
  score:               scoreProperty,
  feedback:            { type: "string" },
  sophisticationLevel: { type: "string", enum: ["basic", "intermediate", "advanced", "expert"] },
  industryTermsUsed:   { type: "array",  items: { type: "string" } },
  suggestedTerms:      { type: "array",  items: { type: "string" } },
  overusedWords: {
    type:  "array",
    items: {
      type: "object",
      properties: {
        word:  { type: "string" },
        count: { type: "integer", minimum: 0 },
      },
      required: ["word", "count"],
    },
  },
};

const relevanceScoreProperties = {
  score:                     scoreProperty,
  feedback:                  { type: "string" },
  questionResponseAlignment: scoreProperty,
  tangentCount:              { type: "integer", minimum: 0 },
};

const confidenceScoreProperties = {
  score:              scoreProperty,
  feedback:           { type: "string" },
  assertivenessLevel: { type: "string", enum: ["low", "moderate", "high"] },
  hedgingPhrases:     { type: "array", items: { type: "string" } },
};

const structureScoreProperties = {
  score:                 scoreProperty,
  feedback:              { type: "string" },
  usedSTAR:              { type: "boolean" },
  usedFramework:         { type: "string", nullable: true },
  structuredResponses:   { type: "integer", minimum: 0 },
  unstructuredResponses: { type: "integer", minimum: 0 },
};

const insightProperties = {
  title:       { type: "string" },
  description: { type: "string" },
  evidence:    { type: "string" },
  impact:      { type: "string", enum: ["high", "medium", "low"] },
};

const suggestionProperties = {
  title:       { type: "string" },
  description: { type: "string" },
  category:    { type: "string" },
  priority:    { type: "string", enum: ["critical", "important", "nice-to-have"] },
  example:     { type: "string" },
};

const questionAnalysisProperties = {
  question:         { type: "string" },
  response:         { type: "string" },
  score:            scoreProperty,
  feedback:         { type: "string" },
  improvedResponse: { type: "string" },
  timeSpent:        { type: "number", minimum: 0 },
  relevanceScore:   scoreProperty,
};

export const GEMINI_JSON_SCHEMA = {
  type: "object",
  properties: {
    overallScore: scoreProperty,
    summary:      { type: "string" },

    categories: {
      type: "object",
      properties: {
        communication: { type: "object", properties: communicationScoreProperties,  required: Object.keys(communicationScoreProperties) },
        vocabulary:    { type: "object", properties: vocabularyScoreProperties,     required: Object.keys(vocabularyScoreProperties) },
        relevance:     { type: "object", properties: relevanceScoreProperties,      required: Object.keys(relevanceScoreProperties) },
        confidence:    { type: "object", properties: confidenceScoreProperties,     required: Object.keys(confidenceScoreProperties) },
        structure:     { type: "object", properties: structureScoreProperties,      required: Object.keys(structureScoreProperties) },
      },
      required: ["communication", "vocabulary", "relevance", "confidence", "structure"],
    },

    strengths:  { type: "array", items: { type: "object", properties: insightProperties,    required: Object.keys(insightProperties) } },
    weaknesses: { type: "array", items: { type: "object", properties: insightProperties,    required: Object.keys(insightProperties) } },
    suggestions:{ type: "array", items: { type: "object", properties: suggestionProperties, required: Object.keys(suggestionProperties) } },

    questionBreakdown: {
      type:  "array",
      items: { type: "object", properties: questionAnalysisProperties, required: Object.keys(questionAnalysisProperties) },
    },
  },
  required: [
    "overallScore",
    "summary",
    "categories",
    "strengths",
    "weaknesses",
    "suggestions",
    "questionBreakdown",
  ],
} as const;
