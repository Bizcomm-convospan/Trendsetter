
'use server';
/**
 * @fileOverview A Genkit tool for crawling a web page using Playwright.
 * This tool runs within the Firebase Cloud Functions environment.
 */
import { ai } from '../genkit';
import { z } from 'zod';
import { chromium, Browser } from 'playwright';
import { parse } from 'node-html-parser';
import * as logger from 'firebase-functions/logger';


const MAX_INPUT_CHARACTERS = 16000; // Approx 4k tokens, a safe limit for cost control.
let browser: Browser | null = null;


/**
 * Initializes the Playwright browser instance. 
 * This is designed to be called once during a function's cold start to reuse the browser
 * instance across multiple invocations for better performance.
 */
async function initializeBrowser(): Promise<Browser> {
    if (browser && browser.isConnected()) {
        logger.info('Reusing existing browser instance.');
        return browser;
    }
    logger.info('Initializing new browser instance...');
    try {
        // These args are recommended for running in a containerized environment like Cloud Functions
        browser = await chromium.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        logger.info('Browser initialized successfully.');
        
        // It's good practice to handle unexpected disconnects
        browser.on('disconnected', () => {
            logger.warn('Browser disconnected. It will be re-launched on the next invocation.');
            browser = null;
        });

        return browser;
    } catch (error: any) {
        logger.error('Failed to launch browser:', { error: error.message });
        // If the browser fails to launch, subsequent calls will fail.
        // This error will be caught by the tool's execution logic.
        throw new Error('Failed to initialize Playwright browser.');
    }
}

/**
 * A wrapper to call initializeBrowser only on cold starts.
 * This can be called at the top level of the index.ts file.
 */
export function initializeBrowserOnColdStart() {
    initializeBrowser().catch(err => {
        logger.error("Error during initial browser start-up:", err);
    });
}


/**
 * Extracts the main content text from an HTML string.
 * This strips out scripts, styles, and common boilerplate to reduce tokens.
 * @param {string} html The raw HTML content of a webpage.
 * @returns {string} The cleaned text of the main content.
 */
function extractMainContent(html: string): string {
    if (!html) return '';
    const root = parse(html);
    
    // Remove common non-content elements
    root.querySelectorAll('script, style, nav, footer, aside, header, .ad, .advertisement, .sidebar, .menu, .ad-container').forEach(node => node.remove());
    
    const body = root.querySelector('body');
    if (!body) return '';

    // Replace consecutive whitespace characters with a single space and trim
    return body.structuredText.replace(/\s\s+/g, ' ').trim();
}


export const crawlUrlTool = ai.defineTool({
    name: 'crawlUrlForAnalysis',
    description: 'Crawls the given URL and returns its main text content, stripped of HTML. Use this to get the content of a web page for analysis.',
    inputSchema: z.object({ url: z.string().url() }),
    outputSchema: z.string().describe('The clean, extracted text content of the page, stripped of HTML, scripts, and other boilerplate.'),
}, async (input) => {
    logger.info(`[Crawl Tool] Starting crawl for URL: ${input.url}`);
    
    const currentBrowser = await initializeBrowser();
    let page;
    try {
        page = await currentBrowser.newPage();
        // Add a generous timeout to prevent hanging on slow pages
        await page.goto(input.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const rawHtml = await page.content();
        
        logger.info(`[Crawl Tool] Successfully crawled URL: ${input.url}. Now extracting text.`);
        const cleanText = extractMainContent(rawHtml);
        
        // Truncate the text to control token usage and cost.
        const truncatedText = cleanText.substring(0, MAX_INPUT_CHARACTERS);
        logger.info(`[Crawl Tool] Truncated content from ${cleanText.length} to ${truncatedText.length} characters.`);
        
        return truncatedText;
    } catch (error: any) {
        logger.error(`[Crawl Tool] Crawling error for ${input.url}:`, { message: error.message });
        throw new Error(`Failed to crawl or process the URL. Error: ${error.message}`);
    } finally {
        if (page) {
            await page.close();
        }
    }
});
