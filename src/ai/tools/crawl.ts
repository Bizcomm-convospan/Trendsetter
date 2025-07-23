'use server';
/**
 * @fileOverview A Genkit tool for crawling a web page.
 * This tool is now implemented in the `functions` codebase and this file is deprecated for the Next.js environment.
 * @deprecated Use the tool defined in `functions/src/tools/crawl.ts`.
 */

// This file is intentionally left blank as the crawl tool has been moved to the Firebase Functions
// environment to run alongside the Genkit flows that use it. This simplifies the architecture
// by removing the need for the functions to call back into the Next.js app for a tool.

// Keeping this file prevents build errors from any lingering imports, but its functionality is gone.
// The `competitor-analyzer-flow` in the Next.js app will now use the direct tool from the functions package.
// For the Next.js based flows, we need a simple crawl function that calls the *external* crawler service.
// This is a temporary measure until all flows are migrated to the functions backend.

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MAX_INPUT_CHARACTERS = 16000; // Approx 4k tokens, a safe limit for cost control.

/**
 * A simple fetch-based crawl function for flows that still run in the Next.js environment.
 * This is a necessary duplication of logic while the architecture is mixed.
 * In a pure functions-backend architecture, this would not be needed.
 */
async function crawlPageWithFetch(url: string): Promise<string> {
  // This logic is for flows that are defined in the Next.js app's /ai/flows directory
  // and need to call an external service. Since we've deprecated the service, this will
  // now point to a non-existent URL. This highlights the need to consolidate flows.
  // For the purpose of this refactor, we will make flows like competitor-analyzer use the
  // new functions-based tool, but that requires more extensive changes.
  // We will temporarily adjust the competitor analyzer to show it's deprecated.

  // The primary `autonomousProspecting` flow now uses its own integrated tool,
  // making this file's tool largely redundant for the main workflow.
  
  // Since the crawler service is removed, we'll throw an error here to indicate
  // that flows remaining in the Next.js app must be migrated.
  throw new Error("The standalone crawler service has been deprecated. This flow must be migrated to the functions backend to use the integrated crawler tool.");
}


export const crawlUrlTool = ai.defineTool({
    name: 'crawlUrlForAnalysis',
    description: 'Crawls the given URL and returns its main text content. THIS TOOL IS DEPRECATED.',
    inputSchema: z.object({ url: z.string().url() }),
    outputSchema: z.string(),
}, async (input) => {
    return await crawlPageWithFetch(input.url);
});
