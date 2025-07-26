// Mock dependencies before importing the functions
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  firestore: jest.fn(() => ({
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    add: jest.fn(),
    get: jest.fn().mockResolvedValue({ exists: false, size: 1, empty: true, forEach: () => {} }), // Default: not rate-limited, no cache, no stale jobs
    update: jest.fn().mockResolvedValue(true),
    set: jest.fn().mockResolvedValue(true),
    batch: () => ({
        update: jest.fn(),
        commit: jest.fn().mockResolvedValue(true),
    }),
  })),
}));

// Mock the competitor analyzer module
jest.mock('./competitor-analyzer', () => ({
    analyzeCompetitor: jest.fn().mockResolvedValue({
        keyTopics: ['testing', 'jest'],
        contentGrade: 'A',
        contentGaps: [],
        toneAnalysis: 'Test Tone'
    }),
    CompetitorAnalyzerInputSchema: { safeParse: (x: any) => ({ success: true, data: x }) } // Mock Zod schema for tests
}));

jest.mock('firebase-functions/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

import * as admin from 'firebase-admin';
import { analyze } from './index';
import { analyzeCompetitor } from './competitor-analyzer';
import type { Request } from 'firebase-functions/v2/https';
import type { Response } from 'express';


// A helper to get the mocked firestore instance
const mockDb = admin.firestore() as jest.Mocked<any>;
(mockDb as any).FieldValue = {
  serverTimestamp: () => 'MOCK_TIMESTAMP',
};
(mockDb as any).Timestamp = {
  fromMillis: (ms: number) => ({
    toDate: () => new Date(ms)
  }),
  fromDate: (date: Date) => ({
    toDate: () => date
  })
}

// Reset mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
    (mockDb.get as jest.Mock).mockResolvedValue({ exists: false, size: 1, empty: true, forEach: () => {} });
});

describe('analyze HTTP Function', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    const validUrl = 'https://example.com/article';

    beforeEach(() => {
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
    });
    
    it('should return 405 if method is not POST', async () => {
        mockRequest = { method: 'GET' };
        await analyze(mockRequest as Request, mockResponse as Response);
        expect(mockResponse.status).toHaveBeenCalledWith(405);
        expect(mockResponse.send).toHaveBeenCalledWith('Method Not Allowed');
    });

    it('should return 400 for invalid URL in request body', async () => {
        // Mock Zod safeParse to fail
        const { CompetitorAnalyzerInputSchema } = require('./competitor-analyzer');
        CompetitorAnalyzerInputSchema.safeParse.mockReturnValueOnce({ success: false, error: { flatten: () => ({ fieldErrors: { url: ['Invalid URL'] } }) } });
        
        mockRequest = { method: 'POST', body: { url: 'invalid' }};
        await analyze(mockRequest as Request, mockResponse as Response);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Validation failed. Please check your input.' }));
    });

    it('should call analyzeCompetitor and return result on cache miss', async () => {
        mockRequest = { method: 'POST', body: { url: validUrl }};
        // Ensure cache miss (default mock behavior)
        
        await analyze(mockRequest as Request, mockResponse as Response);
        
        expect(analyzeCompetitor).toHaveBeenCalledWith({ url: validUrl });
        expect(mockDb.collection('ai_cache').doc().set).toHaveBeenCalled(); // Check if result is cached
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        const expectedResponse = {
            keyTopics: ['testing', 'jest'],
            contentGrade: 'A',
            contentGaps: [],
            toneAnalysis: 'Test Tone'
        };
        expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
    });

    it('should return cached result on cache hit', async () => {
        const cachedOutput = { keyTopics: ['cached', 'data'], contentGrade: 'B' };
        // Simulate cache hit
        (mockDb.get as jest.Mock).mockResolvedValue({
            exists: true,
            data: () => ({
                output: cachedOutput,
                expiresAt: { toDate: () => new Date(Date.now() + 100000) } // Not expired
            })
        });

        mockRequest = { method: 'POST', body: { url: validUrl }};
        await analyze(mockRequest as Request, mockResponse as Response);

        expect(analyzeCompetitor).not.toHaveBeenCalled(); // Should not call the expensive function
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(cachedOutput);
    });

    it('should ignore expired cache and fetch new result', async () => {
         // Simulate expired cache hit
        (mockDb.get as jest.Mock).mockResolvedValue({
            exists: true,
            data: () => ({
                output: { keyTopics: ['expired'] },
                expiresAt: { toDate: () => new Date(Date.now() - 100000) } // Expired
            })
        });

        mockRequest = { method: 'POST', body: { url: validUrl }};
        await analyze(mockRequest as Request, mockResponse as Response);

        expect(analyzeCompetitor).toHaveBeenCalledWith({ url: validUrl });
        expect(mockDb.collection('ai_cache').doc().set).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        const expectedResponse = {
            keyTopics: ['testing', 'jest'],
            contentGrade: 'A',
            contentGaps: [],
            toneAnalysis: 'Test Tone'
        };
        expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
    });

    it('should return 500 if analyzeCompetitor flow fails', async () => {
        const error = new Error('AI failed');
        (analyzeCompetitor as jest.Mock).mockRejectedValue(error);
        
        mockRequest = { method: 'POST', body: { url: validUrl }};
        await analyze(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: `Failed to analyze competitor: ${error.message}` });
    });
});
