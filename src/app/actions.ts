
'use server';

import { generateSeoArticle, GenerateSeoArticleInput, GenerateSeoArticleOutput } from '@/ai/flows/generate-seo-article';
import { discoverTrends, DiscoverTrendsInput, DiscoverTrendsOutput } from '@/ai/flows/discover-trends-flow';
import { generateHumanizedContent, HumanizedContentInputSchema, type HumanizedContentOutput } from '@/ai/flows/humanized-content';
import { z } from 'zod';

const GenerateArticleSchema = z.object({
  trendingTopic: z.string().min(3, "Trending topic must be at least 3 characters long."),
});

const DiscoverTrendsSchema = z.object({
  topic: z.string().optional(),
});

export interface ActionResponse<T> {
  data?: T;
  error?: string;
  validationErrors?: Record<string, string[]>;
}

export async function handleGenerateArticle(prevState: any, formData: FormData): Promise<ActionResponse<GenerateSeoArticleOutput>> {
  const rawFormData = {
    trendingTopic: formData.get('trendingTopic') as string,
  };

  const validatedFields = GenerateArticleSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      validationErrors: validatedFields.error.flatten().fieldErrors,
      error: "Validation failed. Please check your input.",
    };
  }

  try {
    const input: GenerateSeoArticleInput = { trendingTopic: validatedFields.data.trendingTopic };
    const article = await generateSeoArticle(input);
    return { data: article };
  } catch (e: any) {
    console.error("Error generating article:", e);
    return { error: e.message || "Failed to generate article. Please try again." };
  }
}

export async function handleDiscoverTrends(prevState: any, formData: FormData): Promise<ActionResponse<DiscoverTrendsOutput>> {
  const rawFormData = {
    topic: formData.get('topic') as string | undefined,
  };

  const validatedFields = DiscoverTrendsSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      validationErrors: validatedFields.error.flatten().fieldErrors,
      error: "Validation failed. Please check your input.",
    };
  }

  try {
    const input: DiscoverTrendsInput = { topic: validatedFields.data.topic };
    const trends = await discoverTrends(input);
    return { data: trends };
  } catch (e: any) {
    console.error("Error discovering trends:", e);
    return { error: e.message || "Failed to discover trends. Please try again." };
  }
}

export async function handleGenerateHumanizedContent(prevState: any, formData: FormData): Promise<ActionResponse<HumanizedContentOutput>> {
    const rawFormData = {
        topic: formData.get('topic'),
        tone: formData.get('tone'),
        keyword: formData.get('keyword'),
        userInsight: formData.get('userInsight'),
        includeAnecdotes: formData.get('includeAnecdotes') === 'on',
    };

    const validatedFields = HumanizedContentInputSchema.safeParse(rawFormData);

    if (!validatedFields.success) {
        return {
            validationErrors: validatedFields.error.flatten().fieldErrors,
            error: "Validation failed. Please check your input.",
        };
    }

    try {
        const result = await generateHumanizedContent(validatedFields.data);
        return { data: result };
    } catch (e: any) {
        console.error("Error generating humanized content:", e);
        return { error: e.message || "Failed to generate content. Please try again." };
    }
}
