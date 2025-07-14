'use server';
/**
 * @fileOverview An AI agent for generating social media content from an article.
 *
 * - generateSocialMediaContent - A function that takes an article and creates tailored posts
 *   for platforms like Twitter, LinkedIn, and Facebook.
 * - SocialMediaInput - The input type for the generateSocialMediaContent function.
 * - SocialMediaOutput - The return type for the generateSocialMediaContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

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
    return socialMediaFlow(input);
}


const socialMediaPrompt = ai.definePrompt({
    name: 'socialMediaPrompt',
    input: { schema: SocialMediaInputSchema },
    output: { schema: SocialMediaOutputSchema },
    prompt: `
        You are a social media marketing expert. Your task is to create engaging social media content based on the provided article.

        Article Title: "{{{articleTitle}}}"
        Article Content:
        ---
        {{{articleContent}}}
        ---

        Based on the article, generate the following:
        1.  **Twitter Thread**: Create a thread of 2-3 tweets. Each tweet must be under 280 characters. Summarize the key points and end with a concluding thought or question. Include 2-3 relevant hashtags.
        2.  **LinkedIn Post**: Write a professional post suitable for a business audience. Start with a strong hook, summarize the article's value, and include 3-4 relevant hashtags.
        3.  **Facebook Post**: Write a casual and engaging post. It should summarize the article in a relatable way and end with a question to encourage comments. Include 2-3 relevant hashtags.

        Return the entire response in the specified JSON format.
    `
});


const socialMediaFlow = ai.defineFlow(
  {
    name: 'socialMediaFlow',
    inputSchema: SocialMediaInputSchema,
    outputSchema: SocialMediaOutputSchema,
  },
  async (input) => {
    console.log(`[Social Media Flow] Generating content for article: ${input.articleTitle}`);
    const { output } = await socialMediaPrompt(input);
     if (!output) {
      throw new Error("Social media content generation failed to produce an output.");
    }
    console.log(`[Social Media Flow] Successfully generated social media content.`);
    return output;
  }
);
