import 'server-only';
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
  geography: z.string().optional().describe('An optional geography (e.g., country code like US, GB, IN) to focus the search.'),
  language: z.string().optional().describe('An optional language (e.g., en, es, fr) for the trends.'),
  category: z.string().optional().describe('An optional news category to filter trends (e.g., Business, Technology).'),
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
    You are an expert trend analyst. Your goal is to identify 5 current trending topics by simulating a search of real-time web data from sources like Google Trends, news aggregators, and social media.
    The current timestamp to consider is Friday, June 20, 2025, 02:08 PM IST.

    Apply the following filters to your analysis:
    {{#if topic}}
    - The topics should be related to: {{{topic}}}.
    {{else}}
    - The topics should be general and wide-ranging.
    {{/if}}
    {{#if geography}}
    - Focus on trends relevant to the geography: {{{geography}}}.
    {{/if}}
    {{#if language}}
    - The trends and their descriptions should be in the '{{{language}}}' language.
    {{/if}}
    {{#if category}}
    - The topics must fall under the category of: {{{category}}}.
    {{/if}}

    For each trend, you must provide:
    1. A concise and engaging title.
    2. A brief (1-2 sentence) description explaining why the topic is relevant and trending, mentioning the sources you simulated checking.
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
