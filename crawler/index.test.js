
const request = require('supertest');
const { app, initializeBrowser, closeServer, browser } = require('./index');

// Mock the playwright dependency to avoid launching a real browser during tests
jest.mock('playwright', () => ({
  chromium: {
    launch: jest.fn().mockResolvedValue({
      newPage: jest.fn().mockResolvedValue({
        goto: jest.fn().mockResolvedValue(null),
        content: jest.fn().mockResolvedValue('<html><body>Mocked Page Content</body></html>'),
        close: jest.fn().mockResolvedValue(null),
      }),
      close: jest.fn().mockResolvedValue(null),
      on: jest.fn(),
    }),
  },
}));

describe('Crawler Service API', () => {
    beforeAll(async () => {
        // Initialize the mocked browser instance
        await initializeBrowser();
    });

    it('should return 400 Bad Request if URL is not provided', async () => {
        const response = await request(app).post('/crawl').send({});
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('URL is required');
    });

    it('should return 200 OK with HTML content for a valid URL', async () => {
        const response = await request(app)
            .post('/crawl')
            .send({ url: 'https://example.com' });
        
        expect(response.status).toBe(200);
        expect(response.body.html).toBe('<html><body>Mocked Page Content</body></html>');
    });

    it('should return 500 Internal Server Error if page.goto fails', async () => {
        // Temporarily configure the mock to fail for this specific test
        const mockPage = {
            goto: jest.fn().mockRejectedValue(new Error('Page load timeout')),
            content: jest.fn(),
            close: jest.fn().mockResolvedValue(null),
        };
        browser().newPage.mockResolvedValue(mockPage);

        const response = await request(app)
            .post('/crawl')
            .send({ url: 'https://failing-url.com' });

        expect(response.status).toBe(500);
        expect(response.body.error).toContain('Failed to crawl the URL. Error: Page load timeout');
    });
});
