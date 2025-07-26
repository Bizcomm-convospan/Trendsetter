
'use server';
/**
 * @fileOverview A flow for discovering trending topics with verifiable citations.
 *
 * - discoverTrends - A function that handles discovering current trends, optionally based on a topic.
 * - DiscoverTrendsInput - The input type for the discoverTrends function.
 * - DiscoverTrendsOutput - The return type for the discoverTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import googleSearch from '@genkit-ai/googleai';
import { DiscoveredTrend, DiscoveredTrendSchema } from './schemas';

const DiscoverTrendsInputSchema = z.object({
  topic: z.string().optional().describe('An optional topic to focus the trend discovery.'),
  geography: z.string().optional().describe('An optional geography (e.g., country code like US, GB, IN) to focus the search.'),
  language: z.string().optional().describe('An optional language (e.g., en, es, fr) for the trends.'),
  category: z.string().optional().describe('An optional news category to filter trends (e.g., Business, Technology).'),
});
export type DiscoverTrendsInput = z.infer<typeof DiscoverTrendsInputSchema>;

export type { DiscoveredTrend };

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
  tools: [googleSearch], // Enable the Google Search tool for grounding
  toolConfig: {
    googleSearch: {
        blocklist: [], // You can block certain sites if needed
    },
  },
  prompt: `
    You are an expert trend analyst. Your goal is to identify 5 current trending topics by searching real-time web data from sources like Google Trends, news aggregators, and social media.
    You MUST use the provided Google Search tool to find these trends and use the search results as the basis for your answer. You must cite your sources.

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
    2. A brief (1-2 sentence) description explaining why the topic is relevant and trending, based on the search results.
    3. A list of 3-5 relevant SEO keywords that could be used for an article on the topic.
    4. A list of citations from the search tool that support the trend.

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
    const llmResponse = await discoverTrendsPrompt(input);
    const output = llmResponse.output();
    
    if (!output) {
        throw new Error("Trend discovery failed to produce an output.");
    }

    // Attach citation data to the output
    const populatedTrends = output.discoveredTrends.map(trend => {
        const trendCitations = llmResponse.citations?.filter(citation => 
            (citation.title.includes(trend.title) || trend.description.includes(citation.title))
        );
        return {
            ...trend,
            citations: trendCitations?.map(c => ({ title: c.title, url: c.url })) || [],
        }
    });

    return { discoveredTrends: populatedTrends };
  }
);
