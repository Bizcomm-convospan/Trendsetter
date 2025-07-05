'use server';
/**
 * @fileOverview A helper function to crawl a web page using an external service and extract its main content.
 * This is a tool to be used within Genkit flows in the Next.js application.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { extractTextFromHtml } from '../lib/text-extractor';

const MAX_INPUT_CHARACTERS = 16000; // Approx 4k tokens, a safe limit for cost control.

async function crawlPage(url: string): Promise<string> {
  // IMPORTANT: This CRAWLER_SERVICE_URL must be configured in your environment.
  // For local development, this will be http://localhost:8080/crawl if you are running the crawler service.
  // In production, this should be the URL of your deployed crawler service (e.g., on Cloud Run).
  const crawlerUrl = process.env.CRAWLER_SERVICE_URL;

  if (!crawlerUrl || crawlerUrl.includes('your-crawler-service-url')) {
    const errorMessage =
      'CRAWLER_SERVICE_URL environment variable is not set. Please configure it with your deployed crawler service URL in the .env file.';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  try {
    console.log(`[Crawl Tool] Calling crawler at ${crawlerUrl} for URL: ${url}`);
    const response = await fetch(crawlerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Crawler service returned status ${response.status}: ${errorBody}`
      );
    }

    const data = await response.json();
    if (typeof data.html !== 'string') {
      throw new Error('Crawler service response did not contain valid HTML content.');
    }
    
    console.log(`[Crawl Tool] Successfully crawled ${url}`);
    return data.html;
  } catch (error: any) {
    console.error(`[Crawl Tool] Error calling crawler service for URL ${url}:`, error);
    throw new Error(`Failed to crawl URL ${url}. Error: ${error.message}`);
  }
}

export const crawlUrlTool = ai.defineTool({
    name: 'crawlUrlForAnalysis',
    description: 'Crawls the given URL, extracts the main article text, and returns it. Use this to get the content of a competitor page for analysis.',
    inputSchema: z.object({ url: z.string().url() }),
    outputSchema: z.string().describe('The clean, extracted text content of the page, stripped of HTML, scripts, and other boilerplate.'),
}, async (input) => {
    const htmlContent = await crawlPage(input.url);
    if (!htmlContent) {
        return "Failed to crawl or find content at the URL.";
    }
    const cleanText = await extractTextFromHtml(htmlContent);
    // Truncate the text to control token usage and cost.
    const truncatedText = cleanText.substring(0, MAX_INPUT_CHARACTERS);
    console.log(`[Crawl Tool] Truncated content from ${cleanText.length} to ${truncatedText.length} characters for cost optimization.`);
    return truncatedText;
});
