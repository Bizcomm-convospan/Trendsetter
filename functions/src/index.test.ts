
// Mock dependencies before importing the functions
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  firestore: jest.fn(() => ({
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ size: 1 }), // Default: not rate-limited
    update: jest.fn().mockResolvedValue(true),
  })),
}));

jest.mock('./prospecting', () => ({
  autonomousProspecting: jest.fn().mockResolvedValue({
    summary: 'Mock AI summary',
    prospects: [],
  }),
}));

jest.mock('firebase-functions/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

import * as admin from 'firebase-admin';
import { onProspectingJobCreated } from './index';
import { autonomousProspecting } from './prospecting';
import type { Event } from 'firebase-functions/v2';
import type { DocumentSnapshot } from 'firebase-functions/v2/firestore';

// A helper to get the mocked firestore instance
const mockDb = admin.firestore() as jest.Mocked<any>;
mockDb.FieldValue = {
  serverTimestamp: () => 'MOCK_TIMESTAMP',
};


describe('onProspectingJobCreated Cloud Function', () => {
  let mockEvent: Event<any>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create a mock Firestore event
    const mockSnapshot = {
      data: () => ({ url: 'https://example.com', status: 'queued' }),
      id: 'test-job-123',
    } as unknown as DocumentSnapshot;

    mockEvent = {
      data: mockSnapshot,
      params: { jobId: 'test-job-123' },
    } as Event<any>;
  });

  it('should successfully process a valid job', async () => {
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

    // 3. Verifies status is updated to 'complete' with data from the AI flow
    expect(docUpdateMock).toHaveBeenCalledWith({
      status: 'complete',
      extractedData: { summary: 'Mock AI summary', prospects: [] },
      updatedAt: 'MOCK_TIMESTAMP',
    });
  });

  it('should fail the job if rate limit is exceeded', async () => {
    // Make the firestore query mock return a high number of recent jobs
    mockDb.collection().where().get.mockResolvedValueOnce({ size: 100 });

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
