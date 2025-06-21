
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
  prospects: z.array(ExtractedProspectSchema).describe("An array of structured prospect data extracted from the page.")
});
export type AutonomousProspectingOutput = z.infer<typeof AutonomousProspectingOutputSchema>;

// Helper to remove markdown ```json ... ``` wrappers from LLM output
function cleanJsonString(str: string): string {
    let cleaned = str.replace(/```json/g, '').replace(/```/g, '');
    cleaned = cleaned.trim();
    return cleaned;
}

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
    
    // 2. Generate content using the LLM with the crawled HTML
    const {output} = await ai.generate({
        prompt: `
            You are an expert data extraction agent.
            From the following HTML content, extract structured data and return it ONLY as a raw JSON string representing an array of objects.
            Each object in the array should conform to this structure: { "companyName": "...", "contactPersons": [...], "emails": [...], "links": [...], "industryKeywords": [...] }.
            Do NOT include any explanatory text, markdown formatting like \`\`\`json, or anything else outside of the JSON array string.
            If you cannot find any information, return an empty JSON array: [].

            HTML content:
            ${html}
        `,
    });

    const rawJsonString = output?.text || "[]";
    const cleanedJsonString = cleanJsonString(rawJsonString);
    
    // 3. Parse and validate the extracted data
    let prospects: ExtractedProspect[] = [];
    try {
        const parsedData = JSON.parse(cleanedJsonString);
        const validationResult = z.array(ExtractedProspectSchema).safeParse(parsedData);
        if (validationResult.success) {
            prospects = validationResult.data;
        } else {
            console.error("Zod validation failed:", validationResult.error);
            // Decide if you want to throw an error or return empty prospects
        }
    } catch (e) {
        console.error("Failed to parse JSON from LLM output:", e);
        // Decide if you want to throw an error or return empty prospects
    }

    // 4. Save valid prospects to Firestore
    if (prospects.length > 0) {
        const db = admin.firestore();
        const batch = db.batch();
        
        prospects.forEach(prospect => {
            const docRef = db.collection('prospects').doc(); // Auto-generate ID
            const prospectWithMetadata = {
                ...prospect,
                sourceUrl: input.url,
                extractedAt: new Date().toISOString(),
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
