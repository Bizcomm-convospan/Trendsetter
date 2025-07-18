
import { onRequest } from "firebase-functions/v2/onRequest";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { autonomousProspecting, AutonomousProspectingInput } from "./prospecting";
import { z } from "zod";

admin.initializeApp();
const db = admin.firestore();

const ProspectRequestSchema = z.object({
  url: z.string().url({ message: "A valid URL is required." }),
  webhookUrl: z.string().url().optional(),
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
    const jobData: {
      url: string;
      status: string;
      createdAt: admin.firestore.FieldValue;
      updatedAt: admin.firestore.FieldValue;
      webhookUrl?: string;
    } = {
      url: validatedFields.data.url,
      status: 'queued', // Initial status
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (validatedFields.data.webhookUrl) {
      jobData.webhookUrl = validatedFields.data.webhookUrl;
    }

    const jobRef = await db.collection('prospecting_jobs').add(jobData);

    logger.info(`Prospecting job created with ID: ${jobRef.id}`);
    
    // Respond with 202 Accepted and the Job ID for the client to track.
    response.status(202).json({ jobId: jobRef.id });

  } catch (e: any) {
    logger.error("Error creating prospecting job", e);
    response.status(500).json({ error: "Failed to create prospecting job." });
  }
});


/**
 * A Firestore-triggered function that executes the long-running prospecting flow
 * when a new job document is created. Includes rate-limiting to prevent abuse.
 */
export const onProspectingJobCreated = onDocumentCreated('prospecting_jobs/{jobId}', async (event) => {
    const snap = event.data;
    const jobId = event.params.jobId;
    const jobRef = db.collection('prospecting_jobs').doc(jobId);

    if (!snap) {
        logger.error("No data associated with the event", { params: event.params });
        return;
    }

    // --- RATE LIMIT LOGIC ---
    const fiveMinutesAgo = admin.firestore.Timestamp.fromMillis(Date.now() - 5 * 60 * 1000);
    const recentJobsQuery = db.collection('prospecting_jobs').where('createdAt', '>=', fiveMinutesAgo);

    const recentJobsSnap = await recentJobsQuery.get();
    const JOBS_LIMIT_PER_5_MINS = 20;

    if (recentJobsSnap.size > JOBS_LIMIT_PER_5_MINS) {
        logger.warn(`Rate limit exceeded for job ${jobId}. Found ${recentJobsSnap.size} jobs in the last 5 minutes.`);
        await jobRef.update({
            status: 'failed',
            error: 'Rate limit exceeded. Please try again in a few minutes.',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return;
    }
    // --- END RATE LIMIT LOGIC ---

    const data = snap.data();
    const url = data.url;
    const webhookUrl = data.webhookUrl;

    if (!url) {
        logger.error(`Job ${jobId} is missing a URL.`, { data });
        await jobRef.update({
          status: 'failed',
          error: 'Job document is missing the required URL field.',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return;
    }

    try {
        await jobRef.update({
            status: 'processing',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        const input: AutonomousProspectingInput = { url, jobId };
        // This is a long-running process. The function will wait for it to complete.
        const output = await autonomousProspecting(input);
        
        if (webhookUrl) {
            const webhookPayload = {
                jobId,
                status: 'complete',
                result: output,
            };
            logger.info(`Job ${jobId} has a webhook. Notifying ${webhookUrl}...`, { payload: webhookPayload });
            
            try {
                const webhookResponse = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(webhookPayload),
                });

                if (!webhookResponse.ok) {
                    // Log error but don't fail the function
                    const errorBody = await webhookResponse.text();
                    logger.error(`Webhook for job ${jobId} failed with status: ${webhookResponse.status}`, { url: webhookUrl, body: errorBody });
                } else {
                    logger.info(`Successfully sent webhook for job ${jobId}.`);
                }
            } catch (e: any) {
                // Also log fetch errors but don't fail the main function
                logger.error(`Error sending webhook for job ${jobId}:`, { error: e.message, url: webhookUrl });
            }
        } else {
            logger.info(`Job ${jobId} completed. No webhookUrl provided.`);
        }
        
        await jobRef.update({
          status: 'complete',
          result: output,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        logger.info(`Prospecting job ${jobId} completed successfully.`);

    } catch(e: any) {
        logger.error(`Prospecting job ${jobId} failed.`, { error: e.message });
        await jobRef.update({
          status: 'failed',
          error: `Processing failed: ${e.message}`,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
});
