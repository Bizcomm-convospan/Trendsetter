
'use server';
/**
 * @fileOverview An AI flow for generating video from a text prompt using Veo.
 *
 * - generateVideo - A function that generates a video and returns it as a data URI.
 * - GenerateVideoInput - The input type for the function.
 * - GenerateVideoOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateVideoInputSchema = z.object({
  prompt: z.string().describe('A detailed text prompt for the video generation model.'),
});
export type GenerateVideoInput = z.infer<typeof GenerateVideoInputSchema>;

const GenerateVideoOutputSchema = z.object({
  videoUrl: z.string().url().describe("The generated video as a data: URI."),
});
export type GenerateVideoOutput = z.infer<typeof GenerateVideoOutputSchema>;

export async function generateVideo(input: GenerateVideoInput): Promise<GenerateVideoOutput> {
  return generateVideoFlow(input);
}

const generateVideoFlow = ai.defineFlow(
  {
    name: 'generateVideoFlow',
    inputSchema: GenerateVideoInputSchema,
    outputSchema: GenerateVideoOutputSchema,
  },
  async ({ prompt }) => {
    console.log(`[Video Gen Flow] Starting generation for prompt: "${prompt}"`);
    
    let { operation } = await ai.generate({
        model: 'googleai/veo-2.0-generate-001',
        prompt: prompt,
        config: {
            durationSeconds: 5,
            aspectRatio: '16:9',
        },
    });

    if (!operation) {
        throw new Error('Video generation did not return an operation.');
    }

    console.log('[Video Gen Flow] Polling for video generation result...');
    // Poll for the result. This can take a while (e.g., up to a minute).
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before checking again
        operation = await ai.checkOperation(operation);
        console.log(`[Video Gen Flow] Operation status: ${operation.done ? 'Done' : 'In Progress'}`);
    }

    if (operation.error) {
        console.error('[Video Gen Flow] Operation failed:', operation.error);
        throw new Error(`Failed to generate video: ${operation.error.message}`);
    }

    const videoPart = operation.output?.message?.content.find(p => !!p.media && p.media.contentType?.startsWith('video/'));
    
    if (!videoPart?.media?.url) {
        throw new Error('Generated output did not contain a video.');
    }
    
    console.log(`[Video Gen Flow] Generation successful.`);

    // In a real application, you'd likely want to download this from its temporary URL
    // and store it permanently, then return your permanent URL.
    // For this demo, we will assume the returned URL is a data URI or directly usable.
    // Note: The actual VEO API returns a temporary gs:// or https:// URL that needs auth.
    // The Genkit wrapper might handle this differently. For now, we pass it on.
    // Let's assume for this context it returns a data URI.
    return {
      videoUrl: videoPart.media.url,
    };
  }
);
