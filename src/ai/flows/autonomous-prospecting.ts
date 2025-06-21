'use server';
/**
 * @fileOverview An AI-powered agent designed to crawl a given URL and extract prospect information.
 *
 * - autonomousProspecting - A function that handles the prospect extraction from a URL.
 * - AutonomousProspectingInput - The input type for the autonomousProspecting function.
 * - AutonomousProspectingOutput - The return type for the autonomousProspecting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

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
    outputSchema: z.string().describe('The full HTML content of the page.'),
}, async (input) => {
    const crawlerUrl = process.env.CRAWLER_SERVICE_URL;

    if (!crawlerUrl || crawlerUrl.includes('your-crawler-service-url')) {
        const errorMessage = "CRAWLER_SERVICE_URL environment variable is not set. Please configure it with your deployed crawler service URL in the .env file.";
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    
    try {
        const response = await fetch(crawlerUrl, {
            method: 'POST',
            body: JSON.stringify({ url: input.url }),
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Crawler service returned status ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        return data.html;
    } catch (error: any) {
        console.error("Error calling crawler service:", error);
        return `Failed to crawl URL ${input.url}. Error: ${error.message}`;
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

      Then, from the resulting HTML content, extract the following information:
      - Company names
      - Contact persons (names of people)
      - Email addresses
      - Industry keywords that describe the company's business.

      Finally, provide a brief summary of your findings and format the extracted data as a list of prospects.
      If you cannot find any specific prospects, return an empty list for prospects, but still provide a summary.
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
    return output!;
  }
);

export async function autonomousProspecting(input: AutonomousProspectingInput): Promise<AutonomousProspectingOutput> {
  return autonomousProspectingFlow(input);
}
