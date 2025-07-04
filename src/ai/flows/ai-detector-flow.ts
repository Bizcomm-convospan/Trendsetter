import 'server-only';
'use server';
/**
 * @fileOverview An AI agent for detecting and improving AI-generated content.
 *
 * - detectAiContent - A function that analyzes text for AI-like qualities and suggests improvements.
 * - AiDetectorInput - The input type for the detectAiContent function.
 * - AiDetectorOutput - The return type for the detectAiContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiDetectorInputSchema = z.object({
  content: z.string().describe('The text content to analyze.'),
});
export type AiDetectorInput = z.infer<typeof AiDetectorInputSchema>;

const SuggestionSchema = z.object({
  originalText: z.string().describe("A snippet of the original text that could be improved."),
  suggestedChange: z.string().describe("The suggested replacement for the original snippet."),
  reason: z.string().describe("An explanation for why the change improves the content's human-like quality."),
});

const AiDetectorOutputSchema = z.object({
  overallAnalysis: z.string().describe("A brief, overall analysis of the content's human-like quality and tone."),
  humanizationScore: z.number().min(0).max(100).describe("A score from 0 to 100 indicating how human-like the text is, where 100 is very human-like."),
  suggestions: z.array(SuggestionSchema).describe("Specific, actionable suggestions to make the text more human-like."),
  humanizedContent: z.string().describe("The full content, rewritten to be more human-like based on the analysis and suggestions."),
});
export type AiDetectorOutput = z.infer<typeof AiDetectorOutputSchema>;

export async function detectAiContent(input: AiDetectorInput): Promise<AiDetectorOutput> {
  return aiDetectorFlow(input);
}

const aiDetectorPrompt = ai.definePrompt({
  name: 'aiDetectorPrompt',
  input: {schema: AiDetectorInputSchema},
  output: {schema: AiDetectorOutputSchema},
  prompt: `You are an expert AI Content Quality Analyzer. Your task is to evaluate the provided text for its 'human-like' qualities.
Analyze the text for robotic phrasing, repetitive sentence structures, unnatural tone, and other signs of AI generation.

Provided Text:
"{{{content}}}"

Your analysis must include:
1.  **Overall Analysis**: A brief, overall summary of the content's tone and human-like quality.
2.  **Humanization Score**: A numerical score from 0 (very robotic) to 100 (very human-like).
3.  **Suggestions**: A list of specific, actionable suggestions. For each suggestion, provide the original text snippet, the suggested change, and a brief reason for the improvement.
4.  **Humanized Content**: The full content rewritten to sound more natural and human-like, incorporating your suggestions.

Return the entire response in the specified JSON format.
`,
});

const aiDetectorFlow = ai.defineFlow(
  {
    name: 'aiDetectorFlow',
    inputSchema: AiDetectorInputSchema,
    outputSchema: AiDetectorOutputSchema,
  },
  async (input) => {
    const {output} = await aiDetectorPrompt(input);
    return output!;
  }
);
