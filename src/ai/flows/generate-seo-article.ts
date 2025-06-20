'use server';

/**
 * @fileOverview A flow for generating SEO-optimized articles from a trending topic.
 *
 * - generateSeoArticle - A function that handles the generation of SEO-optimized articles.
 * - GenerateSeoArticleInput - The input type for the generateSeoArticle function.
 * - GenerateSeoArticleOutput - The return type for the generateSeoArticle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSeoArticleInputSchema = z.object({
  trendingTopic: z
    .string()
    .describe('The trending topic to generate an article about.'),
});
export type GenerateSeoArticleInput = z.infer<typeof GenerateSeoArticleInputSchema>;

const GenerateSeoArticleOutputSchema = z.object({
  title: z.string().describe('The title of the article.'),
  content: z.string().describe('The SEO-optimized content of the article.'),
  featuredImagePrompt: z.string().describe('A prompt to use to generate a featured image for the article.'),
});
export type GenerateSeoArticleOutput = z.infer<typeof GenerateSeoArticleOutputSchema>;

export async function generateSeoArticle(input: GenerateSeoArticleInput): Promise<GenerateSeoArticleOutput> {
  return generateSeoArticleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSeoArticlePrompt',
  input: {schema: GenerateSeoArticleInputSchema},
  output: {schema: GenerateSeoArticleOutputSchema},
  prompt: `You are an expert SEO content writer. Generate an SEO-optimized article about the following trending topic. The article should be 300-500 words.

Trending Topic: {{{trendingTopic}}}

The article should have a title and content. Also suggest a prompt that can be used to generate a featured image for the article.

Make sure to use markdown formatting.
`,
});

const generateSeoArticleFlow = ai.defineFlow(
  {
    name: 'generateSeoArticleFlow',
    inputSchema: GenerateSeoArticleInputSchema,
    outputSchema: GenerateSeoArticleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
