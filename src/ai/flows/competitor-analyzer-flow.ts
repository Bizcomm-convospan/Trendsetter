
'use server';
/**
 * @fileOverview This flow has been moved to the `functions` directory.
 * @deprecated This file is no longer used and will be removed in a future update.
 */

import { z } from 'zod';

// This file is intentionally left mostly blank as the flow now runs in the
// backend Firebase Functions environment. Keeping the type definitions here
// can be useful for the frontend if it needs to know about the shape of the data,
// but the actual flow logic is gone from the Next.js environment.

export const CompetitorAnalyzerInputSchema = z.object({
  url: z.string().url().describe('The URL of the competitor article to analyze.'),
});
export type CompetitorAnalyzerInput = z.infer<typeof CompetitorAnalyzerInputSchema>;


export const CompetitorAnalyzerOutputSchema = z.object({
  keyTopics: z.array(z.string()).describe("A list of the main topics and keywords the article is optimized for."),
  contentGrade: z.string().describe("An overall grade (A-F) for the content, assessing readability, structure, and SEO."),
  contentGaps: z.array(z.string()).describe("A list of related sub-topics the competitor failed to cover, representing content opportunities."),
  toneAnalysis: z.string().describe("A summary of the article's tone and writing style (e.g., 'Formal and academic', 'Casual and conversational')."),
});
export type CompetitorAnalyzerOutput = z.infer<typeof CompetitorAnalyzerOutputSchema>;

export async function analyzeCompetitor(input: CompetitorAnalyzerInput): Promise<CompetitorAnalyzerOutput> {
  // This function is now just a stub and should not be called directly from the frontend.
  // The server action `handleCompetitorAnalysis` now calls the deployed Firebase Function.
  throw new Error("The 'analyzeCompetitor' flow should not be called directly from the Next.js environment. Use the corresponding server action instead.");
}
