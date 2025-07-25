
'use server';

import {
  generateSeoArticle,
  GenerateSeoArticleInput,
  GenerateSeoArticleOutput,
} from '@/ai/flows/generate-seo-article';
import {
  discoverTrends,
  DiscoverTrendsInput,
  DiscoverTrendsOutput,
} from '@/ai/flows/discover-trends-flow';
import {
  generateHumanizedContent,
  type HumanizedContentInput,
} from '@/ai/flows/humanized-content';
import {
  detectAiContent,
  type AiDetectorInput,
  type AiDetectorOutput,
} from '@/ai/flows/ai-detector-flow';
import {
  answerTheAI,
  AnswerTheAIInput,
  AnswerTheAIOutput,
} from '@/ai/flows/answer-the-ai-flow';
import { questionSpy, QuestionSpyOutput } from '@/ai/flows/question-spy-flow';
import {
  generateImage,
  GenerateImageOutput
} from '@/ai/flows/generate-image-flow';
import {
  generateVideo,
  GenerateVideoOutput,
} from '@/ai/flows/generate-video-flow';
import {
  generateKeywordStrategy,
  KeywordStrategyInput,
  KeywordStrategyOutput,
} from '@/ai/flows/keyword-strategy-flow';
import {
  generateEmailOutreach,
  EmailOutreachInput,
  EmailOutreachOutput,
} from '@/ai/flows/email-outreach-flow';
import {
  analyzeContentPerformance,
  AnalyzePerformanceInput,
  AnalyzePerformanceOutput,
} from '@/ai/flows/analyze-performance-flow';
import {
    analyzeContentForSeo,
    ContentOptimizerInput,
    ContentOptimizerOutput,
} from '@/ai/flows/content-optimizer-flow';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { createHash } from 'crypto';
import { addHours, isFuture } from 'date-fns';
import { CompetitorAnalyzerOutput } from '@/ai/flows/competitor-analyzer-flow';

// Helper for caching
const CACHE_COLLECTION = 'ai_cache';
const CACHE_DURATION_HOURS = 24;

function getCacheKey(flowName: string, input: any): string {
  const inputString = JSON.stringify(input);
  return createHash('sha256').update(flowName + inputString).digest('hex');
}

const GenerateArticleSchema = z.object({
  topic: z
    .string()
    .min(3, 'Topic or keyword must be at least 3 characters long.'),
  language: z.string().optional(),
  template: z.enum(['standard', 'listicle', 'how-to']).default('standard'),
  tone: z.enum(['professional', 'casual', 'witty', 'authoritative']).default('professional'),
});

const DiscoverTrendsSchema = z.object({
  topic: z.string().optional(),
  geography: z.string().optional(),
  language: z.string().optional(),
  category: z.string().optional(),
});

const HumanizeArticleSchema = z.object({
  contentToHumanize: z
    .string()
    .min(20, 'Content to humanize must be at least 20 characters long.'),
  tone: z.enum(['formal', 'casual', 'storytelling', 'mixed']).default('mixed'),
  keyword: z.string().optional(),
  userInsight: z.string().optional(),
});

const AiDetectorSchema = z.object({
  content: z
    .string()
    .min(50, 'Content must be at least 50 characters to analyze effectively.'),
});

const ContentOptimizerSchema = z.object({
  content: z.string().min(100, 'Content must be at least 100 characters for a meaningful analysis.'),
  keyword: z.string().min(2, 'Please provide a target keyword.'),
  language: z.string().optional(),
});

// Using a raw string because parsing server-side can be tricky with complex objects.
// Client will JSON.stringify
const AnswerTheAITrendsSchema = z.string().min(10, 'Trend data is required.');

const AnswerTheAITextSchema = z.object({
  text: z.string().min(10, 'Please provide some text to generate angles from.'),
});

const QuestionSpySchema = z.object({
  topic: z.string().min(2, 'Topic must be at least 2 characters long.'),
});

const CompetitorAnalyzerSchema = z.object({
  url: z.string().url('Please provide a valid URL.'),
});

const KeywordStrategySchema = z.object({
    topic: z.string().min(3, 'Topic must be at least 3 characters long.'),
});

const AnalyzePerformanceSchema = z.object({
    articleTitle: z.string(),
    articleTopic: z.string(),
    performanceData: z.object({
        views: z.number(),
        ctr: z.number(),
        engagementRate: z.number(),
    }),
});

const EmailOutreachSchema = z.object({
    recipientProfile: z.string().min(10, 'Recipient profile must be at least 10 characters long.'),
    goal: z.string().min(10, 'Goal must be at least 10 characters long.'),
    productInfo: z.string().min(20, 'Product info must be at least 20 characters long.'),
    tone: z.enum(['formal', 'casual', 'enthusiastic', 'direct']).default('casual'),
});

const WebhookUrlSchema = z.object({
    webhookUrl: z.string().url('Please enter a valid Zapier webhook URL.')
});

export interface ActionResponse<T> {
  data?: T;
  error?: string;
  validationErrors?: Record<string, string[]>;
}

export async function handleGenerateArticle(
  formData: FormData
): Promise<ActionResponse<GenerateSeoArticleOutput>> {
  const rawFormData = {
    topic: formData.get('topic') as string,
    language: (formData.get('language') as string) || undefined,
    template: formData.get('template') as 'standard' | 'listicle' | 'how-to',
    tone: formData.get('tone') as 'professional' | 'casual' | 'witty' | 'authoritative',
  };

  const validatedFields = GenerateArticleSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      validationErrors: validatedFields.error.flatten().fieldErrors,
      error: 'Validation failed. Please check your input.',
    };
  }

  try {
    const article = await generateSeoArticle(validatedFields.data);
    return { data: article };
  } catch (e: any) {
    console.error('Error generating article:', e);
    return {
      error: e.message || 'Failed to generate article. Please try again.',
    };
  }
}

export async function handleDiscoverTrends(
  formData: FormData
): Promise<ActionResponse<DiscoverTrendsOutput>> {
  const rawFormData: {
    topic?: string;
    geography?: string;
    language?: string;
    category?: string;
  } = {
    topic: (formData.get('topic') as string) || undefined,
    geography: (formData.get('geography') as string) || undefined,
    language: (formData.get('language') as string) || undefined,
    category: (formData.get('category') as string) || undefined,
  };

  // Don't pass 'all' to the AI flow, as it's the default behavior
  if (rawFormData.category === 'all') {
    rawFormData.category = undefined;
  }

  const validatedFields = DiscoverTrendsSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      validationErrors: validatedFields.error.flatten().fieldErrors,
      error: 'Validation failed. Please check your input.',
    };
  }

  try {
    const input: DiscoverTrendsInput = validatedFields.data;
    const trends = await discoverTrends(input);
    return { data: trends };
  } catch (e: any) {
    console.error('Error discovering trends:', e);
    return { error: e.message || 'Failed to discover trends. Please try again.' };
  }
}

export async function handleGenerateHumanizedContent(
  formData: FormData
): Promise<ActionResponse<string>> {
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
      error: 'Validation failed. Please check your input.',
    };
  }

  try {
    const result = await generateHumanizedContent(
      validatedFields.data as HumanizedContentInput
    );
    return { data: result };
  } catch (e: any) {
    console.error('Error generating humanized content:', e);
    return { error: e.message || 'Failed to generate content. Please try again.' };
  }
}

export async function handleAiDetection(
  formData: FormData
): Promise<ActionResponse<AiDetectorOutput>> {
  const rawFormData = {
    content: formData.get('content') as string,
  };

  const validatedFields = AiDetectorSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      validationErrors: validatedFields.error.flatten().fieldErrors,
      error: 'Validation failed. Please check your input.',
    };
  }

  try {
    const result = await detectAiContent(validatedFields.data as AiDetectorInput);
    return { data: result };
  } catch (e: any) {
    console.error('Error during AI detection:', e);
    return { error: e.message || 'Failed to analyze content. Please try again.' };
  }
}

export async function handlePublishArticle(
  articleId: string
): Promise<ActionResponse<{ success: boolean }>> {
  if (!articleId) {
    return { error: 'Article ID is required.' };
  }

  try {
    const articleRef = adminDb.collection('articles').doc(articleId);
    
    // The responsibility of this function is now just to update the status.
    // A separate Firebase Function will be triggered by this update to handle
    // the webhook call to Zapier or any other service.
    await articleRef.update({
      status: 'published',
      publishedAt: FieldValue.serverTimestamp(),
    });

    console.log(`Article ${articleId} status updated to 'published'. Triggering downstream automations.`);

    return { data: { success: true } };
  } catch (e: any) {
    console.error(`Error publishing article ${articleId}:`, e);
    return { error: e.message || 'Failed to publish article. Please try again.' };
  }
}

export async function handleAnswerTheAI(
  trendsJson: string
): Promise<ActionResponse<AnswerTheAIOutput>> {
  const validatedField = AnswerTheAITrendsSchema.safeParse(trendsJson);

  if (!validatedField.success) {
    return {
      validationErrors: validatedField.error.flatten().fieldErrors,
      error: 'Validation failed: Invalid trends data.',
    };
  }

  try {
    const trends: AnswerTheAIInput = JSON.parse(validatedField.data);
    const result = await answerTheAI(trends);
    return { data: result };
  } catch (e: any) {
    console.error('Error in Answer the AI:', e);
    return {
      error: e.message || 'Failed to generate content angles. Please try again.',
    };
  }
}

export async function handleAnswerTheAIFromText(
  formData: FormData
): Promise<ActionResponse<AnswerTheAIOutput>> {
  const rawFormData = {
    text: formData.get('text') as string,
  };

  const validatedFields = AnswerTheAITextSchema.safeParse(rawFormData);
  if (!validatedFields.success) {
    return {
      validationErrors: validatedFields.error.flatten().fieldErrors,
      error: 'Validation failed: Invalid text input.',
    };
  }

  try {
    // Convert the raw text into a format the answerTheAI flow can understand.
    const trends: AnswerTheAIInput = [
      {
        title: 'Custom User Topic',
        description: validatedFields.data.text,
        keywords: [],
      },
    ];
    const result = await answerTheAI(trends);
    return { data: result };
  } catch (e: any) {
    console.error('Error in Answer the AI from text:', e);
    return {
      error: e.message || 'Failed to generate content angles. Please try again.',
    };
  }
}

export async function handleQuestionSpy(
  formData: FormData
): Promise<ActionResponse<QuestionSpyOutput>> {
  const rawFormData = {
    topic: formData.get('topic') as string,
  };

  const validatedFields = QuestionSpySchema.safeParse(rawFormData);
  if (!validatedFields.success) {
    return {
      validationErrors: validatedFields.error.flatten().fieldErrors,
      error: 'Validation failed.',
    };
  }

  const flowName = 'questionSpyFlow';
  const cacheKey = getCacheKey(flowName, validatedFields.data);
  const cacheRef = adminDb.collection(CACHE_COLLECTION).doc(cacheKey);

  try {
    const cachedDoc = await cacheRef.get();
    if (cachedDoc.exists) {
      const data = cachedDoc.data();
      if (data && data.expiresAt && isFuture(data.expiresAt.toDate())) {
        console.log(`[Cache Hit] Returning cached result for ${flowName}`);
        return { data: data.output as QuestionSpyOutput };
      }
    }
    console.log(`[Cache Miss] Calling flow ${flowName}`);

    const result = await questionSpy(validatedFields.data);

    const expiresAt = addHours(new Date(), CACHE_DURATION_HOURS);
    await cacheRef.set({
      flowName,
      input: validatedFields.data,
      output: result,
      createdAt: new Date(),
      expiresAt,
    });

    return { data: result };
  } catch (e: any) {
    console.error('Error in Question Spy:', e);
    return { error: e.message || 'Failed to find questions.' };
  }
}

export async function handleCompetitorAnalysis(
  formData: FormData
): Promise<ActionResponse<CompetitorAnalyzerOutput>> {
  const rawFormData = {
    url: formData.get('url') as string,
  };

  const validatedFields = CompetitorAnalyzerSchema.safeParse(rawFormData);
  if (!validatedFields.success) {
    return {
      validationErrors: validatedFields.error.flatten().fieldErrors,
      error: 'Validation failed.',
    };
  }

  try {
    // This server action now calls our own API route for analysis,
    // which in turn calls the deployed Firebase Function.
    const rootUrl = process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : 'http://localhost:3000';
    
    const apiRoute = new URL('/api/analyze', rootUrl);

    const response = await fetch(apiRoute.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: validatedFields.data.url }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to run competitor analysis.');
    }

    return { data: data };
  } catch (e: any) {
    console.error('Error in Competitor Analyzer action:', e);
    return { error: `Error from analysis service: ${e.message}` };
  }
}

export async function handleGenerateImage(
  articleId: string,
  prompt: string
): Promise<ActionResponse<GenerateImageOutput>> {
  if (!articleId || !prompt) {
    return { error: 'Article ID and prompt are required.' };
  }

  try {
    const result = await generateImage({ prompt });

    if (result.imageUrl) {
      const articleRef = adminDb.collection('articles').doc(articleId);
      await articleRef.update({
        featuredImageUrl: result.imageUrl,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return { data: result };
  } catch (e: any) {
    console.error(`Error generating image for article ${articleId}:`, e);
    return { error: e.message || 'Failed to generate image.' };
  }
}

export async function handleGenerateVideo(
  articleId: string,
  prompt: string
): Promise<ActionResponse<GenerateVideoOutput>> {
  if (!articleId || !prompt) {
    return { error: 'Article ID and prompt are required.' };
  }

  try {
    const result = await generateVideo({ prompt });

    if (result.videoUrl) {
      const articleRef = adminDb.collection('articles').doc(articleId);
      await articleRef.update({
        videoUrl: result.videoUrl,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return { data: result };
  } catch (e: any) {
    console.error(`Error generating video for article ${articleId}:`, e);
    return { error: e.message || 'Failed to generate video.' };
  }
}

export async function handleKeywordStrategy(
  formData: FormData
): Promise<ActionResponse<KeywordStrategyOutput>> {
  const rawFormData = {
    topic: formData.get('topic') as string,
  };

  const validatedFields = KeywordStrategySchema.safeParse(rawFormData);
  if (!validatedFields.success) {
    return {
      validationErrors: validatedFields.error.flatten().fieldErrors,
      error: 'Validation failed.',
    };
  }

  try {
    const result = await generateKeywordStrategy(validatedFields.data);
    return { data: result };
  } catch (e: any) {
    console.error('Error in Keyword Strategy:', e);
    return { error: e.message || 'Failed to generate keyword strategy.' };
  }
}

export async function handleEmailOutreach(
    formData: FormData
): Promise<ActionResponse<EmailOutreachOutput>> {
    const rawFormData = {
        recipientProfile: formData.get('recipientProfile'),
        goal: formData.get('goal'),
        productInfo: formData.get('productInfo'),
        tone: formData.get('tone'),
    };

    const validatedFields = EmailOutreachSchema.safeParse(rawFormData);
    if (!validatedFields.success) {
        return {
            validationErrors: validatedFields.error.flatten().fieldErrors,
            error: 'Validation failed.',
        };
    }

    try {
        const result = await generateEmailOutreach(validatedFields.data as EmailOutreachInput);
        return { data: result };
    } catch (e: any) {
        console.error('Error generating email outreach sequence:', e);
        return { error: e.message || 'Failed to generate email outreach sequence.' };
    }
}


export async function handleAnalyzePerformance(
  input: AnalyzePerformanceInput
): Promise<ActionResponse<AnalyzePerformanceOutput>> {
  const validatedFields = AnalyzePerformanceSchema.safeParse(input);
  if (!validatedFields.success) {
    return {
      validationErrors: validatedFields.error.flatten().fieldErrors,
      error: 'Validation failed.',
    };
  }

  try {
    const result = await analyzeContentPerformance(validatedFields.data);
    return { data: result };
  } catch (e: any) {
    console.error('Error analyzing content performance:', e);
    return { error: e.message || 'Failed to analyze performance.' };
  }
}

export async function handleAnalyzeContentForSeo(
    formData: FormData
): Promise<ActionResponse<ContentOptimizerOutput>> {
    const rawFormData = {
        content: formData.get('content'),
        keyword: formData.get('keyword'),
        language: formData.get('language'),
    };

    const validatedFields = ContentOptimizerSchema.safeParse(rawFormData);
    if (!validatedFields.success) {
        return {
            validationErrors: validatedFields.error.flatten().fieldErrors,
            error: 'Validation failed.',
        };
    }

    try {
        const result = await analyzeContentForSeo(validatedFields.data as ContentOptimizerInput);
        return { data: result };
    } catch (e: any) {
        console.error('Error analyzing content for SEO:', e);
        return { error: e.message || 'Failed to analyze content.' };
    }
}

export async function handleSaveWebhookUrl(
  formData: FormData
): Promise<ActionResponse<{ success: boolean }>> {
  const rawFormData = {
    webhookUrl: formData.get('webhookUrl') as string,
  };

  const validatedFields = WebhookUrlSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      validationErrors: validatedFields.error.flatten().fieldErrors,
      error: 'Validation failed. Please provide a valid URL.',
    };
  }

  try {
    // In a real multi-user app, you'd associate this with the current user ID.
    // For this demo, we'll store it in a predictable document.
    const settingsRef = adminDb.collection('settings').doc('integrations');
    await settingsRef.set({
      zapierWebhookUrl: validatedFields.data.webhookUrl,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return { data: { success: true } };
  } catch (e: any) {
    console.error('Error saving webhook URL:', e);
    return { error: e.message || 'Failed to save webhook URL.' };
  }
}

export async function handleUpdateArticleContent(
  articleId: string,
  newContent: string
): Promise<ActionResponse<{ success: boolean }>> {
  if (!articleId || !newContent) {
    return { error: 'Article ID and new content are required.' };
  }

  try {
    const articleRef = adminDb.collection('articles').doc(articleId);
    await articleRef.update({
      content: newContent,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { data: { success: true } };
  } catch (e: any) {
    console.error(`Error updating article ${articleId}:`, e);
    return { error: e.message || 'Failed to update article content.' };
  }
}
