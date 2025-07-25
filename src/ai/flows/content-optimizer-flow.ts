'use server';
/**
 * @fileOverview An AI agent for analyzing content and providing SEO optimization feedback.
 *
 * - analyzeContentForSeo - A function that analyzes text and returns a content score and suggestions.
 * - ContentOptimizerInput - The input type for the function.
 * - ContentOptimizerOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ContentOptimizerInputSchema = z.object({
  content: z.string().describe('The full text content to analyze for SEO optimization.'),
  keyword: z.string().describe('The primary target keyword for the content.'),
  language: z.string().optional().describe('The language of the content (e.g., "en", "es"). Defaults to English.'),
});
export type ContentOptimizerInput = z.infer<typeof ContentOptimizerInputSchema>;

export const ContentOptimizerOutputSchema = z.object({
  contentScore: z.number().min(0).max(100).describe("An overall score from 0 to 100 based on on-page SEO factors, where 100 is perfectly optimized."),
  analysis: z.object({
      structure: z.string().describe("Feedback on the content's structure (headings, paragraphs)."),
      readability: z.string().describe("Feedback on the content's readability and complexity."),
      keywordUsage: z.string().describe("Feedback on the usage of the primary keyword."),
      grammarAndClarity: z.string().describe("Feedback on the content's grammar, spelling, and overall clarity."),
      toneAndStyle: z.string().describe("Analysis of the content's writing style and tone (e.g., formal, conversational, persuasive)."),
  }).describe("A breakdown of the analysis across key SEO areas."),
  recommendations: z.array(z.string()).describe("A list of the top 3-5 actionable recommendations to improve the score."),
  nlpKeywords: z.array(z.string()).describe("A list of 5-10 related NLP-friendly keywords and entities that should be included in the content."),
});
export type ContentOptimizerOutput = z.infer<typeof ContentOptimizerOutputSchema>;

export async function analyzeContentForSeo(input: ContentOptimizerInput): Promise<ContentOptimizerOutput> {
  return contentOptimizerFlow(input);
}

const contentOptimizerPrompt = ai.definePrompt({
  name: 'contentOptimizerPrompt',
  input: {schema: ContentOptimizerInputSchema},
  output: {schema: ContentOptimizerOutputSchema},
  prompt: `
    You are an expert SEO Content Analyst and Editor, similar to the engine behind SurferSEO or MarketMuse.
    Your task is to analyze the provided text based on a target keyword and provide a detailed optimization report.

    The user wants to rank for the keyword: "{{{keyword}}}"
    {{#if language}}The content is in this language: {{{language}}}{{/if}}

    Analyze the following content:
    ---
    {{{content}}}
    ---

    Your analysis must include:
    1.  **Content Score**: An overall score from 0-100, where 100 is perfectly optimized. Base this on structure, readability, and keyword usage.
    2.  **Analysis Breakdown**:
        *   **Structure**: Comment on the use of headings (H1, H2, etc.), paragraph length, and overall article structure.
        *   **Readability**: Assess the complexity of the language. Is it easy to read?
        *   **Keyword Usage**: Is the primary keyword used effectively (not too much, not too little)?
        *   **Grammar and Clarity**: Check for grammatical errors, spelling mistakes, and awkward phrasing that affects clarity.
        *   **Tone and Style**: Describe the writing style and tone (e.g., 'Formal and academic', 'Casual and conversational', 'Persuasive').
    3.  **Recommendations**: Provide a list of the top 3-5 most impactful, actionable steps the user can take to improve their score.
    4.  **NLP Keywords**: Provide a list of 5-10 important, semantically related keywords and entities that are missing or underutilized in the text. This helps with topical authority.

    Return the entire response in the specified JSON format.
`,
});

const contentOptimizerFlow = ai.defineFlow(
  {
    name: 'contentOptimizerFlow',
    inputSchema: ContentOptimizerInputSchema,
    outputSchema: ContentOptimizerOutputSchema,
  },
  async (input) => {
    const {output} = await contentOptimizerPrompt(input);
    return output!;
  }
);
