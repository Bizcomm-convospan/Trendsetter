'use server';
/**
 * @fileOverview An AI agent for generating a comprehensive keyword strategy.
 *
 * - generateKeywordStrategy - A function that takes a core topic and generates a structured plan including
 *   primary keywords, long-tail variations, and related questions.
 * - KeywordStrategyInput - The input type for the generateKeywordStrategy function.
 * - KeywordStrategyOutput - The return type for the generateKeywordStrategy function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const KeywordStrategyInputSchema = z.object({
  topic: z.string().describe('The core topic for which to generate a keyword strategy.'),
});
export type KeywordStrategyInput = z.infer<typeof KeywordStrategyInputSchema>;

const KeywordGroupSchema = z.object({
    keyword: z.string().describe("The keyword phrase."),
    intent: z.enum(["informational", "navigational", "commercial", "transactional"]).describe("The likely user intent behind the keyword."),
    searchVolume: z.string().describe("An estimated monthly search volume (e.g., '1.2k', '500')."),
});

const KeywordStrategyOutputSchema = z.object({
  primaryKeywords: z.array(KeywordGroupSchema).describe("A list of 3-5 high-level, primary keywords that are central to the topic."),
  longTailKeywords: z.array(KeywordGroupSchema).describe("A list of 5-7 more specific, multi-word long-tail keywords that target niche audiences."),
  relatedQuestions: z.array(z.string()).describe("A list of 5-7 questions that users are likely to ask, similar to Google's 'People Also Ask' section."),
});
export type KeywordStrategyOutput = z.infer<typeof KeywordStrategyOutputSchema>;


export async function generateKeywordStrategy(input: KeywordStrategyInput): Promise<KeywordStrategyOutput> {
  return keywordStrategyFlow(input);
}


const keywordStrategyPrompt = ai.definePrompt({
    name: 'keywordStrategyPrompt',
    input: { schema: KeywordStrategyInputSchema },
    output: { schema: KeywordStrategyOutputSchema },
    prompt: `
        You are a master SEO strategist. For the given topic, generate a comprehensive keyword strategy.
        Your strategy must identify the user intent (informational, navigational, commercial, transactional) and estimate monthly search volume for each keyword.

        Topic: "{{{topic}}}"

        Your output must include:
        1.  **Primary Keywords**: 3-5 core, high-volume keywords.
        2.  **Long-Tail Keywords**: 5-7 more specific, lower-volume keywords with high intent.
        3.  **Related Questions**: 5-7 common questions users ask about this topic.

        Return the entire response in the specified JSON format.
    `
});


const keywordStrategyFlow = ai.defineFlow(
  {
    name: 'keywordStrategyFlow',
    inputSchema: KeywordStrategyInputSchema,
    outputSchema: KeywordStrategyOutputSchema,
  },
  async (input) => {
    console.log(`[Keyword Strategy Flow] Generating strategy for topic: ${input.topic}`);
    const { output } = await keywordStrategyPrompt(input);
    if (!output) {
      throw new Error("Keyword strategy generation failed to produce an output.");
    }
    console.log(`[Keyword Strategy Flow] Successfully generated strategy.`);
    return output;
  }
);
