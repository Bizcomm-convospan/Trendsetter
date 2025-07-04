
'use server';

import { generateSeoArticle, GenerateSeoArticleInput, GenerateSeoArticleOutput } from '@/ai/flows/generate-seo-article';
import { discoverTrends, DiscoverTrendsInput, DiscoverTrendsOutput } from '@/ai/flows/discover-trends-flow';
import { generateHumanizedContent, type HumanizedContentInput } from '@/ai/flows/humanized-content';
import { detectAiContent, type AiDetectorInput, type AiDetectorOutput } from '@/ai/flows/ai-detector-flow';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';


const GenerateArticleSchema = z.object({
  topic: z.string().min(3, "Topic or keyword must be at least 3 characters long."),
});

const DiscoverTrendsSchema = z.object({
  topic: z.string().optional(),
  geography: z.string().optional(),
  language: z.string().optional(),
  category: z.string().optional(),
});

const HumanizeArticleSchema = z.object({
  contentToHumanize: z.string().min(20, "Content to humanize must be at least 20 characters long."),
  tone: z
    .enum(['formal', 'casual', 'storytelling', 'mixed'])
    .default('mixed'),
  keyword: z.string().optional(),
  userInsight: z.string().optional(),
});

const AiDetectorSchema = z.object({
    content: z.string().min(50, "Content must be at least 50 characters to analyze effectively."),
});


export interface ActionResponse<T> {
  data?: T;
  error?: string;
  validationErrors?: Record<string, string[]>;
}

export async function handleGenerateArticle(formData: FormData): Promise<ActionResponse<GenerateSeoArticleOutput>> {
  const rawFormData = {
    topic: formData.get('topic') as string,
  };

  const validatedFields = GenerateArticleSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      validationErrors: validatedFields.error.flatten().fieldErrors,
      error: "Validation failed. Please check your input.",
    };
  }

  try {
    const input: GenerateSeoArticleInput = { topic: validatedFields.data.topic };
    const article = await generateSeoArticle(input);
    return { data: article };
  } catch (e: any) {
    console.error("Error generating article:", e);
    return { error: e.message || "Failed to generate article. Please try again." };
  }
}

export async function handleDiscoverTrends(formData: FormData): Promise<ActionResponse<DiscoverTrendsOutput>> {
  const rawFormData: {
    topic?: string;
    geography?: string;
    language?: string;
    category?: string;
  } = {
    topic: formData.get('topic') as string | undefined,
    geography: formData.get('geography') as string | undefined,
    language: formData.get('language') as string | undefined,
    category: formData.get('category') as string | undefined,
  };
  
  // Don't pass 'all' to the AI flow, as it's the default behavior
  if (rawFormData.category === 'all') {
    rawFormData.category = undefined;
  }

  const validatedFields = DiscoverTrendsSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      validationErrors: validatedFields.error.flatten().fieldErrors,
      error: "Validation failed. Please check your input.",
    };
  }

  try {
    const input: DiscoverTrendsInput = validatedFields.data;
    const trends = await discoverTrends(input);
    return { data: trends };
  } catch (e: any) {
    console.error("Error discovering trends:", e);
    return { error: e.message || "Failed to discover trends. Please try again." };
  }
}

export async function handleGenerateHumanizedContent(formData: FormData): Promise<ActionResponse<string>> {
    const rawFormData = {
        contentToHumanize: formData.get('contentToHumanize'),
        tone: formData.get('tone'),
        keyword: formData.get('keyword'),
        userInsight: formData.get('userInsight'),
    };

    const validatedFields = HumanizeArticleSchema.safeParse(rawFormData);

    if (!validatedFields.success) {
        return {
            validationErrors: validatedFields.error.flatten().fieldErrors,
            error: "Validation failed. Please check your input.",
        };
    }

    try {
        const result = await generateHumanizedContent(validatedFields.data as HumanizedContentInput);
        return { data: result };
    } catch (e: any) {
        console.error("Error generating humanized content:", e);
        return { error: e.message || "Failed to generate content. Please try again." };
    }
}

export async function handleAiDetection(formData: FormData): Promise<ActionResponse<AiDetectorOutput>> {
    const rawFormData = {
        content: formData.get('content') as string,
    };

    const validatedFields = AiDetectorSchema.safeParse(rawFormData);

    if (!validatedFields.success) {
        return {
            validationErrors: validatedFields.error.flatten().fieldErrors,
            error: "Validation failed. Please check your input.",
        };
    }

    try {
        const result = await detectAiContent(validatedFields.data as AiDetectorInput);
        return { data: result };
    } catch (e: any) {
        console.error("Error during AI detection:", e);
        return { error: e.message || "Failed to analyze content. Please try again." };
    }
}

export async function handlePublishArticle(articleId: string): Promise<ActionResponse<{ success: boolean }>> {
  if (!articleId) {
    return { error: "Article ID is required." };
  }

  try {
    const articleRef = adminDb.collection('articles').doc(articleId);
    const articleDoc = await articleRef.get();

    if (!articleDoc.exists) {
      return { error: "Article not found." };
    }

    const articleData = articleDoc.data();
    
    const webhookUrl = process.env.WP_WEBHOOK_URL;
    const webhookToken = process.env.WP_WEBHOOK_TOKEN;
    
    const isUrlConfigured = webhookUrl && !webhookUrl.includes('your-ngrok-url');
    const isTokenConfigured = webhookToken && !webhookToken.includes('your_secure_token_here');

    if (isUrlConfigured && isTokenConfigured) {
      console.log(`Sending article ${articleId} to WordPress webhook: ${webhookUrl}`);
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ai-token': webhookToken,
        },
        body: JSON.stringify({
          title: articleData?.title,
          content: articleData?.content,
          meta: articleData?.meta,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        const errorMessage = `WordPress webhook failed with status ${response.status}: ${errorBody}`;
        console.error(errorMessage);
        return { error: errorMessage };
      } else {
        console.log(`Successfully pushed article ${articleId} to WordPress.`);
      }
    } else {
        const warningMessage = 'WP_WEBHOOK_URL and/or WP_WEBHOOK_TOKEN are not configured. Skipping actual webhook call and marking as published for testing.';
        console.warn(warningMessage);
    }

    // Update status regardless of webhook for testing purposes, but production might handle this differently.
    await articleRef.update({
        status: 'published',
        publishedAt: FieldValue.serverTimestamp(),
    });

    return { data: { success: true } };

  } catch (e: any) {
    console.error(`Error publishing article ${articleId}:`, e);
    return { error: e.message || "Failed to publish article. Please try again." };
  }
}
