
'use server';
/**
 * @fileOverview An AI flow for generating multiple headline options for an article.
 * @deprecated This flow is now consolidated into the `generate-seo-article` flow for optimization.
 *
 * - generateHeadlines - A function that generates a variety of headlines.
 * - GenerateHeadlinesInput - The input type for the function.
 * - GenerateHeadlinesOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateHeadlinesInputSchema = z.object({
  articleContent: z.string().min(100).describe('The full content of the article to generate headlines for.'),
});
export type GenerateHeadlinesInput = z.infer<typeof GenerateHeadlinesInputSchema>;

const HeadlineSuggestionSchema = z.object({
    headline: z.string().describe("The suggested headline text."),
    angle: z.string().describe("The angle or type of the headline (e.g., 'How-To', 'Controversial', 'List-based')."),
    clickThroughScore: z.number().min(0).max(100).describe("An AI-generated score from 0-100 indicating the headline's potential click-through rate."),
});

const GenerateHeadlinesOutputSchema = z.object({
    headlines: z.array(HeadlineSuggestionSchema).describe("A list of 5-7 suggested headlines for the article.")
});
export type GenerateHeadlinesOutput = z.infer<typeof GenerateHeadlinesOutputSchema>;

export async function generateHeadlines(input: GenerateHeadlinesInput): Promise<GenerateHeadlinesOutput> {
  throw new Error('This flow is deprecated. Please use the unified `generateSeoArticle` flow instead.');
}
