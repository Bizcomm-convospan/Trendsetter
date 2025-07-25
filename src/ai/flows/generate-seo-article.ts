
'use server';

/**
 * @fileOverview A flow for generating SEO-optimized articles and saving them as drafts in Firestore.
 * This flow is now optimized to generate headlines and social posts in a single call.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { HeadlineSuggestionSchema, SocialMediaPostSchema } from './schemas';

const GenerateSeoArticleInputSchema = z.object({
  topic: z
    .string()
    .describe('The topic or keyword to generate an article about.'),
  language: z.string().optional().describe('The language for the article (e.g., en, es, fr).'),
  template: z.enum(['standard', 'listicle', 'how-to']).default('standard').describe('The structure of the article (e.g., standard blog post, listicle, how-to).'),
  tone: z.enum(['professional', 'casual', 'witty', 'authoritative']).default('professional').describe('The desired writing style and tone for the article.'),
  brandVoice: z.string().optional().describe('A description of the brand voice to use for the article.'),
  customGuidelines: z.string().optional().describe('Specific rules or guidelines the AI must follow.'),
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
  headlineSuggestions: z.array(HeadlineSuggestionSchema).describe("A list of 5-7 suggested headlines for the article."),
  socialMediaPosts: SocialMediaPostSchema.describe("A collection of social media posts tailored for different platforms."),
});
export type GenerateSeoArticleOutput = z.infer<typeof GenerateSeoArticleOutputSchema>;

export async function generateSeoArticle(input: GenerateSeoArticleInput): Promise<GenerateSeoArticleOutput> {
  return generateSeoArticleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSeoArticlePrompt',
  input: {schema: GenerateSeoArticleInputSchema},
  output: {schema: GenerateSeoArticleOutputSchema},
  prompt: `You are an expert SEO content writer and social media manager.
Your task is to generate a comprehensive content package based on the user's topic. This includes a high-quality article, metadata, an image prompt, headline ideas, and social media posts. The article should be 300-500 words and align with Google's E-E-A-T guidelines.

**Topic/Keyword:** {{{topic}}}

**Formatting Instructions:**
- **Article Structure:** Generate the article based on the '{{{template}}}' template.
  {{#if (eq template "listicle")}}
  (e.g., a numbered or bulleted list of items, such as 'Top 5...' or '7 Ways to...').
  {{else if (eq template "how-to")}}
  (e.g., a step-by-step guide to accomplishing a task).
  {{else}}
  (e.g., a standard informational blog post with an introduction, body, and conclusion).
  {{/if}}
- **Tone of Voice:** Write in a '{{{tone}}}' tone.
- **Language:** The entire output must be in the following language: {{#if language}}{{{language}}}{{else}}English{{/if}}.

**Brand & Guideline Instructions:**
{{#if brandVoice}}
- **Brand Voice:** You must adhere to the following brand voice: "{{{brandVoice}}}"
{{/if}}
{{#if customGuidelines}}
- **Custom Guidelines:** You must strictly follow these rules: "{{{customGuidelines}}}"
{{/if}}


**The response must include all of the following:**
1.  **Article Title**: An engaging and informative main title for the article.
2.  **Article Content**: The full article in well-structured HTML format (use <p>, <h2>, <h3>, <ul>, <li>, <strong>).
3.  **Featured Image Prompt**: A descriptive prompt for an AI image generator to create a relevant featured image.
4.  **SEO Metadata**: Unique, optimized titles (60 chars) and meta descriptions (155 chars) for both Yoast SEO and AIOSEO plugins.
5.  **Headline Suggestions**: 5-7 varied and compelling headline ideas. For each, provide its 'angle' (e.g., "Listicle", "How-To") and a 'click-through score' (0-100).
6.  **Social Media Posts**:
    *   A 2-3 tweet Twitter thread.
    *   A professional LinkedIn post.
    *   An engaging Facebook post.

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
    // Fetch global brand settings from Firestore
    const brandSettingsRef = adminDb.collection('settings').doc('brand');
    const brandSettingsDoc = await brandSettingsRef.get();
    const brandSettings = brandSettingsDoc.data();

    const fullInput = {
        ...input,
        brandVoice: brandSettings?.brandVoice || input.brandVoice,
        customGuidelines: brandSettings?.customGuidelines || input.customGuidelines,
    };
    
    // The flow will now use the default model configured in `ai/genkit.ts`.
    console.log('Using Google AI model for generation.');
    const llmResponse = await prompt(fullInput);

    const output = llmResponse.output();

    if (output) {
      await adminDb.collection('articles').add({
        ...output,
        status: 'draft',
        createdAt: FieldValue.serverTimestamp(),
        topic: input.topic,
      });
      console.log(`Article "${output.title}" and its assets were saved as a draft in Firestore.`);
    }

    return output!;
  }
);
