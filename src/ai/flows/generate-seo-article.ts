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
  prompt: `You are an expert SEO content writer. Generate an SEO-optimized article about the following trending topic. The article should be 300-500 words.

Trending Topic: {{{trendingTopic}}}

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
      const webhookUrl = process.env.WP_WEBHOOK_URL;
      const webhookToken = process.env.WP_WEBHOOK_TOKEN;
      
      const isUrlConfigured = webhookUrl && !webhookUrl.includes('your-webhook-url-here');
      const isTokenConfigured = webhookToken && !webhookToken.includes('your_saved_token_here');

      if (isUrlConfigured && isTokenConfigured) {
        try {
          console.log(`Sending generated article to WordPress webhook: ${webhookUrl}`);
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-ai-token': webhookToken,
            },
            body: JSON.stringify({
              title: output.title,
              content: output.content,
              meta: output.meta,
            }),
          });

          if (!response.ok) {
            const errorBody = await response.text();
            console.error(`WordPress webhook failed with status ${response.status}:`, errorBody);
          } else {
            console.log('Successfully pushed article to WordPress.');
          }
        } catch (error: any) {
          console.error('Error calling WordPress webhook:', error.message);
        }
      } else {
          console.warn('WP_WEBHOOK_URL or WP_WEBHOOK_TOKEN are not configured in .env. Skipping push to WordPress.');
      }
    }

    return output!;
  }
);
