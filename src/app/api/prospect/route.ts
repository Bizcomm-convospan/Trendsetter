
import { NextResponse } from 'next/server';
import { z } from 'zod';

const ProspectRequestSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedFields = ProspectRequestSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { 
          error: "Validation failed. Please check your input.",
          details: validatedFields.error.flatten().fieldErrors 
        }, 
        { status: 400 }
      );
    }

    const functionUrl = process.env.PROSPECTING_FUNCTION_URL;

    if (!functionUrl || functionUrl.includes('your-firebase-cloud-function')) {
        const errorMessage = "PROSPECTING_FUNCTION_URL environment variable is not set. Please configure it with your deployed Cloud Function URL in the .env file.";
        console.error(errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    // This now calls the function that queues the job
    const response = await fetch(functionUrl, {
      method: 'POST',
      body: JSON.stringify({ url: validatedFields.data.url }),
      headers: { 'Content-Type': 'application/json' },
    });

    // The function is expected to respond quickly with a jobId
    const responseData = await response.json();

    if (!response.ok) {
        throw new Error(responseData.error || `Cloud Function returned status ${response.status}`);
    }
    
    // The client will now receive a jobId to track the request
    return NextResponse.json(responseData, { status: response.status });

  } catch (e: any) {
    console.error("Error in /api/prospect proxy:", e);
    return NextResponse.json(
      { error: e.message || "Failed to call prospecting function. Please try again." }, 
      { status: 500 }
    );
  }
}
