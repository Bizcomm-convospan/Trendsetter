
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
  title: z.string().describe('The title or name of the trend.'),
  source: z.string().describe('The simulated source of the trend (e.g., Twitter, Google Trends).'),
  relevanceScore: z.number().min(0).max(1).describe('A simulated relevance score from 0 to 1.'),
});
export type DiscoveredTrend = z.infer<typeof DiscoveredTrendSchema>;

const DiscoverTrendsOutputSchema = z.object({
  discoveredTrends: z.array(DiscoveredTrendSchema).describe('A list of discovered trends.'),
});
export type DiscoverTrendsOutput = z.infer<typeof DiscoverTrendsOutputSchema>;

export async function discoverTrends(input: DiscoverTrendsInput): Promise<DiscoverTrendsOutput> {
  return discoverTrendsFlow(input);
}

const fetchTrendsTool = ai.defineTool({
  name: 'fetchTrendsTool',
  description: 'Simulates fetching trending topics from various web sources based on an optional input topic. If no topic is provided, general trends are returned.',
  inputSchema: DiscoverTrendsInputSchema,
  outputSchema: DiscoverTrendsOutputSchema,
},
async (input) => {
  // Mock implementation: In a real scenario, this would call external APIs or web scraping services.
  const generalTrends: DiscoveredTrend[] = [
    { title: 'AI in Sustainable Agriculture', source: 'Research Journals', relevanceScore: 0.85 },
    { title: 'The Future of Remote Work Tools', source: 'Tech Blogs', relevanceScore: 0.92 },
    { title: 'Personalized Healthcare Wearables', source: 'Google Trends', relevanceScore: 0.78 },
    { title: 'Quantum Computing Breakthroughs', source: 'Academic Conferences', relevanceScore: 0.95 },
    { title: 'Sustainable Fashion Innovations', source: 'Social Media Buzz', relevanceScore: 0.80 },
  ];

  const topicSpecificTrends: Record<string, DiscoveredTrend[]> = {
    'technology': [
      { title: 'Next-Gen AI Chips', source: 'Industry News', relevanceScore: 0.90 },
      { title: 'Decentralized Web (Web3) Adoption', source: 'Developer Forums', relevanceScore: 0.88 },
    ],
    'marketing': [
      { title: 'Hyper-Personalization in Ads', source: 'Marketing Blogs', relevanceScore: 0.85 },
      { title: 'Short-form Video Content Dominance', source: 'Social Media Trends', relevanceScore: 0.91 },
    ],
     'finance': [
      { title: 'DeFi Regulation Challenges', source: 'Financial News', relevanceScore: 0.82 },
      { title: 'AI-Powered Financial Advisors', source: 'Fintech Publications', relevanceScore: 0.87 },
    ]
  };

  if (input.topic && topicSpecificTrends[input.topic.toLowerCase()]) {
    return { discoveredTrends: [...topicSpecificTrends[input.topic.toLowerCase()], ...generalTrends.slice(0,2)] };
  }
  return { discoveredTrends: generalTrends };
});

const discoverTrendsPrompt = ai.definePrompt({
  name: 'discoverTrendsPrompt',
  tools: [fetchTrendsTool],
  input: {schema: DiscoverTrendsInputSchema},
  output: {schema: DiscoverTrendsOutputSchema},
  prompt: `You are an AI assistant that helps users discover trending topics.
  
  Use the fetchTrendsTool to get current trends. 
  {{#if topic}}
  Focus on trends related to: {{{topic}}}.
  {{else}}
  Fetch general trending topics.
  {{/if}}
  
  Return the discovered trends. Ensure the output is valid JSON conforming to the specified schema.
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
