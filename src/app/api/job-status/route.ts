'use server';

import { type NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const apiKey = process.env.STATUS_API_KEY;

  if (!apiKey || apiKey.includes('your-secret-api-key-here')) {
    console.error('STATUS_API_KEY environment variable is not set on the server.');
    // Do not expose the exact error to the client for security reasons.
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  if (authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
  }

  try {
    const jobDocRef = adminDb.collection('prospecting_jobs').doc(jobId);
    const jobDoc = await jobDocRef.get();

    if (!jobDoc.exists) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const jobData = jobDoc.data();
    if (!jobData) {
        return NextResponse.json({ error: 'Job data is empty' }, { status: 404 });
    }

    const status = jobData.status;
    const lastUpdated = jobData.updatedAt?.toDate ? jobData.updatedAt.toDate().toISOString() : new Date().toISOString();

    const responsePayload: {
        status: string;
        lastUpdated: string;
        result?: { summary: string; prospects: any[] };
    } = {
      status,
      lastUpdated,
    };

    if (status === 'complete' && jobData.extractedData) {
      responsePayload.result = {
        summary: jobData.extractedData.summary,
        prospects: jobData.extractedData.prospects || [],
      };
    }

    return NextResponse.json(responsePayload, { status: 200 });

  } catch (error: any) {
    console.error(`Error fetching job status for ${jobId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
