
import { onRequest } from "firebase-functions/v2/https";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { analyzeCompetitor, CompetitorAnalyzerInputSchema, CompetitorAnalyzerInput, CompetitorAnalyzerOutput } from "./competitor-analyzer";
import fetch from 'node-fetch';


// Initialize the browser instance from the crawl tool when the function warms up.
import { initializeBrowserOnColdStart } from './tools/crawl';
initializeBrowserOnColdStart();


admin.initializeApp();
const db = admin.firestore();

const CompetitorAnalysisRequestSchema = CompetitorAnalyzerInputSchema;


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

  const input: CompetitorAnalyzerInput = validatedFields.data;
  const { url } = input;
  const flowName = 'competitorAnalyzerFlow';
  
  const crypto = require('crypto');
  const cacheKey = crypto.createHash('sha256').update(`${flowName}:${url}`).digest('hex');
  const cacheRef = db.collection('ai_cache').doc(cacheKey);

  try {
    const cachedDoc = await cacheRef.get();
    if (cachedDoc.exists) {
      const cacheData = cachedDoc.data();
      if (cacheData?.expiresAt && cacheData.expiresAt.toDate() > new Date()) {
        logger.info(`[Cache Hit] Returning cached result for ${url}`);
        response.status(200).json(cacheData.output);
        return;
      }
      logger.info(`[Cache Stale] Found expired cache for ${url}. Re-running flow.`);
    }

    logger.info(`[Cache Miss] Running competitor analysis for ${url}`);
    const output: CompetitorAnalyzerOutput = await analyzeCompetitor(input);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);
    await cacheRef.set({
      output,
      createdAt: new Date(),
      expiresAt,
    });

    response.status(200).json(output);

  } catch (e: any) {
    logger.error(`Error during competitor analysis for ${url}`, { message: e.message, stack: e.stack });
    response.status(500).json({ error: `Failed to analyze competitor: ${e.message}` });
  }
});


/**
 * A Firestore-triggered function that sends published article data to a webhook.
 * This is designed to integrate with services like Zapier.
 */
export const onArticlePublish = onDocumentUpdated("articles/{articleId}", async (event) => {
  if (!event.data) {
    logger.info("No data associated with the event, skipping.");
    return;
  }

  const before = event.data.before.data();
  const after = event.data.after.data();

  if (before.status === 'draft' && after.status === 'published') {
    logger.info(`Article ${event.params.articleId} was published. Preparing to send to webhook.`);
    
    const settingsRef = db.collection('settings').doc('integrations');
    const settingsDoc = await settingsRef.get();
    const webhookUrl = settingsDoc.data()?.zapierWebhookUrl;

    if (!webhookUrl) {
        logger.warn(`Zapier webhook URL is not configured in Firestore settings. Skipping webhook for article ${event.params.articleId}.`);
        return;
    }
    
    const payload = {
        id: event.params.articleId,
        title: after.title,
        content: after.content,
        meta: after.meta,
        featuredImageUrl: after.featuredImageUrl || '',
        publishedAt: after.publishedAt.toDate().toISOString(),
    };

    try {
        logger.info(`Sending payload to Zapier for article ${event.params.articleId}.`);
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Zapier webhook failed with status ${response.status}: ${errorBody}`);
        }

        logger.info(`Successfully sent article ${event.params.articleId} to Zapier webhook.`);

    } catch (error: any) {
        logger.error(`Error sending data to Zapier for article ${event.params.articleId}:`, {
            message: error.message,
            stack: error.stack,
        });
    }
  }
});
