
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { handleGenerateArticle, handlePublishArticle, handleGenerateHeadlines, handleGenerateImage, handleGenerateVideo, handleSocialMedia, type ActionResponse } from '@/app/actions';
import type { GenerateSeoArticleOutput } from '@/ai/flows/generate-seo-article';
import type { GenerateHeadlinesOutput } from '@/ai/flows/generate-headlines-flow';
import type { SocialMediaOutput } from '@/ai/flows/social-media-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, Wand2, UploadCloud, Send, FileCheck2, Globe, CheckCircle, Lightbulb, Image as ImageIcon, MessageSquare, Twitter, Linkedin, Facebook, AlertTriangle, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendDiscoveryClient } from './TrendDiscoveryClient';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Article extends GenerateSeoArticleOutput {
  id: string;
  status: 'draft' | 'published';
  createdAt: Timestamp;
  publishedAt?: Timestamp;
  topic: string;
  featuredImageUrl?: string;
  videoUrl?: string;
  isGeneratingVideo?: boolean;
}

function GenerateArticleButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
      Generate Article
    </Button>
  );
}

function ArticleRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-3/4" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-10 w-48" /></TableCell>
    </TableRow>
  );
}

function SocialMediaDialog({ article, open, onOpenChange }: { article: Article | null, open: boolean, onOpenChange: (open: boolean) => void }) {
    const [isGenerating, startGenerating] = useTransition();
    const [result, setResult] = useState<ActionResponse<SocialMediaOutput>>({});
    const { toast } = useToast();

    useEffect(() => {
        if (open && article) {
            setResult({}); // Clear previous results when opening
            // If social media posts are already generated, use them.
            if (article.socialMediaPosts) {
                setResult({ data: article.socialMediaPosts });
                return;
            }
            // Otherwise, generate them on-demand.
            startGenerating(async () => {
                const formData = new FormData();
                formData.append('articleTitle', article.title);
                formData.append('articleContent', article.content);
                const response = await handleSocialMedia(formData);
                setResult(response);
                if (response.error) {
                    toast({ variant: "destructive", title: "Error", description: response.error });
                }
            });
        }
    }, [open, article, toast]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Social Media Content</DialogTitle>
                    <DialogDescription>
                        {isGenerating ? "AI is crafting social media posts for your article..." : `Showing social media posts for: "${article?.title}"`}
                    </DialogDescription>
                </DialogHeader>
                {isGenerating && (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
                {result.data && (
                    <Tabs defaultValue="twitter" className="w-full pt-4">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="twitter"><Twitter className="mr-2 h-4 w-4" />Twitter</TabsTrigger>
                            <TabsTrigger value="linkedin"><Linkedin className="mr-2 h-4 w-4" />LinkedIn</TabsTrigger>
                            <TabsTrigger value="facebook"><Facebook className="mr-2 h-4 w-4" />Facebook</TabsTrigger>
                        </TabsList>
                        <TabsContent value="twitter" className="mt-4">
                            <div className="space-y-3">
                                {result.data.twitterThread.map((tweet, index) => (
                                    <Textarea key={index} value={tweet} readOnly className="bg-muted/50" rows={4} />
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="linkedin" className="mt-4">
                            <Textarea value={result.data.linkedInPost} readOnly className="bg-muted/50" rows={8} />
                        </TabsContent>
                        <TabsContent value="facebook" className="mt-4">
                           <Textarea value={result.data.facebookPost} readOnly className="bg-muted/50" rows={8} />
                        </TabsContent>
                    </Tabs>
                )}
            </DialogContent>
        </Dialog>
    )
}

function WordpressIntegrationStatus() {
    const isUrlConfigured = process.env.NEXT_PUBLIC_WP_WEBHOOK_URL && !process.env.NEXT_PUBLIC_WP_WEBHOOK_URL.includes('your-ngrok-url');
    const isTokenConfigured = process.env.NEXT_PUBLIC_WP_WEBHOOK_TOKEN && !process.env.NEXT_PUBLIC_WP_WEBHOOK_TOKEN.includes('your_secure_token_here');
    const isConfigured = isUrlConfigured && isTokenConfigured;
    
    const StatusIcon = isConfigured ? CheckCircle : AlertTriangle;
    const statusColor = isConfigured ? 'text-green-500' : 'text-amber-500';

    return (
         <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="text-primary"/>
                WordPress Integration Status
              </CardTitle>
              <CardDescription>
                This module manages publishing content to your WordPress site. Status is based on your environment configuration.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-4 rounded-lg border p-4">
                <StatusIcon className={`h-6 w-6 ${statusColor} mt-1 flex-shrink-0`} />
                <div>
                  <h3 className="font-semibold">Webhook URL</h3>
                  <p className="text-sm text-muted-foreground">
                    {isUrlConfigured 
                        ? "The application is ready to send data to your configured webhook URL." 
                        : "The WP_WEBHOOK_URL is not configured in your .env file."
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-lg border p-4">
                <StatusIcon className={`h-6 w-6 ${statusColor} mt-1 flex-shrink-0`} />
                <div>
                  <h3 className="font-semibold">Authentication Token</h3>
                   <p className="text-sm text-muted-foreground">
                    {isTokenConfigured 
                        ? "A security token is correctly configured to be sent with each request."
                        : "The WP_WEBHOOK_TOKEN is not configured in your .env file."
                    }
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">
                    If publishing fails, ensure the URL is correct (e.g., using a valid ngrok link for local testing) and the token matches your WordPress plugin's settings.
                </p>
            </CardFooter>
          </Card>
    )
}

export function ContentCreationClient({ initialTopic }: { initialTopic?: string }) {
  const { toast } = useToast();
  const router = useRouter();

  const [topic, setTopic] = useState(initialTopic || '');
  const [generateState, setGenerateState] = useState<ActionResponse<GenerateSeoArticleOutput>>({});
  
  const [draftArticles, setDraftArticles] = useState<Article[]>([]);
  const [publishedArticles, setPublishedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State to track the ID of an article during a specific action
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // State for Headline Optimizer
  const [isGeneratingHeadlines, startGeneratingHeadlines] = useTransition();
  const [headlineResults, setHeadlineResults] = useState<GenerateHeadlinesOutput | null>(null);
  const [selectedArticleForHeadlines, setSelectedArticleForHeadlines] = useState<Article | null>(null);
  const [isHeadlineDialogOpen, setIsHeadlineDialogOpen] = useState(false);
  
  // State for Social Media
  const [selectedArticleForSocial, setSelectedArticleForSocial] = useState<Article | null>(null);
  const [isSocialDialogOpen, setIsSocialDialogOpen] = useState(false);

  // Effect for initial topic passed from another component
  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
    }
  }, [initialTopic]);

  // Firestore listeners for articles
  useEffect(() => {
    setIsLoading(true);
    const articlesRef = collection(db, 'articles');
    
    const draftsQuery = query(articlesRef, where('status', '==', 'draft'), orderBy('createdAt', 'desc'));
    const publishedQuery = query(articlesRef, where('status', '==', 'published'), orderBy('publishedAt', 'desc'));

    const unsubscribeDrafts = onSnapshot(draftsQuery, (snapshot) => {
      const drafts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
      setDraftArticles(drafts);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching drafts:", err);
      toast({ variant: "destructive", title: "Could not load drafts." });
      setIsLoading(false);
    });

    const unsubscribePublished = onSnapshot(publishedQuery, (snapshot) => {
      const published = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
      setPublishedArticles(published);
    }, (err) => {
      console.error("Error fetching published articles:", err);
      toast({ variant: "destructive", title: "Could not load published articles." });
    });

    return () => {
      unsubscribeDrafts();
      unsubscribePublished();
    };
  }, [toast]);

  // Action for generating a new article
  const generateArticleAction = (formData: FormData) => {
    startTransition(async () => {
      const response = await handleGenerateArticle(formData);
      setGenerateState(response);
    });
  };

  useEffect(() => {
    if (generateState?.data) {
      toast({
        title: "Article Generated!",
        description: `"${generateState.data.title}" is now available as a draft.`,
      });
      setTopic(''); // Clear input after success
    }
    if (generateState?.error) {
      toast({ variant: "destructive", title: "Error Generating Article", description: generateState.error });
    }
  }, [generateState, toast]);
  
  const handlePublish = async (articleId: string) => {
    setActiveActionId(articleId);
    const result = await handlePublishArticle(articleId);
    if (result.error) {
      toast({ variant: 'destructive', title: 'Publishing Failed', description: result.error });
    } else {
      toast({ title: 'Article Published!', description: 'Your article has been sent to WordPress.' });
    }
    setActiveActionId(null);
  };
  
  const onGenerateImage = async (article: Article) => {
    setActiveActionId(article.id);
    const result = await handleGenerateImage(article.id, article.featuredImagePrompt);
    if (result.error) {
      toast({ variant: 'destructive', title: 'Image Generation Failed', description: result.error });
    } else {
      toast({ title: 'Image Generated!', description: 'A new featured image has been created for your article.' });
    }
    setActiveActionId(null);
  };
  
  const onGenerateVideo = async (article: Article) => {
    setActiveActionId(article.id);
    setDraftArticles(prev => prev.map(a => a.id === article.id ? { ...a, isGeneratingVideo: true } : a));
    const result = await handleGenerateVideo(article.id, article.title); // Use title as prompt
    if (result.error) {
        toast({ variant: 'destructive', title: 'Video Generation Failed', description: result.error });
    } else {
        toast({ title: 'Video Generated!', description: 'A video has been created for your article.' });
    }
    // This state update is handled by the onSnapshot listener, but we can do it here for immediate UI feedback.
    setDraftArticles(prev => prev.map(a => a.id === article.id ? { ...a, isGeneratingVideo: false } : a));
    setActiveActionId(null);
  };

  const handleHumanizeClick = (content: string) => {
    localStorage.setItem('humanizer-initial-content', content);
    router.push('/dashboard/humanizer');
  };

  const onHeadlineDialogOpenChange = (open: boolean) => {
    setIsHeadlineDialogOpen(open);
    if (!open) {
      // Reset state when dialog closes
      setHeadlineResults(null);
      setSelectedArticleForHeadlines(null);
    }
  };

  const onGenerateHeadlines = (article: Article) => {
    setSelectedArticleForHeadlines(article);
    setHeadlineResults(null); // Clear previous results
    setIsHeadlineDialogOpen(true);
    
    // If headlines were already generated, display them instantly.
    if (article.headlineSuggestions) {
      setHeadlineResults({ headlines: article.headlineSuggestions });
      return;
    }
    
    // Otherwise, generate them on-demand.
    startGeneratingHeadlines(async () => {
      const formData = new FormData();
      formData.append('articleContent', article.content);
      const result = await handleGenerateHeadlines(formData);
      if (result.data) {
        setHeadlineResults(result.data);
      } else {
        toast({ variant: 'destructive', title: 'Error Generating Headlines', description: result.error });
        onHeadlineDialogOpenChange(false); // Close dialog on error
      }
    });
  };

  const onGenerateSocial = (article: Article) => {
    setSelectedArticleForSocial(article);
    setIsSocialDialogOpen(true);
  };

  return (
    <>
      <Dialog open={isHeadlineDialogOpen} onOpenChange={onHeadlineDialogOpenChange}>
        <TooltipProvider>
        <div className="space-y-8">
          {/* Trend Discovery is now the first step, integrated here */}
          <TrendDiscoveryClient onSelectTopic={setTopic} />
          
          {/* Article Generation Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Step 2: Generate a New Article</CardTitle>
              <CardDescription>
                Enter a topic or select one from the trends above. The AI will generate a high-quality article aligned with Google's E-E-A-T and helpful content guidelines.
              </CardDescription>
            </CardHeader>
            <form action={generateArticleAction}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="topic" className="font-semibold">Topic or Keyword</Label>
                    <Input
                      id="topic"
                      name="topic"
                      placeholder="e.g., 'The future of AI in marketing' or 'sustainable energy innovations'"
                      required
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                    {generateState?.validationErrors?.topic && (
                        <p className="text-sm text-destructive mt-2">{generateState.validationErrors.topic.join(', ')}</p>
                      )}
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="language" className="font-semibold">Language</Label>
                      <Select name="language" defaultValue="en">
                          <SelectTrigger id="language">
                              <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                              <SelectItem value="it">Italian</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <GenerateArticleButton />
              </CardFooter>
            </form>
          </Card>

          {/* Drafts Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UploadCloud className="text-primary"/>Step 3: Refine & Publish Drafts</CardTitle>
              <CardDescription>These articles are generated and waiting to be published to your website. Use the action buttons to improve them before sending.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Article</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <>
                      <ArticleRowSkeleton />
                      <ArticleRowSkeleton />
                    </>
                  ) : draftArticles.length > 0 ? (
                    draftArticles.map(article => (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium text-foreground flex items-center gap-4">
                           <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-muted-foreground relative">
                              {article.videoUrl ? (
                                <video key={article.videoUrl} loop autoPlay muted playsInline className="w-full h-full object-cover rounded-md">
                                    <source src={article.videoUrl} type="video/mp4" />
                                </video>
                              ) : article.featuredImageUrl ? (
                                <Image src={article.featuredImageUrl} alt={`Featured image for ${article.title}`} fill className="object-cover rounded-md" />
                              ) : (
                                <ImageIcon className="h-6 w-6"/>
                              )}
                              {article.isGeneratingVideo && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md"><Loader2 className="h-6 w-6 animate-spin text-white"/></div>}
                            </div>
                          <span>{article.title}</span>
                        </TableCell>
                        <TableCell>{article.createdAt ? format(article.createdAt.toDate(), 'PP') : 'N/A'}</TableCell>
                        <TableCell className="text-right space-x-1">
                           <Tooltip>
                              <TooltipTrigger asChild>
                                  <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => onGenerateVideo(article)}
                                  disabled={activeActionId === article.id || article.isGeneratingVideo}
                                  >
                                  <span className="sr-only">Generate Video</span>
                                  {activeActionId === article.id && article.isGeneratingVideo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                                  </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Generate Video</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                              <TooltipTrigger asChild>
                                  <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => onGenerateImage(article)}
                                  disabled={activeActionId === article.id || article.isGeneratingVideo}
                                  >
                                  <span className="sr-only">Generate Featured Image</span>
                                  {activeActionId === article.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                                  </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Generate Featured Image</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                              <TooltipTrigger asChild>
                                  <Button variant="outline" size="icon" onClick={() => onGenerateHeadlines(article)} disabled={activeActionId === article.id || article.isGeneratingVideo}>
                                      <span className="sr-only">Optimize Headlines</span>
                                      <Lightbulb className="h-4 w-4" />
                                  </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Optimize Headlines</p></TooltipContent>
                          </Tooltip>
                           <Tooltip>
                              <TooltipTrigger asChild>
                                  <Button variant="outline" size="icon" onClick={() => onGenerateSocial(article)} disabled={activeActionId === article.id || article.isGeneratingVideo}>
                                      <span className="sr-only">Generate Social Posts</span>
                                      <MessageSquare className="h-4 w-4" />
                                  </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Generate Social Posts</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                              <TooltipTrigger asChild>
                                  <Button variant="outline" size="icon" onClick={() => handleHumanizeClick(article.content)} disabled={activeActionId === article.id || article.isGeneratingVideo}>
                                  <span className="sr-only">Rewrite with AI Humanizer</span>
                                  <Wand2 className="h-4 w-4" />
                                  </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Rewrite with AI Humanizer</p></TooltipContent>
                          </Tooltip>
                           <Tooltip>
                              <TooltipTrigger asChild>
                                  <Button
                                  size="icon"
                                  onClick={() => handlePublish(article.id)}
                                  disabled={activeActionId === article.id || article.isGeneratingVideo}
                                  >
                                  <span className="sr-only">Publish to WordPress</span>
                                  {activeActionId === article.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                  </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Publish to WordPress</p></TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No drafts found. Generate an article to get started.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Published Articles Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileCheck2 className="text-green-600"/>Published Articles Log</CardTitle>
              <CardDescription>A log of all articles successfully published to your website via the integrated webhook.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Published</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <>
                      <ArticleRowSkeleton />
                    </>
                  ) : publishedArticles.length > 0 ? (
                    publishedArticles.map(article => (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium">{article.title}</TableCell>
                        <TableCell><Badge variant="outline" className="text-green-600 border-green-500 bg-green-50 dark:bg-green-900/20">Published</Badge></TableCell>
                        <TableCell className="text-right">{article.publishedAt ? format(article.publishedAt.toDate(), 'PPp') : 'N/A'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No articles have been published yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <WordpressIntegrationStatus />

        </div>
        </TooltipProvider>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Headline Optimizer</DialogTitle>
             <DialogDescription>
              {isGeneratingHeadlines
                ? "The AI is brainstorming compelling headlines for your article..."
                : `Showing ${headlineResults?.headlines.length || 0} headline ideas for: "${selectedArticleForHeadlines?.title}"`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isGeneratingHeadlines && (
               <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
               </div>
            )}
            {headlineResults && (
              <div className="space-y-4">
                {headlineResults.headlines.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <p className="text-lg font-semibold text-foreground">{item.headline}</p>
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="outline">{item.angle}</Badge>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`score-${index}`} className="text-muted-foreground">Click-Through Score:</Label>
                        <Progress id={`score-${index}`} value={item.clickThroughScore} className="w-24 h-2" />
                        <span className="font-semibold">{item.clickThroughScore}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <SocialMediaDialog article={selectedArticleForSocial} open={isSocialDialogOpen} onOpenChange={setIsSocialDialogOpen} />
    </>
  );
}
