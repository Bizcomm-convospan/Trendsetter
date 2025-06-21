
'use server';
/**
 * @fileOverview A flow for generating content that sounds more human-like.
 *
 * - generateHumanizedContent - A function that handles the humanized content generation.
 * - HumanizedContentInput - The input type for the generateHumanizedContent function.
 * - HumanizedContentOutput - The return type for the generateHumanizedContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HumanizedContentInputSchema = z.object({
  topic: z.string().describe('The main topic for the blog post.'),
  tone: z
    .enum(['formal', 'casual', 'storytelling', 'mixed'])
    .default('mixed')
    .describe('The desired tone of the content.'),
  includeAnecdotes: z
    .boolean()
    .default(true)
    .describe('Whether to include personal-style anecdotes or insights.'),
  keyword: z.string().optional().describe('A specific keyword to include naturally in the text.'),
  userInsight: z
    .string()
    .optional()
    .describe('A specific insight or perspective to include in the content.'),
  chunkSize: z
    .number()
    .default(300)
    .describe('The size of text chunks for the re-phrasing process.'),
});
export type HumanizedContentInput = z.infer<typeof HumanizedContentInputSchema>;

export type HumanizedContentOutput = string;

export async function generateHumanizedContent(
  input: HumanizedContentInput
): Promise<HumanizedContentOutput> {
  return humanizedContentFlow(input);
}

const humanizedContentFlow = ai.defineFlow(
  {
    name: 'humanizedContentFlow',
    inputSchema: HumanizedContentInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    // Step 1: Generate the initial draft.
    const initialPrompt = `
You are a skilled human writer. Write a ${input.tone} blog post on the topic: "${input.topic}".
- Use varied sentence lengths and structures.
- ${input.includeAnecdotes ? 'Include personal-style anecdotes or insights.' : 'Avoid anecdotes.'}
- ${input.keyword ? `Include the keyword '${input.keyword}' naturally.` : "Don't focus on any keyword."}
- Add emotional flavor and a human touch.
- ${input.userInsight ? `Make sure to include this insight: ${input.userInsight}` : 'Use your own judgment for a unique perspective.'}
`;
    const initialResponse = await ai.generate({
      prompt: initialPrompt,
    });
    const rawOutput = initialResponse.text;

    // Step 2: Chunk the output and rephrase each chunk to sound more natural.
    const chunks =
      rawOutput.match(new RegExp(`.{1,${input.chunkSize}}`, 'g')) || [];

    let finalText = '';
    for (const chunk of chunks) {
      const rephraseResponse = await ai.generate({
        prompt: `Paraphrase this text to sound more natural and less robotic. Add a human tone:
${chunk}`,
      });
      finalText += `\n${rephraseResponse.text}`;
    }

    return finalText.trim();
  }
);
