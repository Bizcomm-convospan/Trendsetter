'use server';
/**
 * @fileOverview An AI agent for generating content angles from trends.
 *
 * - answerTheAI - Generates questions based on a list of trends.
 * - AnswerTheAIInput - The input type for the answerTheAI function.
 * - AnswerTheAIOutput - The return type for the answerTheAI function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { DiscoveredTrendSchema } from './schemas';

const AnswerTheAIInputSchema = z.array(DiscoveredTrendSchema);
export type AnswerTheAIInput = z.infer<typeof AnswerTheAIInputSchema>;

const AnswerTheAIOutputSchema = z.object({
  who: z.array(z.string().describe("Questions starting with 'Who'")).describe("Questions exploring the people involved or affected."),
  what: z.array(z.string().describe("Questions starting with 'What'")).describe("Questions exploring the events, concepts, or details."),
  when: z.array(z.string().describe("Questions starting with 'When'")).describe("Questions exploring the timeline and urgency."),
  where: z.array(z.string().describe("Questions starting with 'Where'")).describe("Questions exploring the locations and geographical context."),
  how: z.array(z.string().describe("Questions starting with 'How'")).describe("Questions exploring the processes and mechanisms."),
});
export type AnswerTheAIOutput = z.infer<typeof AnswerTheAIOutputSchema>;


export async function answerTheAI(input: AnswerTheAIInput): Promise<AnswerTheAIOutput> {
  return answerTheAIFlow(input);
}

const answerTheAIPrompt = ai.definePrompt({
  name: 'answerTheAIPrompt',
  input: { schema: AnswerTheAIInputSchema },
  output: { schema: AnswerTheAIOutputSchema },
  prompt: `
    You are a master content strategist and journalist. Your task is to take a list of trending topics and generate a series of probing questions to inspire high-quality content creation.
    For the given trends, formulate questions under the categories of "Who", "What", "When", "Where", and "How".
    Think about all the possible angles a journalist would investigate.

    The trends are:
    {{#each this}}
    - Title: {{{title}}} (Keywords: {{#each keywords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}})
      Description: {{{description}}}
    {{/each}}

    Based on these trends, generate 3-5 insightful questions for each of the following categories. The questions should be broad enough to spark ideas for multiple articles, blog posts, or videos.

    Return the result in the specified JSON format.
  `,
});


const answerTheAIFlow = ai.defineFlow(
  {
    name: 'answerTheAIFlow',
    inputSchema: AnswerTheAIInputSchema,
    outputSchema: AnswerTheAIOutputSchema,
  },
  async (input) => {
    const { output } = await answerTheAIPrompt(input);
    return output!;
  }
);
