'use server';
/**
 * @fileOverview An AI agent for analyzing the performance of a published article and suggesting improvements.
 *
 * - analyzeContentPerformance - Analyzes performance data and provides actionable recommendations.
 * - AnalyzePerformanceInput - The input type for the function.
 * - AnalyzePerformanceOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PerformanceDataSchema = z.object({
  views: z.number().describe("The total number of views or impressions the article received."),
  ctr: z.number().describe("The click-through rate (clicks / impressions). A low CTR might indicate a weak headline."),
  engagementRate: z.number().describe("A measure of user interaction (e.g., comments, shares, time on page). Low engagement might indicate the content isn't compelling."),
});

export const AnalyzePerformanceInputSchema = z.object({
  articleTitle: z.string().describe("The title of the article being analyzed."),
  articleTopic: z.string().describe("The original topic or keyword for the article."),
  performanceData: PerformanceDataSchema,
});
export type AnalyzePerformanceInput = z.infer<typeof AnalyzePerformanceInputSchema>;

export const AnalyzePerformanceOutputSchema = z.object({
  diagnosis: z.string().describe("A concise, one-sentence diagnosis of the article's main performance issue (e.g., 'The headline is not attracting clicks despite good visibility.')."),
  recommendation: z.string().describe("A clear, actionable recommendation for what to do next (e.g., 'Generate new headline variations to improve the click-through rate.')."),
  suggestedAction: z.enum(["optimize_headlines", "humanize_content", "rewrite_article", "none"]).describe("The specific tool or action the user should take next."),
});
export type AnalyzePerformanceOutput = z.infer<typeof AnalyzePerformanceOutputSchema>;

export async function analyzeContentPerformance(input: AnalyzePerformanceInput): Promise<AnalyzePerformanceOutput> {
  return analyzePerformanceFlow(input);
}


const analyzePerformancePrompt = ai.definePrompt({
  name: 'analyzePerformancePrompt',
  input: { schema: AnalyzePerformanceInputSchema },
  output: { schema: AnalyzePerformanceOutputSchema },
  prompt: `
    You are a data-driven SEO Analyst and Content Strategist. Your task is to analyze the performance metrics of a published article and provide a single, actionable recommendation to improve it.

    Article Title: "{{{articleTitle}}}"
    Article Topic: "{{{articleTopic}}}"
    
    Performance Data:
    - Views/Impressions: {{{performanceData.views}}}
    - Click-Through Rate (CTR): {{{performanceData.ctr}}}%
    - Engagement Rate: {{{performanceData.engagementRate}}}%

    Based on this data, perform the following:
    1.  **Diagnose the primary weakness.**
        - If CTR is low (e.g., < 2%) but views are high, the headline is likely the problem.
        - If CTR is high but engagement is low (e.g., < 40%), the content itself may be uninteresting, robotic, or fail to deliver on the headline's promise.
        - If views are very low, the core topic might not be in demand, or the article needs a complete rewrite for a different keyword.
    2.  **Provide a concise diagnosis** summarizing this weakness.
    3.  **Formulate a clear recommendation** for the user's next step.
    4.  **Suggest a specific action** that maps to one of the application's tools: 'optimize_headlines', 'humanize_content', or 'rewrite_article'.

    Return the result in the specified JSON format.
  `,
});

const analyzePerformanceFlow = ai.defineFlow(
  {
    name: 'analyzePerformanceFlow',
    inputSchema: AnalyzePerformanceInputSchema,
    outputSchema: AnalyzePerformanceOutputSchema,
  },
  async (input) => {
    console.log(`[Performance Analysis Flow] Analyzing: ${input.articleTitle}`);
    const { output } = await analyzePerformancePrompt(input);
    if (!output) {
      throw new Error("Performance analysis failed to produce an output.");
    }
    console.log(`[Performance Analysis Flow] Successfully generated analysis.`);
    return output;
  }
);
