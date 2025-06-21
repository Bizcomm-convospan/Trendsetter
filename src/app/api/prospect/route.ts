
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

    const response = await fetch(functionUrl, {
      method: 'POST',
      body: JSON.stringify({ url: validatedFields.data.url }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Cloud Function returned status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (e: any) {
    console.error("Error in /api/prospect proxy:", e);
    return NextResponse.json(
      { error: e.message || "Failed to call prospecting function. Please try again." }, 
      { status: 500 }
    );
  }
}
