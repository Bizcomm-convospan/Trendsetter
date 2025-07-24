
'use server';
/**
 * @fileOverview An AI agent for generating social media content from an article.
 * @deprecated This flow is now consolidated into the `generate-seo-article` flow for optimization.
 *
 * - generateSocialMediaContent - A function that takes an article and creates tailored posts
 *   for platforms like Twitter, LinkedIn, and Facebook.
 * - SocialMediaInput - The input type for the generateSocialMediaContent function.
 * - SocialMediaOutput - The return type for the generateSocialMediaContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SocialMediaInputSchema = z.object({
  articleContent: z.string().min(100).describe('The full content of the article to generate social media posts from.'),
  articleTitle: z.string().describe('The title of the article.'),
});
export type SocialMediaInput = z.infer<typeof SocialMediaInputSchema>;

const SocialMediaOutputSchema = z.object({
  twitterThread: z.array(z.string()).describe('A thread of 2-3 tweets, each a maximum of 280 characters, including relevant hashtags.'),
  linkedInPost: z.string().describe('A professional and engaging post for LinkedIn, including relevant hashtags.'),
  facebookPost: z.string().describe('A more casual and engaging post for Facebook, including relevant hashtags and possibly a question to drive engagement.'),
});
export type SocialMediaOutput = z.infer<typeof SocialMediaOutputSchema>;

export async function generateSocialMediaContent(input: SocialMediaInput): Promise<SocialMediaOutput> {
    throw new Error('This flow is deprecated. Please use the unified `generateSeoArticle` flow instead.');
}
