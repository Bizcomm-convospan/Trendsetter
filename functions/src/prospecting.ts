
'use server';
/**
 * @fileOverview An AI-powered agent designed to crawl a given URL, extract prospect information, save it to Firestore, and return the structured data.
 * This file uses a multi-agent approach, chaining two AI prompts for higher accuracy.
 *
 * - autonomousProspecting - A function that handles the prospect extraction from a URL.
 * - AutonomousProspectingInput - The input type for the autonomousProspecting function.
 * - AutonomousProspectingOutput - The return type for the autonomousProspecting function.
 */

import {ai} from './genkit';
import {z} from 'zod';
import { crawlPage } from './lib/crawl';
import * as admin from 'firebase-admin';

const MAX_INPUT_CHARACTERS = 16000; // Approx 4k tokens, a safe limit for cost control.

const AutonomousProspectingInputSchema = z.object({
  url: z.string().url().describe('The URL of the website to crawl and extract prospects from.'),
  jobId: z.string().describe('The ID of the prospecting job document in Firestore for logging/tracing.'),
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


// AGENT 1: Identifies the company and its purpose from the text content.
const companyIdPrompt = ai.definePrompt({
    name: 'companyIdentificationPrompt',
    input: { schema: z.object({ content: z.string() }) },
    output: { schema: z.object({
        companyName: z.string().optional().describe('The name of the company found.'),
        industryKeywords: z.array(z.string()).optional().describe('Keywords related to the company\'s industry.'),
        companySummary: z.string().describe("A very brief, one-sentence summary of what the company does based on the text.")
    })},
    prompt: `You are a business analyst. From the following web page content, extract the company's name, a one-sentence summary of their business, and keywords for their industry.

    Page Content:
    ---
    {{{content}}}
    ---
    `
});

// AGENT 2: Extracts people and contact details, using context from Agent 1.
const prospectExtractionPrompt = ai.definePrompt({
    name: 'prospectDetailExtractionPrompt',
    input: { schema: z.object({
        content: z.string(),
        companyName: z.string().optional(),
        companySummary: z.string(),
    })},
    output: { schema: z.object({
        people: z.array(PersonSchema).optional().describe('A list of people found, including their names and roles.'),
        emails: z.array(z.string().email()).optional().describe('A list of email addresses found.'),
        links: z.array(z.string().url()).optional().describe('Relevant LinkedIn, Twitter, or contact links found on the page.'),
    })},
    prompt: `You are a data extraction specialist. The content below is from a company named '{{#if companyName}}{{companyName}}{{else}}an unnamed company{{/if}}' that specializes in '{{companySummary}}'.
    
    Your task is to extract the following details from the text:
    - A list of people, including their full name and their role or job title.
    - Any email addresses.
    - Relevant links, such as LinkedIn profiles, Twitter accounts, or contact pages.

    Focus only on information directly present in the text. Do not infer or guess information.

    Page Content:
    ---
    {{{content}}}
    ---
    `
});


const autonomousProspectingFlow = ai.defineFlow(
  {
    name: 'autonomousProspectingFlow',
    inputSchema: AutonomousProspectingInputSchema,
    outputSchema: AutonomousProspectingOutputSchema,
  },
  async (input) => {
    const db = admin.firestore();

    // Step 1: Crawl the page to get clean text content.
    const cleanText = await crawlPage(input.url);
    const truncatedText = cleanText.substring(0, MAX_INPUT_CHARACTERS);
    console.log(`[Prospecting Flow] Truncated content from ${cleanText.length} to ${truncatedText.length} characters for cost optimization.`);

    // Step 2 (Agent 2): Identify the company and its purpose.
    console.log(`[Prospecting Flow - Agent 2] Identifying company from content.`);
    const { output: companyInfo } = await companyIdPrompt({ content: truncatedText });
    if (!companyInfo) {
      throw new Error("Company identification agent failed to produce output.");
    }
    console.log(`[Prospecting Flow - Agent 2] Identified company: ${companyInfo.companyName}`);
    
    // Step 3 (Agent 3): Extract people and contact details, using context from Agent 2.
    console.log(`[Prospecting Flow - Agent 3] Extracting prospect details.`);
    const { output: prospectDetails } = await prospectExtractionPrompt({
      content: truncatedText,
      companyName: companyInfo.companyName,
      companySummary: companyInfo.companySummary,
    });
    if (!prospectDetails) {
        throw new Error("Prospect detail extraction agent failed to produce output.");
    }
    console.log(`[Prospecting Flow - Agent 3] Found ${prospectDetails.people?.length || 0} people.`);

    // Combine results from the agents into a single prospect object.
    const combinedProspect: ExtractedProspect = {
        companyName: companyInfo.companyName,
        people: prospectDetails.people,
        emails: prospectDetails.emails,
        links: prospectDetails.links,
        industryKeywords: companyInfo.industryKeywords
    };
    
    // The schema expects an array of prospects, even if we only find one.
    const prospects = [combinedProspect];

    // Final Output Construction
    const finalOutput: AutonomousProspectingOutput = {
        summary: `Successfully extracted details for ${companyInfo.companyName || 'the company'}. Found ${prospectDetails.people?.length || 0} people and ${prospectDetails.emails?.length || 0} emails. Company summary: ${companyInfo.companySummary}`,
        prospects: prospects.filter(p => p.companyName || (p.people && p.people.length > 0) || (p.emails && p.emails.length > 0)) // Only include non-empty prospects
    };

    // Save valid prospects to the 'prospects' collection
    if (finalOutput.prospects.length > 0) {
        const batch = db.batch();
        
        finalOutput.prospects.forEach(prospect => {
            const docRef = db.collection('prospects').doc(); // Auto-generate ID
            const prospectWithMetadata = {
                ...prospect,
                sourceUrl: input.url,
                jobId: input.jobId,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            batch.set(docRef, prospectWithMetadata);
        });

        await batch.commit();
        console.log(`[Prospecting Flow] Saved ${finalOutput.prospects.length} prospects to Firestore.`);
    }
    
    // Return the final data to the calling function, which will handle the job status update.
    return finalOutput;
  }
);

export async function autonomousProspecting(input: AutonomousProspectingInput): Promise<AutonomousProspectingOutput> {
  return autonomousProspectingFlow(input);
}
