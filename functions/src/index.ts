
import { onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { autonomousProspecting, AutonomousProspectingInput } from "./prospecting";
import { z } from "zod";

admin.initializeApp();
const db = admin.firestore();

const ProspectRequestSchema = z.object({
  url: z.string().url({ message: "A valid URL is required." }),
});

/**
 * An HTTP-triggered function that creates a prospecting job in Firestore and returns a job ID.
 * This function returns immediately, allowing the client to track the job's progress asynchronously.
 */
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
    const jobRef = await db.collection('prospecting_jobs').add({
        url: validatedFields.data.url,
        status: 'queued', // Initial status
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info(`Prospecting job created with ID: ${jobRef.id}`);
    
    // Respond with 202 Accepted and the Job ID for the client to track.
    response.status(202).json({ jobId: jobRef.id });

  } catch (e: any) {
    logger.error("Error creating prospecting job", e);
    response.status(500).json({ error: e.message || "Failed to create prospecting job." });
  }
});


/**
 * A Firestore-triggered function that executes the long-running prospecting flow
 * when a new job document is created.
 */
export const onProspectingJobCreated = onDocumentCreated('prospecting_jobs/{jobId}', async (event) => {
    const snap = event.data;
    if (!snap) {
        logger.error("No data associated with the event", { params: event.params });
        return;
    }
    const data = snap.data();
    const url = data.url;
    const jobId = event.params.jobId;

    if (!url) {
        logger.error(`Job ${jobId} is missing a URL.`, { data });
        await db.collection('prospecting_jobs').doc(jobId).update({
          status: 'failed',
          error: 'Job document is missing the required URL field.',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return;
    }

    try {
        const input: AutonomousProspectingInput = { url, jobId };
        // This is a long-running process. The function will wait for it to complete.
        await autonomousProspecting(input);
        logger.info(`Prospecting job ${jobId} completed successfully.`);
    } catch(e: any) {
        logger.error(`Prospecting job ${jobId} failed.`, { error: e.message });
        // The autonomousProspecting flow is responsible for updating the job status to 'failed'
    }
});
