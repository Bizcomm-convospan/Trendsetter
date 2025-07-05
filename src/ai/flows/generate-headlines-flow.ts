'use server';
/**
 * @fileOverview An AI flow for generating multiple headline options for an article.
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
  return generateHeadlinesFlow(input);
}

const generateHeadlinesPrompt = ai.definePrompt({
  name: 'generateHeadlinesPrompt',
  input: {schema: GenerateHeadlinesInputSchema},
  output: {schema: GenerateHeadlinesOutputSchema},
  prompt: `
    You are an expert copywriter and marketing strategist specializing in creating viral headlines.
    Analyze the following article content and generate 5-7 compelling, clickable headlines.

    For each headline, you must provide:
    1. The headline text itself.
    2. The "angle" or type of the headline (e.g., "How-To", "Question-based", "Controversial", "Listicle", "Benefit-driven").
    3. An estimated "Click-Through Score" from 0 to 100, where 100 is most likely to be clicked.

    Article Content:
    ---
    {{{articleContent}}}
    ---

    Return the result in the specified JSON format.
  `,
});

const generateHeadlinesFlow = ai.defineFlow(
  {
    name: 'generateHeadlinesFlow',
    inputSchema: GenerateHeadlinesInputSchema,
    outputSchema: GenerateHeadlinesOutputSchema,
  },
  async (input) => {
    const {output} = await generateHeadlinesPrompt(input);
    return output!;
  }
);
