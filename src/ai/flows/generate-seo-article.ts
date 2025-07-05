'use server';

/**
 * @fileOverview A flow for generating SEO-optimized articles and saving them as drafts in Firestore.
 *
 * - generateSeoArticle - A function that handles the generation of SEO-optimized articles.
 * - GenerateSeoArticleInput - The input type for the generateSeoArticle function.
 * - GenerateSeoArticleOutput - The return type for the generateSeoArticle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const GenerateSeoArticleInputSchema = z.object({
  topic: z
    .string()
    .describe('The topic or keyword to generate an article about.'),
});
export type GenerateSeoArticleInput = z.infer<typeof GenerateSeoArticleInputSchema>;

const SeoMetaSchema = z.object({
  title: z.string().describe('An SEO-optimized title (around 60 characters).'),
  description: z.string().describe('An SEO-optimized meta description (around 155 characters).'),
});

const GenerateSeoArticleOutputSchema = z.object({
  title: z.string().describe('The main title of the article.'),
  content: z.string().describe('The SEO-optimized content of the article, in HTML format.'),
  featuredImagePrompt: z.string().describe('A prompt to use to generate a featured image for the article.'),
  meta: z.object({
    yoast: SeoMetaSchema.describe('SEO metadata for the Yoast SEO plugin.'),
    aioseo: SeoMetaSchema.describe('SEO metadata for the All in One SEO (AIOSEO) plugin.'),
  }).describe('SEO metadata for popular WordPress plugins.'),
});
export type GenerateSeoArticleOutput = z.infer<typeof GenerateSeoArticleOutputSchema>;

export async function generateSeoArticle(input: GenerateSeoArticleInput): Promise<GenerateSeoArticleOutput> {
  return generateSeoArticleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSeoArticlePrompt',
  input: {schema: GenerateSeoArticleInputSchema},
  output: {schema: GenerateSeoArticleOutputSchema},
  prompt: `You are an expert SEO content writer. Generate an SEO-optimized article about the following topic or keyword. The article should be 300-500 words.

Topic/Keyword: {{{topic}}}

The response must include:
1.  A main title for the article.
2.  The full article content in HTML format. Use appropriate tags like \`<p>\`, \`<h2>\`, \`<h3>\`, \`<ul>\`, \`<li>\`, and \`<strong>\`.
3.  A suggested prompt for a featured image.
4.  SEO metadata for both Yoast SEO and All in One SEO plugins. For each, provide a unique, optimized title (around 60 characters) and a meta description (around 155 characters).

Return the entire response in the specified JSON format.
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

    if (output) {
      await adminDb.collection('articles').add({
        ...output,
        status: 'draft',
        createdAt: FieldValue.serverTimestamp(),
        topic: input.topic,
      });
      console.log(`Article "${output.title}" saved as draft in Firestore.`);
    }

    return output!;
  }
);
