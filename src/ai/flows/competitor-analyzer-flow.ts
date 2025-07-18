'use server';
/**
 * @fileOverview An AI agent for analyzing a competitor's article.
 *
 * - analyzeCompetitor - A function that analyzes a competitor's URL.
 * - CompetitorAnalyzerInput - The input type for the function.
 * - CompetitorAnalyzerOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { crawlUrlTool } from '../tools/crawl';


const CompetitorAnalyzerInputSchema = z.object({
  url: z.string().url().describe('The URL of the competitor article to analyze.'),
});
export type CompetitorAnalyzerInput = z.infer<typeof CompetitorAnalyzerInputSchema>;


const CompetitorAnalyzerOutputSchema = z.object({
  keyTopics: z.array(z.string()).describe("A list of the main topics and keywords the article is optimized for."),
  contentGrade: z.string().describe("An overall grade (A-F) for the content, assessing readability, structure, and SEO."),
  contentGaps: z.array(z.string()).describe("A list of related sub-topics the competitor failed to cover, representing content opportunities."),
  toneAnalysis: z.string().describe("A summary of the article's tone and writing style (e.g., 'Formal and academic', 'Casual and conversational')."),
});
export type CompetitorAnalyzerOutput = z.infer<typeof CompetitorAnalyzerOutputSchema>;

export async function analyzeCompetitor(input: CompetitorAnalyzerInput): Promise<CompetitorAnalyzerOutput> {
  return competitorAnalyzerFlow(input);
}

const competitorAnalyzerPrompt = ai.definePrompt({
  name: 'competitorAnalyzerPrompt',
  input: { schema: z.object({ content: z.string() }) }, // Receives clean text content
  output: { schema: CompetitorAnalyzerOutputSchema },
  prompt: `
    You are a world-class SEO analyst and content strategist. Your task is to analyze the following article text and create a "Competitor Report Card".

    Analyze the text and provide the following report:
    1.  **Key Topics**: What are the primary topics and keywords this article seems to be targeting?
    2.  **Content Grade**: Give the article an overall grade from A to F, based on its readability and structure.
    3.  **Content Gaps**: What related, important sub-topics did the author miss? Identify 3-5 opportunities to create a more comprehensive article.
    4.  **Tone Analysis**: Describe the writing style and tone of the article.

    Return the report in the specified JSON format.

    Article Text to Analyze:
    ---
    {{{content}}}
    ---
  `,
});


const competitorAnalyzerFlow = ai.defineFlow(
  {
    name: 'competitorAnalyzerFlow',
    inputSchema: CompetitorAnalyzerInputSchema,
    outputSchema: CompetitorAnalyzerOutputSchema,
  },
  async (input) => {
    // Step 1: Crawl the URL to get the clean text content using the tool.
    const cleanContent = await crawlUrlTool(input);

    if (!cleanContent) {
      throw new Error("Failed to retrieve content from the URL.");
    }

    // Step 2: Pass the clean content to the analysis prompt.
    const { output } = await competitorAnalyzerPrompt({ content: cleanContent });
    return output!;
  }
);
