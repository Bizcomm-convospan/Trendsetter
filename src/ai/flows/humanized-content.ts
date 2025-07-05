'use server';
/**
 * @fileOverview A flow for making existing content sound more human-like.
 *
 * - generateHumanizedContent - A function that handles the humanized content generation.
 * - HumanizedContentInput - The input type for the generateHumanizedContent function.
 * - HumanizedContentOutput - The return type for the generateHumanizedContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const HumanizedContentInputSchema = z.object({
  contentToHumanize: z.string().describe('The article content to rewrite.'),
  tone: z
    .enum(['formal', 'casual', 'storytelling', 'mixed'])
    .default('mixed')
    .describe('The desired tone of the content.'),
  keyword: z.string().optional().describe('A specific keyword to include naturally in the text.'),
  userInsight: z
    .string()
    .optional()
    .describe('A specific insight or perspective to include in the content.'),
  chunkSize: z
    .number()
    .default(400)
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
    // Chunk the input content and rephrase each chunk to sound more natural.
    const chunks =
      input.contentToHumanize.match(new RegExp(`.{1,${input.chunkSize}}`, 'gs')) || [];

    let finalText = '';
    for (const chunk of chunks) {
      const rephraseResponse = await ai.generate({
        prompt: `You are an expert at rewriting content. Paraphrase this text to sound more natural, human, and less robotic.
- Adopt a ${input.tone} tone.
${input.keyword ? `- Make sure to naturally include the keyword: '${input.keyword}'` : ''}
${input.userInsight ? `- Make sure to include this insight: '${input.userInsight}'` : ''}
- Use varied sentence lengths and structures.

Text to rewrite:
${chunk}`,
      });
      finalText += `\n${rephraseResponse.text}`;
    }

    return finalText.trim();
  }
);
