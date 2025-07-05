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
