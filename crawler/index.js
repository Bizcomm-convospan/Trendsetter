
const express = require('express');
const { chromium } = require('playwright');

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
    const content = await page.content();
    console.log(`Successfully crawled URL: ${url}`);
    res.send({ html: content });
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

// Start the server only after the browser is successfully initialized
initializeBrowser().then(() => {
    app.listen(PORT, () => console.log(`Crawler service listening on port ${PORT}`));
});

// Handle graceful shutdown signals from the hosting environment
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received. Closing browser.');
    if (browser) {
        await browser.close();
    }
    process.exit(0);
});
