'use server';
/**
 * @fileOverview An AI flow for finding questions people are asking about a topic.
 *
 * - questionSpy - A function that finds questions related to a topic.
 * - QuestionSpyInput - The input type for the function.
 * - QuestionSpyOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const QuestionSpyInputSchema = z.object({
  topic: z.string().min(2).describe('The topic or keyword to find questions about.'),
});
export type QuestionSpyInput = z.infer<typeof QuestionSpyInputSchema>;


const QuestionSpyOutputSchema = z.object({
  gettingStarted: z.array(z.string()).describe("Questions for beginners or those new to the topic."),
  comparisons: z.array(z.string()).describe("Questions comparing the topic to alternatives (e.g., 'X vs Y')."),
  problemSolving: z.array(z.string()).describe("Questions about solving specific problems related to the topic."),
  advanced: z.array(z.string()).describe("Questions for users who already have some knowledge of the topic."),
});
export type QuestionSpyOutput = z.infer<typeof QuestionSpyOutputSchema>;

export async function questionSpy(input: QuestionSpyInput): Promise<QuestionSpyOutput> {
  return questionSpyFlow(input);
}

const questionSpyPrompt = ai.definePrompt({
  name: 'questionSpyPrompt',
  input: {schema: QuestionSpyInputSchema},
  output: {schema: QuestionSpyOutputSchema},
  prompt: `
    You are a market research expert with a talent for understanding user intent.
    Your task is to find the most pressing questions people are asking about a given topic.
    Simulate searching through Google's "People Also Ask", Reddit, Quora, and other forums to compile a comprehensive list of questions.

    The user's topic is: "{{{topic}}}"

    Categorize the questions you find into the following groups:
    - gettingStarted: For beginners.
    - comparisons: "X vs Y" style questions.
    - problemSolving: "How to fix..." or "Why is X happening..."
    - advanced: For users with existing knowledge.

    Generate 3-5 questions for each category.

    Return the result in the specified JSON format.
  `,
});

const questionSpyFlow = ai.defineFlow(
  {
    name: 'questionSpyFlow',
    inputSchema: QuestionSpyInputSchema,
    outputSchema: QuestionSpyOutputSchema,
  },
  async (input) => {
    const {output} = await questionSpyPrompt(input);
    return output!;
  }
);
