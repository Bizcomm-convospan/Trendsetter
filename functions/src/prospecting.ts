
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
    contactPersons: z.array(z.string()).optional().describe('A list of contact persons found, including their roles if available.'),
    emails: z.array(z.string()).optional().describe('A list of email addresses found.'),
    links: z.array(z.string()).optional().describe('Relevant LinkedIn, Twitter, or contact links found on the page.'),
    industryKeywords: z.array(z.string()).optional().describe('Keywords related to the company\'s industry.'),
});
export type ExtractedProspect = z.infer<typeof ExtractedProspectSchema>;


const AutonomousProspectingOutputSchema = z.object({
  summary: z.string().describe("A summary of the extracted information."),
  prospects: z.array(ExtractedProspectSchema).describe("A list of structured prospect data extracted from the page.")
});
export type AutonomousProspectingOutput = z.infer<typeof AutonomousProspectingOutputSchema>;

const autonomousProspectingFlow = ai.defineFlow(
  {
    name: 'autonomousProspectingFlow',
    inputSchema: AutonomousProspectingInputSchema,
    outputSchema: AutonomousProspectingOutputSchema,
  },
  async (input) => {
    // 1. Crawl the page, catching potential errors.
    let html: string;
    try {
        html = await crawlPage(input.url);
    } catch (error: any) {
        console.error(`Crawling failed for ${input.url}:`, error);
        // Return a structured error response if crawling fails.
        return {
            summary: `Failed to crawl the URL: ${input.url}. Error: ${error.message}`,
            prospects: [],
        };
    }
    
    // 2. Generate content using the LLM with the crawled HTML
    const {output} = await ai.generate({
        prompt: `
            You are an expert data extraction agent.
            From the following HTML content, extract structured data.
            
            Information to extract:
            - Company name
            - Email addresses
            - People (with roles if mentioned)
            - Any relevant LinkedIn, Twitter, or contact links
            - Industry keywords that describe the company's business

            Also provide a brief summary of your findings.
            Format the extracted data as a list of prospects and return the information in the specified JSON format.
            If you cannot find any specific information, return an empty list for prospects, but still provide a summary of the page content.

            HTML content:
            ${html}
        `,
        output: {
            schema: AutonomousProspectingOutputSchema,
        },
    });
    
    // 3. Save the prospects to Firestore
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
