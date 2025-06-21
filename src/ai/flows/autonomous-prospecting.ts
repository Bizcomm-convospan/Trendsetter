
/**
 * @fileOverview Defines the data structures for prospecting results.
 * These types are used by the frontend to display data returned by the background prospecting function.
 */

import {z} from 'zod';

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


export const AutonomousProspectingOutputSchema = z.object({
  summary: z.string().describe("A summary of the extracted information."),
  prospects: z.array(ExtractedProspectSchema).describe("An array of structured prospect data extracted from the page.")
});
export type AutonomousProspectingOutput = z.infer<typeof AutonomousProspectingOutputSchema>;
