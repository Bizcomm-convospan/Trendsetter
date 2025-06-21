
'use server';
/**
 * @fileOverview An AI-powered agent designed to crawl a given URL, extract prospect information, and return it as a string.
 *
 * - autonomousProspecting - A function that handles the prospect extraction from a URL.
 * - AutonomousProspectingInput - The input type for the autonomousProspecting function.
 * - AutonomousProspectingOutput - The return type for the autonomousProspecting function.
 */

import {ai} from './genkit';
import {z} from 'zod';
import { crawlPage } from './lib/crawl';

const AutonomousProspectingInputSchema = z.object({
  url: z.string().url().describe('The URL of the website to crawl and extract prospects from.'),
});
export type AutonomousProspectingInput = z.infer<typeof AutonomousProspectingInputSchema>;

// Note: This schema is for type safety within the function. 
// The client will use its own version of ExtractedProspect.
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
  prospects: z.string().describe("A stringified JSON array of structured prospect data extracted from the page.")
});
export type AutonomousProspectingOutput = z.infer<typeof AutonomousProspectingOutputSchema>;

function cleanJsonString(str: string): string {
    // Remove markdown code blocks
    let cleaned = str.replace(/```json/g, '').replace(/```/g, '');
    // Trim whitespace
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
            prospects: "[]",
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

    const rawProspectsString = output?.text || "[]";
    const cleanedProspectsString = cleanJsonString(rawProspectsString);
    
    // Note: Saving to Firestore was removed because this function no longer has access to the structured data.
    // The parsing now happens on the client side.

    return {
        summary: "AI has extracted the following potential prospects from the provided URL. Results are displayed below.",
        prospects: cleanedProspectsString,
    };
  }
);

export async function autonomousProspecting(input: AutonomousProspectingInput): Promise<AutonomousProspectingOutput> {
  return autonomousProspectingFlow(input);
}
