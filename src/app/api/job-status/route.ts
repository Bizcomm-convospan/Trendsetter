'use server';

import { type NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
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

    // Convert Firestore Timestamps to ISO strings to ensure they are serializable
    const serializableData = {
        ...jobData,
        createdAt: jobData.createdAt?.toDate ? jobData.createdAt.toDate().toISOString() : jobData.createdAt,
        updatedAt: jobData.updatedAt?.toDate ? jobData.updatedAt.toDate().toISOString() : jobData.updatedAt,
    };

    return NextResponse.json(serializableData, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching job status for ${jobId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
