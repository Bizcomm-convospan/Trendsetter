
import { GET } from './route';
import type { NextRequest } from 'next/server';
import { adminDb } from '../../../lib/firebase-admin';
import { verifyApiKey } from '../../../lib/auth';

// Mock dependencies
jest.mock('../../../lib/firebase-admin', () => ({
  adminDb: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
  },
}));

jest.mock('../../../lib/auth', () => ({
  verifyApiKey: jest.fn(),
}));

const mockedVerifyApiKey = verifyApiKey as jest.Mock;
const mockAdminDb = adminDb as jest.Mocked<typeof adminDb>;
const mockedDoc = mockAdminDb.collection('prospecting_jobs').doc as jest.Mock;

const createMockRequest = (jobId: string | null, authHeader?: string): NextRequest => {
  const url = new URL(`http://localhost/api/job-status${jobId ? `?jobId=${jobId}` : ''}`);
  const headers = new Headers();
  if (authHeader) {
    headers.set('Authorization', authHeader);
  }

  return {
    headers,
    url: url.toString(),
    method: 'GET',
  } as NextRequest;
};


describe('/api/job-status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 Unauthorized if API key is invalid', async () => {
    mockedVerifyApiKey.mockReturnValue(false);
    const req = createMockRequest('job123', 'Bearer invalidkey');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(verifyApiKey).toHaveBeenCalledWith('Bearer invalidkey');
  });

  it('should return 400 Bad Request if jobId is missing', async () => {
    mockedVerifyApiKey.mockReturnValue(true);
    const req = createMockRequest(null, 'Bearer validkey');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('jobId is required');
  });

  it('should return 404 Not Found if job does not exist', async () => {
    mockedVerifyApiKey.mockReturnValue(true);
    mockedDoc.mockReturnThis();
    mockAdminDb.get.mockResolvedValue({ exists: false });

    const req = createMockRequest('nonexistent-job', 'Bearer validkey');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Job not found');
    expect(mockedDoc).toHaveBeenCalledWith('nonexistent-job');
  });

  it('should return 200 with complete job data', async () => {
    mockedVerifyApiKey.mockReturnValue(true);
    const mockJobData = {
      status: 'complete',
      result: { summary: 'Job done', prospects: [] },
      updatedAt: { toDate: () => new Date('2025-06-21T10:32:00Z') },
    };
    mockAdminDb.get.mockResolvedValue({ exists: true, data: () => mockJobData });

    const req = createMockRequest('job123', 'Bearer validkey');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('complete');
    expect(data.result).toEqual(mockJobData.result);
    expect(data.lastUpdated).toBe('2025-06-21T10:32:00.000Z');
  });

  it('should return 200 with processing job data and null result', async () => {
    mockedVerifyApiKey.mockReturnValue(true);
    const mockJobData = {
      status: 'processing',
      updatedAt: { toDate: () => new Date('2025-06-21T10:32:00Z') },
    };
    mockAdminDb.get.mockResolvedValue({ exists: true, data: () => mockJobData });

    const req = createMockRequest('job456', 'Bearer validkey');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('processing');
    expect(data.result).toBeNull();
    expect(data.lastUpdated).toBe('2025-06-21T10:32:00.000Z');
  });

  it('should return 500 on a firestore error', async () => {
    mockedVerifyApiKey.mockReturnValue(true);
    mockAdminDb.get.mockRejectedValue(new Error('Firestore connection failed'));

    const req = createMockRequest('job789', 'Bearer validkey');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal Server Error');
    expect(data.details).toBe('Firestore connection failed');
  });
});
