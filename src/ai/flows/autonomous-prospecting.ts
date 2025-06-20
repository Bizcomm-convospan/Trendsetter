// This is an AI-powered agent designed to crawl web data and extract information about potential leads based on a defined Ideal Customer Profile (ICP).

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdealCustomerProfileSchema = z.object({
  industry: z.string().describe('The industry of the target companies.'),
  region: z.string().describe('The geographical region of the target companies.'),
  jobTitles: z.array(z.string()).describe('A list of job titles to target within the companies.'),
});

export type IdealCustomerProfile = z.infer<typeof IdealCustomerProfileSchema>;

const ProspectDataSchema = z.object({
  companyName: z.string().describe('The name of the company.'),
  contactName: z.string().describe('The name of the contact person.'),
  jobTitle: z.string().describe('The job title of the contact person.'),
  linkedinProfile: z.string().optional().describe('The LinkedIn profile URL of the contact person, if available.'),
});

export type ProspectData = z.infer<typeof ProspectDataSchema>;

const AutonomousProspectingOutputSchema = z.array(ProspectDataSchema).describe('A list of potential leads based on the ICP.');

export type AutonomousProspectingOutput = z.infer<typeof AutonomousProspectingOutputSchema>;

export async function autonomousProspecting(icp: IdealCustomerProfile): Promise<AutonomousProspectingOutput> {
  return autonomousProspectingFlow(icp);
}

const webCrawlTool = ai.defineTool({
  name: 'webCrawl',
  description: 'Crawl the web to find companies, people and their roles, based on the provided parameters.',
  inputSchema: IdealCustomerProfileSchema,
  outputSchema: z.string().describe('Extracted web content relevant to the ideal customer profile.'),
},
async (input) => {
    // In a real implementation, this would perform web crawling based on the ICP and return relevant content.
    // This mock implementation simply returns a canned response.
    return `Example web content for industry: ${input.industry}, region: ${input.region}, job titles: ${input.jobTitles.join(', ')}`;
});

const extractEntitiesTool = ai.defineTool({
  name: 'extractEntities',
  description: 'Extract company names, contact names, job titles, and relationships from the given text.',
  inputSchema: z.object({text: z.string().describe('The text to extract entities from.')}),
  outputSchema: z.array(ProspectDataSchema),
},
async (input) => {
  // In a real implementation, this would use an NLU model to extract entities and relationships.
  // This mock implementation returns sample prospect data.
  return [
    {
      companyName: 'Acme Corp',
      contactName: 'John Doe',
      jobTitle: 'CEO',
      linkedinProfile: 'https://www.linkedin.com/in/johndoe',
    },
    {
      companyName: 'Beta Inc',
      contactName: 'Jane Smith',
      jobTitle: 'CTO',
      linkedinProfile: 'https://www.linkedin.com/in/janesmith',
    },
  ];
});

const autonomousProspectingPrompt = ai.definePrompt({
  name: 'autonomousProspectingPrompt',
  tools: [webCrawlTool, extractEntitiesTool],
  input: {schema: IdealCustomerProfileSchema},
  output: {schema: AutonomousProspectingOutputSchema},
  prompt: `You are an AI-powered prospecting assistant. Your goal is to identify potential leads based on the Ideal Customer Profile (ICP) provided by the user.

  First, use the webCrawl tool to gather relevant information based on the following ICP:
  Industry: {{{industry}}}
  Region: {{{region}}}
  Job Titles: {{{jobTitles}}}

  Then, use the extractEntities tool to extract company names, contact names, and job titles from the crawled web content.

  Finally, return a list of potential leads based on the extracted information.
  Make sure that the output is valid JSON in the schema described.
  `,
});

const autonomousProspectingFlow = ai.defineFlow(
  {
    name: 'autonomousProspectingFlow',
    inputSchema: IdealCustomerProfileSchema,
    outputSchema: AutonomousProspectingOutputSchema,
  },
  async icp => {
    const {output} = await autonomousProspectingPrompt(icp);
    return output!;
  }
);
