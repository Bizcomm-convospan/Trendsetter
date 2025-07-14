'use server';
/**
 * @fileOverview An AI agent for drafting personalized outreach emails.
 *
 * - generateOutreachEmail - A function that takes prospect information and a company offer
 *   to draft a compelling cold outreach email.
 * - EmailOutreachInput - The input type for the generateOutreachEmail function.
 * - EmailOutreachOutput - The return type for the generateOutreachEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ExtractedProspectSchema } from './autonomous-prospecting';

const EmailOutreachInputSchema = z.object({
  prospect: ExtractedProspectSchema.describe('The structured data of the prospect company and its people.'),
  ourCompanyOffer: z.string().describe("A brief, one-sentence description of our company's product or service value proposition."),
  senderName: z.string().describe("The name of the person sending the email."),
});
export type EmailOutreachInput = z.infer<typeof EmailOutreachInputSchema>;


const EmailOutreachOutputSchema = z.object({
  subjectLine: z.string().describe('A compelling and personalized email subject line.'),
  emailBody: z.string().describe('The fully drafted, personalized email body in plain text. Use placeholders like [Recipient Name] if a specific person is targeted.'),
});
export type EmailOutreachOutput = z.infer<typeof EmailOutreachOutputSchema>;


export async function generateOutreachEmail(input: EmailOutreachInput): Promise<EmailOutreachOutput> {
    return emailOutreachFlow(input);
}


const emailOutreachPrompt = ai.definePrompt({
    name: 'emailOutreachPrompt',
    input: { schema: EmailOutreachInputSchema },
    output: { schema: EmailOutreachOutputSchema },
    prompt: `
        You are a world-class sales development representative specializing in crafting effective cold outreach emails.
        Your task is to write a personalized email to a prospect based on the information gathered about their company.

        **Prospect Information:**
        - Company Name: {{prospect.companyName}}
        - Industry Keywords: {{#each prospect.industryKeywords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
        - Key People:
          {{#each prospect.people}}
          - {{name}} ({{role}})
          {{/each}}
        - Website Source: {{prospect.sourceUrl}}

        **Our Offer:**
        {{{ourCompanyOffer}}}

        **Sender's Name:**
        {{{senderName}}}

        **Instructions:**
        1.  Create a short, attention-grabbing **Subject Line**. Personalize it using the prospect's company name or industry.
        2.  Draft the **Email Body**. It should be concise and professional.
            - Start with a personalized opening sentence that shows you've done some research (mention their company or industry).
            - Briefly introduce our offer and connect it to a potential benefit for their company.
            - End with a clear, low-friction call-to-action (e.g., asking for interest in a brief 15-minute call).
            - Address it to a specific person if possible (e.g., "Hi [Recipient Name],"), otherwise use a general greeting.
            - Sign off with the sender's name.

        Return the entire response in the specified JSON format.
    `
});


const emailOutreachFlow = ai.defineFlow(
  {
    name: 'emailOutreachFlow',
    inputSchema: EmailOutreachInputSchema,
    outputSchema: EmailOutreachOutputSchema,
  },
  async (input) => {
    console.log(`[Email Outreach Flow] Drafting email for prospect: ${input.prospect.companyName}`);
    const { output } = await emailOutreachPrompt(input);
    if (!output) {
      throw new Error("Email outreach generation failed to produce an output.");
    }
    console.log(`[Email Outreach Flow] Successfully drafted email.`);
    return output;
  }
);
