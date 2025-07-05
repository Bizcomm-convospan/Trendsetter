/**
 * @fileOverview An AI-powered text extractor for Firebase Functions.
 */
import { ai } from '../genkit';
import { z } from 'zod';

const ExtractionSchema = z.object({
  mainContent: z.string().describe('The extracted main article text from the HTML, with all scripts, styles, ads, and navigation removed.'),
});

const extractorPrompt = ai.definePrompt({
    name: 'htmlTextExtractorFunction',
    input: { schema: z.object({ html: z.string() }) },
    output: { schema: ExtractionSchema },
    prompt: `You are an expert at parsing HTML. From the following HTML content, extract only the main article text, including headings and paragraphs. Remove all HTML tags, scripts, CSS, navigation bars, footers, and advertisements. Return only the clean, readable text of the article.`,
});


/**
 * Extracts the main article content from a raw HTML string.
 * @param html The raw HTML content of a webpage.
 * @returns A promise that resolves to the clean text of the main content.
 */
export async function extractTextFromHtml(html: string): Promise<string> {
  if (!html) {
    return '';
  }

  try {
    const { output } = await extractorPrompt({ html });
    return output?.mainContent || '';
  } catch (error) {
    console.error("Error during text extraction in function:", error);
    return '';
  }
}
