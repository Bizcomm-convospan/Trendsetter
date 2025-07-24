
'use server';
/**
 * @fileOverview An AI agent for generating personalized email outreach sequences.
 *
 * - generateEmailOutreach - A function that creates a multi-step email campaign.
 * - EmailOutreachInput - The input type for the generateEmailOutreach function.
 * - EmailOutreachOutput - The return type for the generateEmailOutreach function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const EmailOutreachInputSchema = z.object({
  recipientProfile: z.string().describe("A detailed description of the target recipient (e.g., 'Marketing Managers at B2B SaaS companies with 50-200 employees')."),
  goal: z.string().describe("The primary objective of the email sequence (e.g., 'To book a 15-minute demo for our product')."),
  productInfo: z.string().describe("A concise summary of the product or service being offered, including its key benefits."),
  tone: z.enum(['formal', 'casual', 'enthusiastic', 'direct']).default('casual').describe("The desired writing style for the emails."),
});
export type EmailOutreachInput = z.infer<typeof EmailOutreachInputSchema>;

const EmailStepSchema = z.object({
    day: z.number().describe("The day in the sequence this email should be sent (e.g., Day 1, Day 4)."),
    subject: z.string().describe("The subject line for this email."),
    body: z.string().describe("The full body content of the email, including placeholders like [Name]."),
    purpose: z.string().describe("The specific goal of this email in the sequence (e.g., 'Initial Introduction & Value Prop', 'Follow-up with Case Study', 'Breakup Email').")
});

export const EmailOutreachOutputSchema = z.object({
  sequence: z.array(EmailStepSchema).describe("A sequence of 3-5 emails designed to achieve the specified goal."),
});
export type EmailOutreachOutput = z.infer<typeof EmailOutreachOutputSchema>;


export async function generateEmailOutreach(input: EmailOutreachInput): Promise<EmailOutreachOutput> {
  return emailOutreachFlow(input);
}


const emailOutreachPrompt = ai.definePrompt({
    name: 'emailOutreachPrompt',
    input: { schema: EmailOutreachInputSchema },
    output: { schema: EmailOutreachOutputSchema },
    prompt: `
        You are a world-class sales development representative (SDR) and email marketing expert. Your task is to create a highly effective, cold email outreach sequence.

        Your sequence should be 3-5 steps long, with emails spaced out over a couple of weeks. Each email must be concise, personalized, and focused on providing value to the recipient before asking for anything in return.

        Here is the context for the campaign:
        - **Recipient Profile**: {{{recipientProfile}}}
        - **Campaign Goal**: {{{goal}}}
        - **Product/Service Information**: {{{productInfo}}}
        - **Desired Tone**: {{{tone}}}

        Based on this, generate the full email sequence. For each step, provide the day it should be sent, a compelling subject line, the full email body (using placeholders like [Name] where appropriate), and the specific purpose of that email.

        Return the entire sequence in the specified JSON format.
    `
});


const emailOutreachFlow = ai.defineFlow(
  {
    name: 'emailOutreachFlow',
    inputSchema: EmailOutreachInputSchema,
    outputSchema: EmailOutreachOutputSchema,
  },
  async (input) => {
    console.log(`[Email Outreach Flow] Generating sequence for goal: ${input.goal}`);
    const { output } = await emailOutreachPrompt(input);
    if (!output) {
      throw new Error("Email outreach generation failed to produce an output.");
    }
    console.log(`[Email Outreach Flow] Successfully generated email sequence.`);
    return output;
  }
);
