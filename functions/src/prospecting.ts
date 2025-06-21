
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
  jobId: z.string().describe('The ID of the prospecting job document in Firestore.'),
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


const crawlUrlTool = ai.defineTool({
    name: 'crawlUrlForProspects',
    description: 'Crawls the given URL to retrieve its HTML content for analysis.',
    inputSchema: z.object({ url: z.string().url() }),
    outputSchema: z.string().describe('The full HTML content of the page.'),
}, async (input) => {
    return crawlPage(input.url);
});


const extractionPrompt = ai.definePrompt({
    name: 'prospectExtractionPrompt',
    tools: [crawlUrlTool],
    // The input for the prompt itself doesn't need the jobId
    input: { schema: z.object({ url: z.string().url() }) },
    output: { schema: AutonomousProspectingOutputSchema },
    prompt: `
      You are an expert data extraction agent.
      First, use the crawlUrlForProspects tool to get the HTML content of the following URL: {{{url}}}

      Then, from the resulting HTML content, extract structured data about companies and people.
      Specifically, look for:
      - The primary company name.
      - A list of people, including their full name and their role or job title.
      - Any email addresses.
      - Relevant links, such as LinkedIn profiles, Twitter accounts, or contact pages.
      - Keywords that describe the company's industry.
      
      Finally, provide a brief summary of your findings and format the extracted data as an array of prospects.
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
    const db = admin.firestore();
    const jobDocRef = db.collection('prospecting_jobs').doc(input.jobId);

    try {
      // 1. Update status to 'crawling' / 'analyzing'
      await jobDocRef.update({
        status: 'analyzing', // The tool call combines crawling and analysis
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 2. Run the extraction prompt which will use the tool internally
      const {output} = await extractionPrompt({ url: input.url });
      const prospects = output?.prospects || [];

      // 3. Update status to 'saving'
      await jobDocRef.update({
        status: 'saving',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 4. Save valid prospects to the 'prospects' collection
      if (prospects.length > 0) {
          const batch = db.batch();
          
          prospects.forEach(prospect => {
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
      }

      // 5. Update job status to 'complete' and save the final data
      await jobDocRef.update({
        status: 'complete',
        extractedData: output,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      return output!;

    } catch (error: any) {
       await jobDocRef.update({
         status: 'failed',
         error: `Processing failed: ${error.message}`,
         updatedAt: admin.firestore.FieldValue.serverTimestamp(),
       });
      throw error; // Re-throw to be logged by the calling function
    }
  }
);

export async function autonomousProspecting(input: AutonomousProspectingInput): Promise<AutonomousProspectingOutput> {
  return autonomousProspectingFlow(input);
}
