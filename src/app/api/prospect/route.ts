
import { NextResponse } from 'next/server';
import { autonomousProspecting, AutonomousProspectingInput } from '@/ai/flows/autonomous-prospecting';
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

    const input: AutonomousProspectingInput = { url: validatedFields.data.url };
    const result = await autonomousProspecting(input);
    
    return NextResponse.json(result);

  } catch (e: any) {
    console.error("Error in /api/prospect:", e);
    
    if (e.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: e.errors }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: e.message || "Failed to extract prospects. Please try again." }, 
      { status: 500 }
    );
  }
}
