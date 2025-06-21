
'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { handleGenerateArticle, handleGenerateHumanizedContent, type ActionResponse } from '@/app/actions';
import type { GenerateSeoArticleOutput } from '@/ai/flows/generate-seo-article';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, Image as ImageIcon, Copy, Check, Plug, CheckCircle2, UploadCloud, Wand2, Sparkles } from 'lucide-react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
      Generate Article
    </Button>
  );
}

function HumanizerSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="bg-accent hover:bg-accent/90">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
      Generate Humanized Version
    </Button>
  );
}

export function ContentCreationClient({ initialTopic }: { initialTopic?: string }) {
  const [articleData, setArticleData] = useState<GenerateSeoArticleOutput | null>(null);
  const [humanizedContent, setHumanizedContent] = useState<string | null>(null);
  const [showHumanizerForm, setShowHumanizerForm] = useState(false);

  const { toast } = useToast();
  const [topic, setTopic] = useState(initialTopic || '');

  // Effect for initial topic passed from another component
  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
      setArticleData(null);
      setHumanizedContent(null);
      setShowHumanizerForm(false);
    }
  }, [initialTopic]);

  // Action state for article generation
  const articleInitialState: ActionResponse<GenerateSeoArticleOutput> = {};
  const [articleState, articleFormAction] = useActionState(handleGenerateArticle, articleInitialState);

  // Action state for article humanization
  const humanizerInitialState: ActionResponse<string> = {};
  const [humanizerState, humanizerFormAction] = useActionState(handleGenerateHumanizedContent, humanizerInitialState);

  const [copiedStates, setCopiedStates] = useState({
    prompt: false,
    title: false,
    originalContent: false,
    humanizedContent: false
  });
  
  // Effect for article generation results
  useEffect(() => {
    if (articleState?.data) {
      setArticleData(articleState.data);
      setHumanizedContent(null); // Reset humanized content
      setShowHumanizerForm(false); // Hide form on new article
      toast({
        title: "Article Generated!",
        description: "Your SEO-optimized article is ready.",
      });
    }
    if (articleState?.error) {
      toast({ variant: "destructive", title: "Error Generating Article", description: articleState.error });
    }
  }, [articleState, toast]);

  // Effect for humanizer results
  useEffect(() => {
    if (humanizerState?.data) {
      setHumanizedContent(humanizerState.data);
      toast({ title: "Content Humanized!", description: "Your article has been rewritten." });
    }
    if (humanizerState?.error) {
      toast({ variant: "destructive", title: "Error Humanizing Content", description: humanizerState.error });
    }
  }, [humanizerState, toast]);

  const handleCopyToClipboard = (text: string, type: keyof typeof copiedStates) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStates(prev => ({ ...prev, [type]: true }));
      setTimeout(() => setCopiedStates(prev => ({ ...prev, [type]: false })), 2000);
      toast({ title: `Copied ${type} to clipboard!` });
    }).catch(err => {
      toast({ variant: 'destructive', title: 'Failed to copy', description: err.message });
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-8">
        {/* Article Generation Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Trend-Based Content Generation</CardTitle>
            <CardDescription>
              Enter a trending topic to generate an SEO-optimized article (300-500 words) and a relevant image prompt.
            </CardDescription>
          </CardHeader>
          <form action={articleFormAction}>
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
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <SubmitButton />
            </CardFooter>
          </form>
        </Card>

        {/* Generated Article Card */}
        {articleData && (
          <Card className="shadow-lg animate-fadeIn">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl font-bold">{articleData.title}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(articleData.title, 'title')}>
                  {copiedStates.title ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-muted-foreground" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Prompt */}
              <div>
                 <h3 className="text-lg font-semibold mb-2 flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-primary" />Featured Image Prompt</h3>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                  <p className="text-sm text-foreground flex-grow">{articleData.featuredImagePrompt}</p>
                  <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(articleData.featuredImagePrompt, 'prompt')}>
                    {copiedStates.prompt ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />} Copy
                  </Button>
                </div>
              </div>
              {/* Original Content */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold"><FileText className="inline-block mr-2 h-5 w-5 text-primary" />Article Content</h3>
                  <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(articleData.content, 'originalContent')}>
                    {copiedStates.originalContent ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-muted-foreground" />}
                  </Button>
                </div>
                <article className="prose prose-sm dark:prose-invert max-w-none p-4 border rounded-md bg-background">
                  <ReactMarkdown>{articleData.content}</ReactMarkdown>
                </article>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6 flex-col items-start gap-4">
               <Button onClick={() => setShowHumanizerForm(p => !p)} variant="outline">
                <Wand2 className="mr-2 h-4 w-4" />
                {showHumanizerForm ? 'Hide Humanizer' : 'Humanize this Article'}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Humanizer Form Card */}
        {articleData && showHumanizerForm && (
          <Card className="shadow-lg animate-fadeIn">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center"><Sparkles className="mr-2 h-6 w-6 text-accent" /> Article Humanizer</CardTitle>
              <CardDescription>Refine the generated article to have a more natural, human-like tone.</CardDescription>
            </CardHeader>
            <form action={humanizerFormAction}>
              <CardContent className="space-y-6">
                <input type="hidden" name="contentToHumanize" value={articleData.content} />
                <div className="space-y-3">
                  <Label className="font-semibold">Tone</Label>
                  <RadioGroup name="tone" defaultValue="mixed" className="flex flex-wrap gap-x-6 gap-y-2">
                    {['formal', 'casual', 'storytelling', 'mixed'].map(toneValue => (
                      <div key={toneValue} className="flex items-center space-x-2">
                        <RadioGroupItem value={toneValue} id={`tone-${toneValue}`} />
                        <Label htmlFor={`tone-${toneValue}`} className="font-normal capitalize">{toneValue}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="keyword">Keyword (Optional)</Label>
                        <Input id="keyword" name="keyword" placeholder="e.g., solar power" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="userInsight">Specific Insight (Optional)</Label>
                        <Input id="userInsight" name="userInsight" placeholder="e.g., Mention the impact on developing nations" />
                    </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <HumanizerSubmitButton />
              </CardFooter>
            </form>
          </Card>
        )}
        
        {/* Humanized Content Card */}
        {humanizedContent && (
           <Card className="shadow-lg animate-fadeIn">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl font-bold">Humanized Version</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(humanizedContent, 'humanizedContent')}>
                    {copiedStates.humanizedContent ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-muted-foreground" />}
                  </Button>
              </div>
              <CardDescription>This is the rewritten version of the article with a more human touch.</CardDescription>
            </CardHeader>
            <CardContent>
               <article className="prose prose-sm dark:prose-invert max-w-none p-4 border rounded-md bg-muted/50">
                  <ReactMarkdown>{humanizedContent}</ReactMarkdown>
                </article>
            </CardContent>
             <CardFooter className="border-t pt-6">
              <Button
                className="w-full sm:w-auto"
                onClick={() => toast({ title: "WordPress Publishing", description: "Publishing the HUMANIZED version. This is a placeholder." })}
              >
                Publish Humanized Version to WordPress (Mock)
              </Button>
            </CardFooter>
          </Card>
        )}

      </div>

      {/* WordPress Plugin Card (Sidebar) */}
      <div className="lg:col-span-1 space-y-8 sticky top-6">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 bg-muted rounded-md p-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-foreground">
                    <path d="M4.53,12.37a8.38,8.38,0,0,1,8.3-8.35,8.25,8.25,0,0,1,5.43,2L14.8,9.55a4.33,4.33,0,0,0-3-1.42,4.48,4.48,0,0,0-4.6,4.6,4.44,4.44,0,0,0,4.55,4.6,4,4,0,0,0,3.15-1.5l3.43,3.45a8.3,8.3,0,0,1-6.55,3A8.39,8.39,0,0,1,4.53,12.37Z" fill="currentColor"></path><path d="M12.83,12.43a.53.53,0,0,0,.53-.53V4.08a.54.54,0,0,0-.53-.53H4.63a.53.53,0,0,0-.53.53v8.2a.54.54,0,0,0,.53.53Z" fill="currentColor" fillOpacity="0.3"></path><path d="M12.83,12.43a.53.53,0,0,1-.53.53H4.63a.54.54,0,0,1-.53-.54V4.08a.53.53,0,0,1,.53-.53h8.2a.54.54,0,0,1,.53.53Z" fill="currentColor" fillOpacity="0.3"></path>
                </svg>
              </div>
              <CardTitle>WordPress Plugin</CardTitle>
            </div>
            <CardDescription>Publish generated content directly to your WordPress site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Plug className="h-4 w-4" />
                    <span>Connection Status</span>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-500 bg-green-50">
                    <CheckCircle2 className="mr-1 h-3 w-3"/>
                    Connected
                </Badge>
            </div>
            <Separator />
             <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <UploadCloud className="h-4 w-4" />
                    <span>Published Articles</span>
                </div>
                {/* Mock data */}
                <span className="font-semibold text-foreground">14</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => toast({ title: "Manage Connection", description: "This is a placeholder for managing your WordPress connection." })}>
                Manage Connection (Mock)
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
