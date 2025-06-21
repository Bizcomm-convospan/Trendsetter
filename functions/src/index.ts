import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { autonomousProspecting, AutonomousProspectingInput } from "./prospecting";
import { z } from "zod";

const ProspectRequestSchema = z.object({
  url: z.string().url({ message: "A valid URL is required." }),
});

// The {cors: true} option automatically handles CORS for all origins.
// For production, you should restrict it to your app's domain.
export const prospect = onRequest({ cors: true }, async (request, response) => {
  if (request.method !== 'POST') {
    response.status(405).send('Method Not Allowed');
    return;
  }
  
  logger.info("Prospecting function triggered", { body: request.body });

  const validatedFields = ProspectRequestSchema.safeParse(request.body);

  if (!validatedFields.success) {
    logger.error("Validation failed", { errors: validatedFields.error.flatten().fieldErrors });
    response.status(400).json({
      error: "Validation failed. Please check your input.",
      details: validatedFields.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const input: AutonomousProspectingInput = { url: validatedFields.data.url };
    const result = await autonomousProspecting(input);
    logger.info("Prospecting successful", { result });
    response.status(200).json(result);
  } catch (e: any) {
    logger.error("Error running autonomousProspecting flow", e);
    response.status(500).json({ error: e.message || "Failed to run prospecting flow." });
  }
});
