/**
 * @fileOverview A helper function to crawl a web page using an external service.
 */

export async function crawlPage(url: string): Promise<string> {
  const crawlerUrl = process.env.CRAWLER_SERVICE_URL;

  if (!crawlerUrl || crawlerUrl.includes('your-crawler-service-url')) {
    const errorMessage =
      'CRAWLER_SERVICE_URL environment variable is not set. Please configure it with your deployed crawler service URL in the .env file.';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  try {
    const response = await fetch(crawlerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Crawler service returned status ${response.status}: ${errorBody}`
      );
    }

    const data = await response.json();
    if (typeof data.html !== 'string') {
      throw new Error('Crawler service response did not contain valid HTML content.');
    }
    
    return data.html;
  } catch (error: any) {
    console.error(`Error calling crawler service for URL ${url}:`, error);
    throw new Error(`Failed to crawl URL ${url}. Error: ${error.message}`);
  }
}
