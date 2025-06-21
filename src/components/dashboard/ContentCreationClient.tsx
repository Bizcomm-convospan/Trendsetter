
'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom'; // Ensure import is from react-dom
import { handleGenerateArticle, type ActionResponse } from '@/app/actions';
import type { GenerateSeoArticleOutput } from '@/ai/flows/generate-seo-article';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, Image as ImageIcon, Copy, Check } from 'lucide-react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
      Generate Article
    </Button>
  );
}

export function ContentCreationClient({ initialTopic }: { initialTopic?: string }) {
  const [articleData, setArticleData] = useState<GenerateSeoArticleOutput | null>(null);
  const { toast } = useToast();
  const [topic, setTopic] = useState(initialTopic || '');

  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
      // Clear previous article data when a new topic is selected
      setArticleData(null);
    }
  }, [initialTopic]);


  const initialState: ActionResponse<GenerateSeoArticleOutput> = {};
  const [state, formAction] = useActionState(handleGenerateArticle, initialState);

  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);

  useEffect(() => {
    if (state?.data) {
      setArticleData(state.data);
      toast({
        title: "Article Generated!",
        description: "Your SEO-optimized article is ready.",
      });
    }
    if (state?.error) {
      toast({
        variant: "destructive",
        title: "Error Generating Article",
        description: state.error,
      });
    }
    if (state?.validationErrors) {
       Object.entries(state.validationErrors).forEach(([key, messages]) => {
        if (messages && messages.length > 0) {
          toast({
            variant: "destructive",
            title: `Invalid ${key}`,
            description: messages.join(', '),
          });
        }
      });
    }
  }, [state, toast]);

  const handleCopyToClipboard = (text: string, type: 'prompt' | 'title' | 'content') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'prompt') setCopiedPrompt(true);
      if (type === 'title') setCopiedTitle(true);
      if (type === 'content') setCopiedContent(true);
      setTimeout(() => {
        if (type === 'prompt') setCopiedPrompt(false);
        if (type === 'title') setCopiedTitle(false);
        if (type === 'content') setCopiedContent(false);
      }, 2000);
      toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} copied to clipboard!` });
    }).catch(err => {
      toast({ variant: 'destructive', title: 'Failed to copy', description: err.message });
    });
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Trend-Based Content Generation</CardTitle>
          <CardDescription>
            Enter a trending topic to generate an SEO-optimized article (300-500 words) and a relevant image prompt.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="trendingTopic" className="text-base font-semibold">Trending Topic</Label>
              <Input
                id="trendingTopic"
                name="trendingTopic"
                placeholder="e.g., AI innovations in 2025"
                required
                className="text-base"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              {state?.validationErrors?.trendingTopic && (
                <p className="text-sm text-destructive">{state.validationErrors.trendingTopic.join(', ')}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="simulatedTrends" className="text-base font-semibold">Simulated Trend Sources</Label>
              <Textarea
                id="simulatedTrends"
                name="simulatedTrends"
                readOnly
                rows={5}
                className="bg-muted/50 text-sm"
                value={`Reddit, YouTube, Twitter trends as of Friday, June 20, 2025, 02:08 PM IST will be considered by the AI.`}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {articleData && (
        <Card className="shadow-lg animate-fadeIn">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-2xl font-bold">{articleData.title}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(articleData.title, 'title')}>
                {copiedTitle ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-muted-foreground" />}
                <span className="sr-only">Copy title</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <ImageIcon className="mr-2 h-5 w-5 text-primary" />
                Featured Image Prompt
              </h3>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                <p className="text-sm text-foreground flex-grow">{articleData.featuredImagePrompt}</p>
                <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(articleData.featuredImagePrompt, 'prompt')}>
                  {copiedPrompt ? <Check className="mr-1 h-4 w-4 text-green-500" /> : <Copy className="mr-1 h-4 w-4" />}
                  Copy
                </Button>
              </div>
              <Image
                src={`https://placehold.co/600x400.png`}
                alt="Placeholder for generated image"
                width={600}
                height={400}
                className="mt-4 rounded-md shadow-md object-cover aspect-video"
                data-ai-hint="article technology"
              />
               <p className="text-xs text-muted-foreground mt-1">Placeholder image. Use the prompt to generate an actual image.</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">
                  <FileText className="inline-block mr-2 h-5 w-5 text-primary" />
                  Article Content
                </h3>
                <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(articleData.content, 'content')}>
                  {copiedContent ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-muted-foreground" />}
                  <span className="sr-only">Copy content</span>
                </Button>
              </div>
              <article className="prose prose-sm dark:prose-invert max-w-none p-4 border rounded-md bg-background">
                <ReactMarkdown>{articleData.content}</ReactMarkdown>
              </article>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button
              className="w-full sm:w-auto bg-accent hover:bg-accent/90"
              onClick={() => toast({ title: "WordPress Publishing", description: "This is a placeholder. Integration with WordPress would happen here." })}
            >
              Publish to WordPress (Mock)
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
