
'use server';
/**
 * @fileOverview An AI-powered agent designed to crawl a given URL, extract prospect information, save it to Firestore, and return the structured data.
 *
 * - autonomousProspecting - A function that handles the prospect extraction from a URL.
 * - AutonomousProspectingInput - The input type for the autonomousProspecting function.
 * - AutonomousProspectingOutput - The return type for the autonomousProspecting function.
 */

import {ai} from './genkit';
import {z} from 'zod';
import { crawlPage } from './lib/crawl';
import * as admin from 'firebase-admin';

const AutonomousProspectingInputSchema = z.object({
  url: z.string().url().describe('The URL of the website to crawl and extract prospects from.'),
});
export type AutonomousProspectingInput = z.infer<typeof AutonomousProspectingInputSchema>;

const PersonSchema = z.object({
    name: z.string().describe("The person's full name."),
    role: z.string().optional().describe("The person's job title or role, if available."),
});

export const ExtractedProspectSchema = z.object({
    companyName: z.string().optional().describe('The name of the company found.'),
    people: z.array(PersonSchema).optional().describe('A list of people found, including their names and roles.'),
    emails: z.array(z.string().email()).optional().describe('A list of email addresses found.'),
    links: z.array(z.string().url()).optional().describe('Relevant LinkedIn, Twitter, or contact links found on the page.'),
    industryKeywords: z.array(z.string()).optional().describe('Keywords related to the company\'s industry.'),
});
export type ExtractedProspect = z.infer<typeof ExtractedProspectSchema>;

const AutonomousProspectingOutputSchema = z.object({
  summary: z.string().describe("A summary of the extracted information."),
  prospects: z.array(ExtractedProspectSchema).describe("An array of structured prospect data extracted from the page.")
});
export type AutonomousProspectingOutput = z.infer<typeof AutonomousProspectingOutputSchema>;

const autonomousProspectingFlow = ai.defineFlow(
  {
    name: 'autonomousProspectingFlow',
    inputSchema: AutonomousProspectingInputSchema,
    outputSchema: AutonomousProspectingOutputSchema,
  },
  async (input) => {
    // 1. Crawl the page
    let html: string;
    try {
        html = await crawlPage(input.url);
    } catch (error: any) {
        console.error(`Crawling failed for ${input.url}:`, error);
        return {
            summary: `Failed to crawl the URL: ${input.url}. Error: ${error.message}`,
            prospects: [],
        };
    }
    
    // 2. Generate content using the LLM with structured output
    const {output} = await ai.generate({
        prompt: `
            You are an expert data extraction agent.
            From the following HTML content, extract structured data about companies and people.
            
            Specifically, look for:
            - The primary company name.
            - A list of people, including their full name and their role or job title.
            - Any email addresses.
            - Relevant links, such as LinkedIn profiles, Twitter accounts, or contact pages.
            - Keywords that describe the company's industry.

            Return the data in the specified JSON format.
            If you cannot find any information for a field, omit it or return an empty array.

            HTML content:
            ${html}
        `,
        output: {
            schema: z.array(ExtractedProspectSchema),
        },
    });

    const prospects = output || [];

    // 3. Save valid prospects to Firestore
    if (prospects.length > 0) {
        const db = admin.firestore();
        const batch = db.batch();
        
        prospects.forEach(prospect => {
            const docRef = db.collection('prospects').doc(); // Auto-generate ID
            const prospectWithMetadata = {
                ...prospect,
                sourceUrl: input.url,
                createdAt: new Date(),
            };
            batch.set(docRef, prospectWithMetadata);
        });

        try {
            await batch.commit();
            console.log(`${prospects.length} prospects saved to Firestore.`);
        } catch (error) {
            console.error("Error saving prospects to Firestore:", error);
            // Don't block the response to the user if saving fails.
        }
    }

    return {
        summary: `AI has extracted ${prospects.length} potential prospects from the provided URL. Results are displayed below.`,
        prospects: prospects,
    };
  }
);

export async function autonomousProspecting(input: AutonomousProspectingInput): Promise<AutonomousProspectingOutput> {
  return autonomousProspectingFlow(input);
}
