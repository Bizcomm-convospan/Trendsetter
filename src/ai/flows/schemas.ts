/**
 * @fileOverview Shared Zod schemas for AI flows.
 */
import {z} from 'zod';

export const DiscoveredTrendSchema = z.object({
  title: z.string().describe('The title of the trending topic.'),
  description: z.string().describe('A brief (1-2 sentence) explanation of why this topic is currently trending.'),
  keywords: z.array(z.string()).describe('A list of 3-5 related keywords for SEO.'),
});
export type DiscoveredTrend = z.infer<typeof DiscoveredTrendSchema>;

export const HeadlineSuggestionSchema = z.object({
    headline: z.string().describe("The suggested headline text."),
    angle: z.string().describe("The angle or type of the headline (e.g., 'How-To', 'Controversial', 'List-based')."),
    clickThroughScore: z.number().min(0).max(100).describe("An AI-generated score from 0-100 indicating the headline's potential click-through rate."),
});
export type HeadlineSuggestion = z.infer<typeof HeadlineSuggestionSchema>;

export const SocialMediaPostSchema = z.object({
  twitterThread: z.array(z.string()).describe('A thread of 2-3 tweets, each a maximum of 280 characters, including relevant hashtags.'),
  linkedInPost: z.string().describe('A professional and engaging post for LinkedIn, including relevant hashtags.'),
  facebookPost: z.string().describe('A more casual and engaging post for Facebook, including relevant hashtags and possibly a question to drive engagement.'),
});
export type SocialMediaPost = z.infer<typeof SocialMediaPostSchema>;
