
// Mock dependencies before importing the functions
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  firestore: jest.fn(() => ({
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    add: jest.fn(),
    get: jest.fn().mockResolvedValue({ exists: false, size: 1 }), // Default: not rate-limited, no cache
    update: jest.fn().mockResolvedValue(true),
    set: jest.fn().mockResolvedValue(true),
  })),
}));

// Mock the entire prospecting and competitor analyzer modules
jest.mock('./prospecting', () => ({
  autonomousProspecting: jest.fn().mockResolvedValue({
    summary: 'Mock AI summary',
    prospects: [{ companyName: 'Test Co' }],
  }),
}));

jest.mock('./competitor-analyzer', () => ({
    analyzeCompetitor: jest.fn().mockResolvedValue({
        keyTopics: ['testing', 'jest'],
        contentGrade: 'A',
    }),
}));

jest.mock('firebase-functions/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

import * as admin from 'firebase-admin';
import { onProspectingJobCreated, prospect, analyze } from './index';
import { autonomousProspecting } from './prospecting';
import { analyzeCompetitor } from './competitor-analyzer';
import type { Event } from 'firebase-functions/v2';
import type { DocumentSnapshot } from 'firebase-functions/v2/firestore';
import type { Request, Response } from 'firebase-functions/v2/https';

// A helper to get the mocked firestore instance
const mockDb = admin.firestore() as jest.Mocked<any>;
(mockDb as any).FieldValue = {
  serverTimestamp: () => 'MOCK_TIMESTAMP',
};
(mockDb as any).Timestamp = {
  fromMillis: (ms: number) => ({
    toDate: () => new Date(ms)
  })
}

// Reset mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
    (mockDb.get as jest.Mock).mockResolvedValue({ exists: false, size: 1 });
});


describe('onProspectingJobCreated Cloud Function', () => {
  let mockEvent: Event<any>;

  beforeEach(() => {
    // Create a mock Firestore event
    const mockSnapshot = {
      data: () => ({ url: 'https://example.com', status: 'queued', webhookUrl: 'https://webhook.site/test' }),
      id: 'test-job-123',
    } as unknown as DocumentSnapshot;

    mockEvent = {
      data: mockSnapshot,
      params: { jobId: 'test-job-123' },
    } as Event<any>;
  });

  it('should successfully process a valid job and call the webhook', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    
    await onProspectingJobCreated(mockEvent);

    const docUpdateMock = mockDb.doc().update;

    // 1. Verifies status is updated to 'processing'
    expect(docUpdateMock).toHaveBeenCalledWith({
      status: 'processing',
      updatedAt: 'MOCK_TIMESTAMP',
    });

    // 2. Verifies the main AI flow is called with correct parameters
    expect(autonomousProspecting).toHaveBeenCalledWith({
      url: 'https://example.com',
      jobId: 'test-job-123',
    });

    // 3. Verifies the webhook is called with the correct payload
    expect(global.fetch).toHaveBeenCalledWith('https://webhook.site/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jobId: 'test-job-123',
            status: 'complete',
            result: { summary: 'Mock AI summary', prospects: [{ companyName: 'Test Co' }] },
        })
    });

    // 4. Verifies status is updated to 'complete' with data from the AI flow
    expect(docUpdateMock).toHaveBeenCalledWith({
      status: 'complete',
      result: { summary: 'Mock AI summary', prospects: [{ companyName: 'Test Co' }] },
      updatedAt: 'MOCK_TIMESTAMP',
    });
  });

  it('should fail the job if rate limit is exceeded', async () => {
    // Make the firestore query mock return a high number of recent jobs
    (mockDb.collection('prospecting_jobs').where as jest.Mock).mockReturnValue({
        get: jest.fn().mockResolvedValue({ size: 100 })
    });

    await onProspectingJobCreated(mockEvent);

    // Verifies the job status is updated to 'failed' with the correct error
    expect(mockDb.doc().update).toHaveBeenCalledWith({
      status: 'failed',
      error: 'Rate limit exceeded. Please try again in a few minutes.',
      updatedAt: 'MOCK_TIMESTAMP',
    });

    // Verifies the expensive AI flow is NOT called
    expect(autonomousProspecting).not.toHaveBeenCalled();
  });

  it('should fail the job if the document URL is missing', async () => {
    // Create a mock event with missing URL data
    const snapshotWithNoUrl = {
      data: () => ({ status: 'queued' }), // no URL
    } as unknown as DocumentSnapshot;
    mockEvent.data = snapshotWithNoUrl;

    await onProspectingJobCreated(mockEvent);

    expect(mockDb.doc().update).toHaveBeenCalledWith({
      status: 'failed',
      error: 'Job document is missing the required URL field.',
      updatedAt: 'MOCK_TIMESTAMP',
    });

    expect(autonomousProspecting).not.toHaveBeenCalled();
  });

  it('should fail the job if the prospecting flow throws an error', async () => {
    const processingError = new Error('AI processing failed');
    (autonomousProspecting as jest.Mock).mockRejectedValueOnce(processingError);

    await onProspectingJobCreated(mockEvent);

    const docUpdateMock = mockDb.doc().update;

    // Checks it was first set to 'processing'
    expect(docUpdateMock).toHaveBeenCalledWith({
      status: 'processing',
      updatedAt: 'MOCK_TIMESTAMP',
    });

    // Checks it was then set to 'failed' with the correct error message
    expect(docUpdateMock).toHaveBeenCalledWith({
      status: 'failed',
      error: `Processing failed: ${processingError.message}`,
      updatedAt: 'MOCK_TIMESTAMP',
    });
  });
});

describe('prospect HTTP Function', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        // Mock Firestore's add method to return a mock ref
        mockDb.collection('prospecting_jobs').add.mockResolvedValue({ id: 'new-job-id-123' });

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
    });

    it('should return 405 if method is not POST', async () => {
        mockRequest = { method: 'GET' };
        await prospect(mockRequest as Request, mockResponse as Response);
        expect(mockResponse.status).toHaveBeenCalledWith(405);
        expect(mockResponse.send).toHaveBeenCalledWith('Method Not Allowed');
    });
    
    it('should return 400 for invalid URL in request body', async () => {
        mockRequest = {
            method: 'POST',
            body: { url: 'not-a-valid-url' },
        };
        await prospect(mockRequest as Request, mockResponse as Response);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
            error: 'Validation failed. Please check your input.',
        }));
    });

    it('should create a job and return 202 with job ID on success', async () => {
        const validUrl = 'https://example.com';
        mockRequest = {
            method: 'POST',
            body: { url: validUrl },
        };
        await prospect(mockRequest as Request, mockResponse as Response);

        // Check if a job was added to firestore
        expect(mockDb.collection('prospecting_jobs').add).toHaveBeenCalledWith({
            url: validUrl,
            status: 'queued', // Initial status
            createdAt: 'MOCK_TIMESTAMP',
            updatedAt: 'MOCK_TIMESTAMP',
        });
        
        // Check for correct response
        expect(mockResponse.status).toHaveBeenCalledWith(202);
        expect(mockResponse.json).toHaveBeenCalledWith({ jobId: 'new-job-id-123' });
    });

    it('should store webhookUrl if provided', async () => {
        const validUrl = 'https://example.com';
        const webhookUrl = 'https://webhook.site/test';
        mockRequest = {
            method: 'POST',
            body: { url: validUrl, webhookUrl: webhookUrl },
        };
        await prospect(mockRequest as Request, mockResponse as Response);

        expect(mockDb.collection('prospecting_jobs').add).toHaveBeenCalledWith({
            url: validUrl,
            webhookUrl: webhookUrl,
            status: 'queued',
            createdAt: 'MOCK_TIMESTAMP',
            updatedAt: 'MOCK_TIMESTAMP',
        });
        
        expect(mockResponse.status).toHaveBeenCalledWith(202);
        expect(mockResponse.json).toHaveBeenCalledWith({ jobId: 'new-job-id-123' });
    });
    
    it('should return 500 on Firestore error', async () => {
        const error = new Error('Firestore write failed');
        mockDb.collection('prospecting_jobs').add.mockRejectedValue(error);

        mockRequest = {
            method: 'POST',
            body: { url: 'https://example.com' },
        };
        await prospect(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Failed to create prospecting job.",
        });
    });
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
        expect(mockResponse.json).toHaveBeenCalledWith({ keyTopics: ['testing', 'jest'], contentGrade: 'A' });
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
        expect(mockResponse.json).toHaveBeenCalledWith({ keyTopics: ['testing', 'jest'], contentGrade: 'A' });
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
