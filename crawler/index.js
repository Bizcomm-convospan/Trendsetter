
const express = require('express');
const { chromium } = require('playwright');
const { parse } = require('node-html-parser');

const app = express();
app.use(express.json());

// Global browser instance
let browser;

// Function to initialize the browser
async function initializeBrowser() {
  if (browser) return;
  console.log('Initializing new browser instance...');
  try {
    // These args are recommended for running in a containerized environment
    browser = await chromium.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    console.log('Browser initialized successfully.');
    // Set up a listener for if the browser unexpectedly disconnects
    browser.on('disconnected', () => {
      console.error('Browser disconnected. Attempting to relaunch...');
      browser = null;
      initializeBrowser();
    });
  } catch (error) {
    console.error('Failed to launch browser:', error);
    // If the browser fails to launch, the service can't run. Exit the process.
    // The hosting environment (like Cloud Run) will automatically restart it.
    process.exit(1);
  }
}

/**
 * Extracts the main content text from an HTML string.
 * This is a simplified, non-AI approach to reduce tokens for analysis.
 * @param {string} html The raw HTML content of a webpage.
 * @returns {string} The cleaned text of the main content.
 */
function extractMainContent(html) {
    if (!html) return '';
    const root = parse(html);
    
    // Remove common non-content elements to clean up the text
    root.querySelectorAll('script, style, nav, footer, aside, header, .ad, .advertisement, .sidebar, .menu, .ad-container').forEach(node => node.remove());
    
    // Get the text from the body, which should now primarily be the main content
    const body = root.querySelector('body');
    if (!body) return '';

    // Replace consecutive whitespace characters with a single space and trim
    return body.structuredText.replace(/\s\s+/g, ' ').trim();
}


app.post('/crawl', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).send({ error: 'URL is required' });
  }

  // Ensure the browser is ready before processing requests
  if (!browser) {
    console.error('Browser not initialized. Cannot process crawl request.');
    // Service Unavailable
    return res.status(503).send({ error: 'Crawler service is not ready. Please try again later.' });
  }
  
  console.log(`Starting crawl for URL: ${url}`);
  let page;
  try {
    // Create a new page for each request from the persistent browser instance
    page = await browser.newPage();
    // Add a generous timeout to prevent hanging on slow pages
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const rawHtml = await page.content();
    console.log(`Successfully crawled URL: ${url}. Now extracting text.`);

    // Extract clean text content
    const cleanText = extractMainContent(rawHtml);
    console.log(`Text extraction complete for ${url}. Text length: ${cleanText.length}`);

    // Return the clean text instead of the full HTML
    res.send({ text: cleanText });
  } catch (error) {
    console.error(`Crawling error for ${url}:`, error.message);
    res.status(500).send({ error: `Failed to crawl the URL. Error: ${error.message}` });
  } finally {
    // Always close the page, but not the browser
    if (page) {
      await page.close();
    }
  }
});

const PORT = process.env.PORT || 8080;

let serverInstance;

function startServer() {
  return initializeBrowser().then(() => {
    serverInstance = app.listen(PORT, () => {
      console.log(`Crawler service listening on port ${PORT}`);
    });
    return serverInstance;
  });
}

function closeServer(callback) {
    if (serverInstance) {
        serverInstance.close(callback);
    }
}

async function shutdown() {
  console.log('SIGTERM signal received. Closing server and browser.');
  if (serverInstance) {
    serverInstance.close(async () => {
      if (browser) {
        await browser.close();
      }
      process.exit(0);
    });
  }
}

// Start the server if running the file directly
if (require.main === module) {
    startServer();
    process.on('SIGTERM', shutdown);
}


module.exports = { app, initializeBrowser, closeServer, browser: () => browser };
