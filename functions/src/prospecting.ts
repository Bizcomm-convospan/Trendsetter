
'use server';
/**
 * @fileOverview An AI-powered agent designed to crawl a given URL, extract prospect information, and save it to Firestore.
 *
 * - autonomousProspecting - A function that handles the prospect extraction from a URL and saves the results.
 * - AutonomousProspectingInput - The input type for the autonomousProspecting function.
 * - AutonomousProspectingOutput - The return type for the autonomousProspecting function.
 */

import {ai} from './genkit';
import {z} from 'zod';
import { getFirestore } from 'firebase-admin/firestore';
import { crawlPage } from './lib/crawl';

const AutonomousProspectingInputSchema = z.object({
  url: z.string().url().describe('The URL of the website to crawl and extract prospects from.'),
});
export type AutonomousProspectingInput = z.infer<typeof AutonomousProspectingInputSchema>;

export const ExtractedProspectSchema = z.object({
    companyName: z.string().optional().describe('The name of the company found.'),
    contactPersons: z.array(z.string()).optional().describe('A list of contact persons found.'),
    emails: z.array(z.string()).optional().describe('A list of email addresses found.'),
    industryKeywords: z.array(z.string()).optional().describe('Keywords related to the company\'s industry.'),
});
export type ExtractedProspect = z.infer<typeof ExtractedProspectSchema>;


const AutonomousProspectingOutputSchema = z.object({
  summary: z.string().describe("A summary of the extracted information."),
  prospects: z.array(ExtractedProspectSchema).describe("A list of structured prospect data extracted from the page.")
});
export type AutonomousProspectingOutput = z.infer<typeof AutonomousProspectingOutputSchema>;

const crawlUrlTool = ai.defineTool({
    name: 'crawlUrl',
    description: 'Crawls the given URL and returns its HTML content by calling an external crawler service.',
    inputSchema: z.object({ url: z.string().url() }),
    outputSchema: z.string().describe('The full HTML content of the page, or an error message if crawling fails.'),
}, async (input) => {
    try {
        return await crawlPage(input.url);
    } catch (error: any) {
        console.error("Error calling crawlPage from tool:", error);
        return `An error occurred while trying to crawl the page: ${error.message}`;
    }
});

const extractionPrompt = ai.definePrompt({
    name: 'prospectExtractionPrompt',
    tools: [crawlUrlTool],
    input: { schema: AutonomousProspectingInputSchema },
    output: { schema: AutonomousProspectingOutputSchema },
    prompt: `
      You are an expert data extraction agent.
      First, use the crawlUrl tool to get the HTML content of the following URL: {{{url}}}

      If the tool returns an error message instead of HTML, your summary should state that the page could not be crawled and explain the error. Return an empty list for prospects.

      If you receive HTML content, extract the following information from it:
      - Company names
      - Contact persons (names of people)
      - Email addresses
      - Industry keywords that describe the company's business.

      Finally, provide a brief summary of your findings and format the extracted data as a list of prospects.
      If you cannot find any specific prospects from the HTML, return an empty list for prospects, but still provide a summary of the page content.
      Return the information in the specified JSON format.
    `,
});

const autonomousProspectingFlow = ai.defineFlow(
  {
    name: 'autonomousProspectingFlow',
    inputSchema: AutonomousProspectingInputSchema,
    outputSchema: AutonomousProspectingOutputSchema,
  },
  async (input) => {
    const {output} = await extractionPrompt(input);
    
    if (output && output.prospects && output.prospects.length > 0) {
      const db = getFirestore();
      const batch = db.batch();
      
      output.prospects.forEach(prospect => {
          const prospectRef = db.collection('prospects').doc(); // Auto-generate ID
          batch.set(prospectRef, {
              ...prospect,
              crawledUrl: input.url,
              createdAt: new Date(),
          });
      });

      await batch.commit();
    }

    return output!;
  }
);

export async function autonomousProspecting(input: AutonomousProspectingInput): Promise<AutonomousProspectingOutput> {
  return autonomousProspectingFlow(input);
}
