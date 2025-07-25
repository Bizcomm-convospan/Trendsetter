
'use server';
/**
 * @fileOverview An AI agent for checking content originality.
 *
 * - checkPlagiarism - A function that analyzes text and returns an originality score.
 * - PlagiarismCheckerInput - The input type for the function.
 * - PlagiarismCheckerOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const PlagiarismCheckerInputSchema = z.object({
  content: z.string().min(50).describe('The text content to check for originality.'),
});
export type PlagiarismCheckerInput = z.infer<typeof PlagiarismCheckerInputSchema>;

const MatchedSegmentSchema = z.object({
  segment: z.string().describe("The specific text segment that is potentially unoriginal."),
  sourceType: z.string().describe("A description of the likely source type (e.g., 'A common knowledge fact from an encyclopedia', 'A direct quote from a news article')."),
});

export const PlagiarismCheckerOutputSchema = z.object({
  originalityScore: z.number().min(0).max(100).describe("An overall score from 0 to 100, where 100 means the content is completely original."),
  analysis: z.string().describe("A brief, overall analysis of the content's originality and any potential issues."),
  matchedSegments: z.array(MatchedSegmentSchema).describe("A list of specific text segments that match common phrases or sources."),
});
export type PlagiarismCheckerOutput = z.infer<typeof PlagiarismCheckerOutputSchema>;

export async function checkPlagiarism(input: PlagiarismCheckerInput): Promise<PlagiarismCheckerOutput> {
  return plagiarismCheckerFlow(input);
}

const plagiarismCheckerPrompt = ai.definePrompt({
  name: 'plagiarismCheckerPrompt',
  input: {schema: PlagiarismCheckerInputSchema},
  output: {schema: PlagiarismCheckerOutputSchema},
  prompt: `
    You are an AI-powered Plagiarism and Originality Checker. Your task is to analyze the provided text for originality.
    You do not have access to a live web index. Instead, you must use your vast training data to identify common phrases, well-known facts, direct quotes, and sentence structures that are not unique.

    Provided Text:
    ---
    {{{content}}}
    ---

    Your analysis must include:
    1.  **Originality Score**: A score from 0 (likely plagiarized) to 100 (very original). Base this on the uniqueness of the phrasing and sentence construction.
    2.  **Analysis Summary**: A brief summary of your findings.
    3.  **Matched Segments**: A list of specific text segments that are potentially unoriginal. For each segment, describe the *type* of source it likely comes from (e.g., 'A common idiom', 'A well-known historical fact', 'A quote attributed to a famous person'). DO NOT provide URLs.

    Return the entire response in the specified JSON format.
`,
});

const plagiarismCheckerFlow = ai.defineFlow(
  {
    name: 'plagiarismCheckerFlow',
    inputSchema: PlagiarismCheckerInputSchema,
    outputSchema: PlagiarismCheckerOutputSchema,
  },
  async (input) => {
    const {output} = await plagiarismCheckerPrompt(input);
    return output!;
  }
);
