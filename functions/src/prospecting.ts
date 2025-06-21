
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
    const db = admin.firestore();
    const jobDocRef = db.collection('prospecting_jobs').doc(); // Create a ref for a new job document

    try {
      // 1. Set initial status to 'crawling'
      await jobDocRef.set({
        url: input.url,
        status: 'crawling',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 2. Crawl the page
      let html: string;
      try {
          html = await crawlPage(input.url);
      } catch (error: any) {
          console.error(`Crawling failed for ${input.url}:`, error);
          await jobDocRef.update({
            status: 'failed',
            error: `Crawling failed: ${error.message}`,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          throw error; // Propagate the error
      }
      
      // 3. Update status to 'analyzing'
      await jobDocRef.update({
        status: 'analyzing',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 4. Generate content using the LLM with structured output
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

      // 5. Save valid prospects to the 'prospects' collection
      if (prospects.length > 0) {
          const batch = db.batch();
          
          prospects.forEach(prospect => {
              const docRef = db.collection('prospects').doc(); // Auto-generate ID
              const prospectWithMetadata = {
                  ...prospect,
                  sourceUrl: input.url,
                  createdAt: admin.firestore.FieldValue.serverTimestamp(),
              };
              batch.set(docRef, prospectWithMetadata);
          });

          await batch.commit();
      }

      // 6. Update job status to 'complete' and save the final data
      await jobDocRef.update({
        status: 'complete',
        extractedData: prospects,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 7. Return the final result to the client
      return {
          summary: `AI has extracted ${prospects.length} potential prospects from the provided URL. Results are displayed below.`,
          prospects: prospects,
      };

    } catch (error: any) {
      // Catch any other errors during the process
      await jobDocRef.update({
        status: 'failed',
        error: `Processing failed: ${error.message}`,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      throw error; // Re-throw to be handled by the caller
    }
  }
);

export async function autonomousProspecting(input: AutonomousProspectingInput): Promise<AutonomousProspectingOutput> {
  return autonomousProspectingFlow(input);
}
