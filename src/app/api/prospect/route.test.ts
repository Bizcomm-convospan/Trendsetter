
import { POST } from './route';
import { createRequest } from 'node-mocks-http';

// Mock the global fetch function
global.fetch = jest.fn();

describe('/api/prospect Endpoint', () => {
    beforeEach(() => {
        // Clear mock calls and reset environment variables before each test
        (fetch as jest.Mock).mockClear();
        process.env.PROSPECTING_FUNCTION_URL = 'http://fake-function-url.com/prospect';
    });

    it('should return 400 for an invalid URL', async () => {
        const mockRequest = createRequest({
            method: 'POST',
            json: () => Promise.resolve({ url: 'not-a-valid-url' }),
        });

        const response = await POST(mockRequest as any);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('Validation failed');
        expect(data.details.url).toBeDefined();
    });
    
    it('should return 500 if the function URL environment variable is not set', async () => {
        delete process.env.PROSPECTING_FUNCTION_URL;

        const mockRequest = createRequest({
            method: 'POST',
            json: () => Promise.resolve({ url: 'https://example.com' }),
        });

        const response = await POST(mockRequest as any);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toContain('PROSPECTING_FUNCTION_URL environment variable is not set');
    });

    it('should successfully call the prospecting function and return its response', async () => {
        (fetch as jest.Mock).mockResolvedValue(
            new Response(JSON.stringify({ jobId: 'job-12345' }), {
                status: 202,
                headers: { 'Content-Type': 'application/json' },
            })
        );

        const mockRequest = createRequest({
            method: 'POST',
            json: () => Promise.resolve({ url: 'https://example.com' }),
        });

        const response = await POST(mockRequest as any);
        const data = await response.json();
        
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith('http://fake-function-url.com/prospect', {
            method: 'POST',
            body: JSON.stringify({ url: 'https://example.com' }),
            headers: { 'Content-Type': 'application/json' },
        });
        
        expect(response.status).toBe(202);
        expect(data.jobId).toBe('job-12345');
    });
    
    it('should handle and forward errors from the prospecting function', async () => {
         (fetch as jest.Mock).mockResolvedValue(
            new Response(JSON.stringify({ error: 'The function failed spectacularly' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            })
        );
        
        const mockRequest = createRequest({
            method: 'POST',
            json: () => Promise.resolve({ url: 'https://example.com' }),
        });
        
        const response = await POST(mockRequest as any);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toContain('The function failed spectacularly');
    });
});
