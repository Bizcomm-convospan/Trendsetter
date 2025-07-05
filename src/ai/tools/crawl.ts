'use server';
/**
 * @fileOverview A helper function to crawl a web page using an external service.
 * This is a tool to be used within Genkit flows in the Next.js application.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

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
    description: 'Crawls the given URL to retrieve its full HTML content for analysis. Use this to get the source code of a competitor page.',
    inputSchema: z.object({ url: z.string().url() }),
    outputSchema: z.string().describe('The full HTML content of the page.'),
}, async (input) => {
    return crawlPage(input.url);
});
