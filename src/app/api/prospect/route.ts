
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const ProspectRequestSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
  webhookUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  const ip = request.ip ?? 'unknown';
  // In a real app, you would get this from your authentication session.
  const authUid = 'anonymous'; 

  const logMetadata = { requestId, ip, authUid };

  try {
    const body = await request.json();
    console.info(JSON.stringify({ message: 'Prospecting request received', ...logMetadata, url: body.url }));

    const validatedFields = ProspectRequestSchema.safeParse(body);

    if (!validatedFields.success) {
      const errorDetails = validatedFields.error.flatten().fieldErrors;
      console.error(JSON.stringify({ message: 'Validation failed', ...logMetadata, error: errorDetails }));
      return NextResponse.json(
        { 
          error: "Validation failed. Please check your input.",
          details: errorDetails 
        }, 
        { status: 400 }
      );
    }

    const functionUrl = process.env.PROSPECTING_FUNCTION_URL;

    if (!functionUrl || functionUrl.includes('your-firebase-cloud-function')) {
        const errorMessage = "PROSPECTING_FUNCTION_URL environment variable is not set. Please configure it with your deployed Cloud Function URL in the .env file.";
        console.error(JSON.stringify({ message: errorMessage, ...logMetadata }));
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    // This now calls the function that queues the job
    const response = await fetch(functionUrl, {
      method: 'POST',
      body: JSON.stringify({
        url: validatedFields.data.url,
        webhookUrl: validatedFields.data.webhookUrl,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const responseData = await response.json();

    if (!response.ok) {
        const errorMessage = responseData.error || `Cloud Function returned status ${response.status}`;
        console.error(JSON.stringify({ message: 'Prospecting function call failed', ...logMetadata, error: errorMessage, status: response.status }));
        throw new Error(errorMessage);
    }
    
    console.info(JSON.stringify({ message: 'Successfully submitted prospecting job', ...logMetadata, jobId: responseData.jobId }));
    // The client will now receive a jobId to track the request
    return NextResponse.json(responseData, { status: response.status });

  } catch (e: any) {
    console.error(JSON.stringify({ message: 'Error in /api/prospect proxy', ...logMetadata, error: e.message }));
    return NextResponse.json(
      { error: e.message || "Failed to call prospecting function. Please try again." }, 
      { status: 500 }
    );
  }
}
