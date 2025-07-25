
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const AnalyzeRequestSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
});

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  const ip = request.ip ?? 'unknown';
  const authUid = 'anonymous'; // In a real app, you would get this from your auth session.

  const logMetadata = { requestId, ip, authUid };

  try {
    const functionUrl = process.env.COMPETITOR_ANALYSIS_FUNCTION_URL;

    if (!functionUrl || functionUrl.includes('your-firebase-cloud-function')) {
        const errorMessage = "The Competitor Analysis agent is not configured. Please set the COMPETITOR_ANALYSIS_FUNCTION_URL environment variable in your project settings.";
        console.error(JSON.stringify({ message: errorMessage, ...logMetadata }));
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
      
    const body = await request.json();
    console.info(JSON.stringify({ message: 'Analysis request received', ...logMetadata, url: body.url }));

    const validatedFields = AnalyzeRequestSchema.safeParse(body);

    if (!validatedFields.success) {
      const errorDetails = validatedFields.error.flatten().fieldErrors;
      console.error(JSON.stringify({ message: 'Validation failed for analysis request', ...logMetadata, error: errorDetails }));
      return NextResponse.json(
        { 
          error: "Validation failed. Please check your input.",
          details: errorDetails 
        }, 
        { status: 400 }
      );
    }

    // Call the dedicated Firebase Function for competitor analysis
    const response = await fetch(functionUrl, {
      method: 'POST',
      body: JSON.stringify({ url: validatedFields.data.url }),
      headers: { 'Content-Type': 'application/json' },
    });

    const responseData = await response.json();

    if (!response.ok) {
        const errorMessage = responseData.error || `Analysis function returned status ${response.status}`;
        console.error(JSON.stringify({ message: 'Analysis function call failed', ...logMetadata, error: errorMessage, status: response.status }));
        throw new Error(errorMessage);
    }
    
    console.info(JSON.stringify({ message: 'Successfully returned analysis', ...logMetadata, url: validatedFields.data.url }));
    return NextResponse.json(responseData, { status: response.status });

  } catch (e: any) {
    console.error(JSON.stringify({ message: 'Error in /api/analyze proxy', ...logMetadata, error: e.message }));
    return NextResponse.json(
      { error: e.message || "Failed to call analysis function. Please try again." }, 
      { status: 500 }
    );
  }
}
