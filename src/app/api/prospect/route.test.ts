
import { POST } from './route';
import type { NextRequest } from 'next/server';

// Mock the global fetch function
global.fetch = jest.fn();

// Spy on console methods to check for structured logging
const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});


describe('/api/prospect Endpoint with Structured Logging', () => {
    beforeEach(() => {
        // Clear mock calls and reset environment variables before each test
        (fetch as jest.Mock).mockClear();
        consoleInfoSpy.mockClear();
        consoleErrorSpy.mockClear();
        process.env.PROSPECTING_FUNCTION_URL = 'http://fake-function-url.com/prospect';
    });

    afterAll(() => {
        // Restore original console methods
        consoleInfoSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    it('should return 400 for an invalid URL and log an error', async () => {
        const mockRequest = {
            json: () => Promise.resolve({ url: 'not-a-valid-url' }),
            ip: '127.0.0.1',
        };

        const response = await POST(mockRequest as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('Validation failed');
        expect(data.details.url).toBeDefined();

        // Check for structured logging
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        const logObject = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
        expect(logObject).toMatchObject({
            message: 'Validation failed',
            ip: '127.0.0.1',
            authUid: 'anonymous',
            error: { url: expect.any(Array) },
        });
        expect(logObject.requestId).toBeDefined();
    });
    
    it('should return 500 if the function URL environment variable is not set and log an error', async () => {
        delete process.env.PROSPECTING_FUNCTION_URL;

        const mockRequest = {
            json: () => Promise.resolve({ url: 'https://example.com' }),
            ip: '127.0.0.1',
        };

        const response = await POST(mockRequest as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toContain('PROSPECTING_FUNCTION_URL environment variable is not set');
        
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        const logObject = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
        expect(logObject).toMatchObject({
            message: 'PROSPECTING_FUNCTION_URL environment variable is not set.',
            ip: '127.0.0.1',
        });
    });

    it('should successfully call the prospecting function and log info', async () => {
        (fetch as jest.Mock).mockResolvedValue(
            new Response(JSON.stringify({ jobId: 'job-12345' }), {
                status: 202,
                headers: { 'Content-Type': 'application/json' },
            })
        );

        const mockRequest = {
            json: () => Promise.resolve({ url: 'https://example.com' }),
            ip: '127.0.0.1',
        };

        const response = await POST(mockRequest as NextRequest);
        const data = await response.json();
        
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith('http://fake-function-url.com/prospect', {
            method: 'POST',
            body: JSON.stringify({ url: 'https://example.com' }),
            headers: { 'Content-Type': 'application/json' },
        });
        
        expect(response.status).toBe(202);
        expect(data.jobId).toBe('job-12345');

        // Check for structured info logs
        expect(consoleInfoSpy).toHaveBeenCalledTimes(2);
        const firstLog = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
        expect(firstLog).toMatchObject({
            message: 'Prospecting request received',
            url: 'https://example.com',
        });

        const secondLog = JSON.parse(consoleInfoSpy.mock.calls[1][0]);
        expect(secondLog).toMatchObject({
            message: 'Successfully submitted prospecting job',
            jobId: 'job-12345',
        });
    });
    
    it('should handle and log errors from the prospecting function', async () => {
         (fetch as jest.Mock).mockResolvedValue(
            new Response(JSON.stringify({ error: 'The function failed spectacularly' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            })
        );
        
        const mockRequest = {
            json: () => Promise.resolve({ url: 'https://example.com' }),
            ip: '127.0.0.1',
        };
        
        const response = await POST(mockRequest as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toContain('The function failed spectacularly');
        
        // Check for structured error logs
        expect(consoleErrorSpy).toHaveBeenCalledTimes(2); // One for fetch error, one for outer catch
        const logObject = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
        expect(logObject).toMatchObject({
            message: 'Prospecting function call failed',
            error: 'The function failed spectacularly'
        });
    });
});
