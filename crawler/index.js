const express = require('express');
const { chromium } = require('playwright');

const app = express();
app.use(express.json());

app.post('/crawl', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).send({ error: 'URL is required' });
  }

  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const content = await page.content();
    res.send({ html: content });
  } catch (error) {
    console.error('Crawling error:', error);
    res.status(500).send({ error: 'Failed to crawl the URL.' });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
