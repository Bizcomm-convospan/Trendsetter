
import { onRequest } from "firebase-functions/v2/onRequest";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { analyzeCompetitor, CompetitorAnalyzerInput } from "./competitor-analyzer";
import { z } from "zod";

// Initialize the browser instance from the crawl tool when the function warms up.
import { initializeBrowserOnColdStart } from './tools/crawl';
initializeBrowserOnColdStart();


admin.initializeApp();
const db = admin.firestore();

const CompetitorAnalysisRequestSchema = z.object({
  url: z.string().url({ message: "A valid URL is required." }),
});

/**
 * An HTTP-triggered function that runs the competitor analysis flow.
 * This flow is synchronous and returns the result directly. It includes caching.
 */
export const analyze = onRequest({ cors: true }, async (request, response) => {
  if (request.method !== 'POST') {
    response.status(405).send('Method Not Allowed');
    return;
  }

  logger.info("Competitor analysis function triggered", { body: request.body });
  const validatedFields = CompetitorAnalysisRequestSchema.safeParse(request.body);

  if (!validatedFields.success) {
    logger.error("Validation failed for analysis", { errors: validatedFields.error.flatten().fieldErrors });
    response.status(400).json({
      error: "Validation failed. Please check your input.",
      details: validatedFields.error.flatten().fieldErrors,
    });
    return;
  }

  const { url } = validatedFields.data;
  const flowName = 'competitorAnalyzerFlow';
  const input: CompetitorAnalyzerInput = { url };

  // Implement Firestore-based caching
  const cacheKey = `${flowName}:${url}`;
  const cacheRef = db.collection('ai_cache').doc(cacheKey);

  try {
    const cachedDoc = await cacheRef.get();
    if (cachedDoc.exists) {
      const cacheData = cachedDoc.data();
      // Check if cache entry has an expiration and if it's still valid
      if (cacheData?.expiresAt && cacheData.expiresAt.toDate() > new Date()) {
        logger.info(`[Cache Hit] Returning cached result for ${url}`);
        response.status(200).json(cacheData.output);
        return;
      }
    }

    logger.info(`[Cache Miss] Running competitor analysis for ${url}`);
    const output = await analyzeCompetitor(input);

    // Store result in cache with a 24-hour expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);
    await cacheRef.set({
      output,
      createdAt: new Date(),
      expiresAt,
    });

    response.status(200).json(output);

  } catch (e: any) {
    logger.error(`Error during competitor analysis for ${url}`, e);
    response.status(500).json({ error: `Failed to analyze competitor: ${e.message}` });
  }
});
