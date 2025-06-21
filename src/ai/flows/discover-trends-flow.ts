
'use server';
/**
 * @fileOverview A flow for discovering trending topics.
 *
 * - discoverTrends - A function that handles discovering current trends, optionally based on a topic.
 * - DiscoverTrendsInput - The input type for the discoverTrends function.
 * - DiscoverTrendsOutput - The return type for the discoverTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiscoverTrendsInputSchema = z.object({
  topic: z.string().optional().describe('An optional topic to focus the trend discovery.'),
});
export type DiscoverTrendsInput = z.infer<typeof DiscoverTrendsInputSchema>;

const DiscoveredTrendSchema = z.object({
  title: z.string().describe('The title of the trending topic.'),
  description: z.string().describe('A brief (1-2 sentence) explanation of why this topic is currently trending.'),
  keywords: z.array(z.string()).describe('A list of 3-5 related keywords for SEO.'),
});
export type DiscoveredTrend = z.infer<typeof DiscoveredTrendSchema>;

const DiscoverTrendsOutputSchema = z.object({
  discoveredTrends: z.array(DiscoveredTrendSchema).describe('A list of discovered trends.'),
});
export type DiscoverTrendsOutput = z.infer<typeof DiscoverTrendsOutputSchema>;

export async function discoverTrends(input: DiscoverTrendsInput): Promise<DiscoverTrendsOutput> {
  return discoverTrendsFlow(input);
}

const discoverTrendsPrompt = ai.definePrompt({
  name: 'discoverTrendsPrompt',
  input: {schema: DiscoverTrendsInputSchema},
  output: {schema: DiscoverTrendsOutputSchema},
  prompt: `
    You are an expert trend analyst. Your goal is to identify 5 current trending topics.
    {{#if topic}}
    The topics should be related to: {{{topic}}}.
    {{else}}
    The topics should be general and wide-ranging.
    {{/if}}

    For each trend, you must provide:
    1. A concise and engaging title.
    2. A brief (1-2 sentence) description explaining why the topic is relevant and trending.
    3. A list of 3-5 relevant SEO keywords that could be used for an article on the topic.

    Return the results in the specified JSON format.
  `,
});

const discoverTrendsFlow = ai.defineFlow(
  {
    name: 'discoverTrendsFlow',
    inputSchema: DiscoverTrendsInputSchema,
    outputSchema: DiscoverTrendsOutputSchema,
  },
  async (input) => {
    const {output} = await discoverTrendsPrompt(input);
    return output!;
  }
);
