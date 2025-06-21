'use server';

import { type NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyApiKey } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization') ?? undefined;

  if (!verifyApiKey(authHeader)) {
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

    const responsePayload = {
        status: jobData.status || 'unknown',
        result: jobData.status === 'complete' ? jobData.result : null,
        lastUpdated: jobData.updatedAt?.toDate().toISOString() || null,
    };
    
    return NextResponse.json(responsePayload, { status: 200 });

  } catch (error: any) {
    console.error(`Error fetching job status for ${jobId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
