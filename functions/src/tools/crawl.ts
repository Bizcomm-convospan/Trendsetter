'use server';
/**
 * @fileOverview A Genkit tool for crawling a web page. This has been deprecated in favor of a direct helper function.
 * @deprecated Use `functions/src/lib/crawl.ts` instead.
 */
import { ai } from '../genkit';
import { z } from 'zod';
import { crawlPage } from '../lib/crawl';


const MAX_INPUT_CHARACTERS = 16000; // Approx 4k tokens, a safe limit for cost control.

export const crawlUrlTool = ai.defineTool({
    name: 'crawlUrlForAnalysis',
    description: 'Crawls the given URL and returns its main text content, stripped of HTML. Use this to get the content of a web page for analysis.',
    inputSchema: z.object({ url: z.string().url() }),
    outputSchema: z.string().describe('The clean, extracted text content of the page, stripped of HTML, scripts, and other boilerplate.'),
}, async (input) => {
    const cleanText = await crawlPage(input.url);
    
    // Truncate the text to control token usage and cost.
    const truncatedText = cleanText.substring(0, MAX_INPUT_CHARACTERS);
    console.log(`[Crawl Tool] Truncated content from ${cleanText.length} to ${truncatedText.length} characters for cost optimization.`);
    return truncatedText;
});
