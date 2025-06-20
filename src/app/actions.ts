
'use server';

import { generateSeoArticle, GenerateSeoArticleInput, GenerateSeoArticleOutput } from '@/ai/flows/generate-seo-article';
import { autonomousProspecting, IdealCustomerProfile, AutonomousProspectingOutput } from '@/ai/flows/autonomous-prospecting';
import { discoverTrends, DiscoverTrendsInput, DiscoverTrendsOutput } from '@/ai/flows/discover-trends-flow';
import { z } from 'zod';

const GenerateArticleSchema = z.object({
  trendingTopic: z.string().min(3, "Trending topic must be at least 3 characters long."),
});

const FindProspectsSchema = z.object({
  industry: z.string().min(2, "Industry must be at least 2 characters long."),
  region: z.string().min(2, "Region must be at least 2 characters long."),
  jobTitles: z.string().min(2, "Job titles must be at least 2 characters long."),
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

export async function handleFindProspects(prevState: any, formData: FormData): Promise<ActionResponse<AutonomousProspectingOutput>> {
   const rawFormData = {
    industry: formData.get('industry') as string,
    region: formData.get('region') as string,
    jobTitles: formData.get('jobTitles') as string, // Comma-separated string
  };

  const validatedFields = FindProspectsSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      validationErrors: validatedFields.error.flatten().fieldErrors,
      error: "Validation failed. Please check your input.",
    };
  }
  
  const jobTitlesArray = validatedFields.data.jobTitles.split(',').map(title => title.trim()).filter(title => title.length > 0);

  if (jobTitlesArray.length === 0) {
    return {
      validationErrors: { jobTitles: ["Please provide at least one job title."] },
      error: "Validation failed. Please provide at least one job title.",
    }
  }

  try {
    const icp: IdealCustomerProfile = {
      industry: validatedFields.data.industry,
      region: validatedFields.data.region,
      jobTitles: jobTitlesArray,
    };
    const prospects = await autonomousProspecting(icp);
    return { data: prospects };
  } catch (e: any) {
    console.error("Error finding prospects:", e);
    return { error: e.message || "Failed to find prospects. Please try again." };
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
