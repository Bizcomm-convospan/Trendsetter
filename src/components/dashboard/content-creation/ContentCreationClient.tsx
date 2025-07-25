
'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { handleGenerateArticle, handlePublishArticle, handleGenerateImage, handleGenerateVideo, type ActionResponse } from '@/app/actions';
import type { GenerateSeoArticleOutput } from '@/ai/flows/generate-seo-article';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, Wand2, UploadCloud, Send, FileCheck2, Globe, CheckCircle, Lightbulb, Image as ImageIcon, MessageSquare, Twitter, Linkedin, Facebook, AlertTriangle, Video, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendDiscoveryClient } from './TrendDiscoveryClient';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type HeadlineSuggestion } from '@/ai/flows/schemas';
import Link from 'next/link';

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

function WordpressIntegrationStatus() {
    const isZapierUrlConfigured = process.env.NEXT_PUBLIC_ZAPIER_WEBHOOK_URL && !process.env.NEXT_PUBLIC_ZAPIER_WEBHOOK_URL.includes('your-zapier-webhook-url-here');

    return (
         <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="text-primary"/>
                Publishing Automation Status
              </CardTitle>
              <CardDescription>
                This application uses Zapier to automate publishing to WordPress or any other platform. To enable this, you need to configure a Zapier webhook.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-4 rounded-lg border p-4">
                {isZapierUrlConfigured ? <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" /> : <AlertTriangle className="h-6 w-6 text-amber-500 mt-1 flex-shrink-0" />}
                <div>
                  <h3 className="font-semibold">Zapier Webhook URL</h3>
                  <p className="text-sm text-muted-foreground">
                    {isZapierUrlConfigured
                        ? "Automation is active. Published articles will be sent to your configured Zapier webhook."
                        : "Automation is disabled. Your ZAPIER_WEBHOOK_URL is not configured in your .env file."
                    }
                  </p>
                </div>
              </div>
               <div className="flex items-start gap-4 rounded-lg border p-4 bg-muted/40">
                <Info className="h-6 w-6 text-sky-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">How to Enable Automation</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a "Catch Hook" trigger in <Link href="https://zapier.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Zapier</Link>, connect it to a WordPress "Create Post" action, and paste the webhook URL into your .env file.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">
                    When you click "Publish", the app sends the article data to your Zapier webhook, which then creates the post in WordPress. This allows for powerful, flexible automations.
                </p>
            </CardFooter>
          </Card>
    )
}

function HeadlineDialog({ headlines, articleTitle, open, onOpenChange }: { headlines: HeadlineSuggestion[] | undefined, articleTitle: string | undefined, open: boolean, onOpenChange: (open: boolean) => void }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Headline Optimizer</DialogTitle>
                    <DialogDescription>
                        Showing {headlines?.length || 0} headline ideas for: "{articleTitle}"
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    {headlines && (
                        <div className="space-y-4">
                            {headlines.map((item, index) => (
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
    )
}

function SocialMediaDialog({ article, open, onOpenChange }: { article: Article | null, open: boolean, onOpenChange: (open: boolean) => void }) {
    const socialPosts = article?.socialMediaPosts;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Social Media Content</DialogTitle>
                    <DialogDescription>
                        AI-crafted social media posts for: "{article?.title}"
                    </DialogDescription>
                </DialogHeader>
                {socialPosts ? (
                    <Tabs defaultValue="twitter" className="w-full pt-4">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="twitter"><Twitter className="mr-2 h-4 w-4" />Twitter</TabsTrigger>
                            <TabsTrigger value="linkedin"><Linkedin className="mr-2 h-4 w-4" />LinkedIn</TabsTrigger>
                            <TabsTrigger value="facebook"><Facebook className="mr-2 h-4 w-4" />Facebook</TabsTrigger>
                        </TabsList>
                        <TabsContent value="twitter" className="mt-4">
                            <div className="space-y-3">
                                {socialPosts.twitterThread.map((tweet, index) => (
                                    <Textarea key={index} value={tweet} readOnly className="bg-muted/50" rows={4} />
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="linkedin" className="mt-4">
                            <Textarea value={socialPosts.linkedInPost} readOnly className="bg-muted/50" rows={8} />
                        </TabsContent>
                        <TabsContent value="facebook" className="mt-4">
                           <Textarea value={socialPosts.facebookPost} readOnly className="bg-muted/50" rows={8} />
                        </TabsContent>
                    </Tabs>
                ) : (
                     <div className="flex items-center justify-center p-8">
                        <p>No social media posts were generated for this article.</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}


export function ContentCreationClient({ initialTopic }: { initialTopic?: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isGenerating, startGenerating] = useTransition();

  const [topic, setTopic] = useState(initialTopic || '');
  
  const [draftArticles, setDraftArticles] = useState<Article[]>([]);
  const [publishedArticles, setPublishedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const [selectedArticleForHeadlines, setSelectedArticleForHeadlines] = useState<Article | null>(null);
  const [isHeadlineDialogOpen, setIsHeadlineDialogOpen] = useState(false);
  
  const [selectedArticleForSocial, setSelectedArticleForSocial] = useState<Article | null>(null);
  const [isSocialDialogOpen, setIsSocialDialogOpen] = useState(false);

  useEffect(() => {
    try {
        const storedTopic = localStorage.getItem('content-creation-initial-topic');
        if (storedTopic) {
            setTopic(storedTopic);
            localStorage.removeItem('content-creation-initial-topic');
        }
    } catch (error) {
        console.error("Could not access localStorage:", error);
    }
  }, []);

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

  const generateArticleAction = (formData: FormData) => {
    startGenerating(async () => {
      const response = await handleGenerateArticle(formData);
      if (response.data) {
        toast({
          title: "Article Generated!",
          description: `"${response.data.title}" is now available as a draft.`,
        });
        setTopic('');
      } else {
        toast({ variant: "destructive", title: "Error Generating Article", description: response.error });
      }
    });
  };
  
  const handlePublish = async (articleId: string) => {
    setActiveActionId(articleId);
    const result = await handlePublishArticle(articleId);
    if (result.error) {
      toast({ variant: 'destructive', title: 'Publishing Failed', description: result.error });
    } else {
      toast({ title: 'Article Published!', description: 'Your article has been sent to your automation workflow.' });
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
    // Update the local state to remove the spinner, the onSnapshot listener will update the videoUrl
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
      setSelectedArticleForHeadlines(null);
    }
  };

  const onShowHeadlines = (article: Article) => {
    setSelectedArticleForHeadlines(article);
    setIsHeadlineDialogOpen(true);
  };

  const onShowSocial = (article: Article) => {
    setSelectedArticleForSocial(article);
    setIsSocialDialogOpen(true);
  };

  return (
    <>
      <TooltipProvider>
      <div className="space-y-8">
        <TrendDiscoveryClient onSelectTopic={setTopic} />
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Step 2: Generate a New Article</CardTitle>
            <CardDescription>
              Enter a topic or select one from the trends above. The AI will generate a high-quality article aligned with Google's E-E-A-T, including headline and social media ideas in one go.
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
                    disabled={isGenerating}
                  />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="language" className="font-semibold">Language</Label>
                    <Select name="language" defaultValue="en" disabled={isGenerating}>
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

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UploadCloud className="text-primary"/>Step 3: Refine & Publish Drafts</CardTitle>
            <CardDescription>These articles are generated and waiting to be published. Use the action buttons to refine them with images, video, and better text before publishing.</CardDescription>
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
                                <Button variant="outline" size="icon" onClick={() => onShowHeadlines(article)} disabled={activeActionId === article.id || article.isGeneratingVideo}>
                                    <span className="sr-only">View Headlines</span>
                                    <Lightbulb className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>View Headlines</p></TooltipContent>
                        </Tooltip>
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={() => onShowSocial(article)} disabled={activeActionId === article.id || article.isGeneratingVideo}>
                                    <span className="sr-only">View Social Posts</span>
                                    <MessageSquare className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>View Social Posts</p></TooltipContent>
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
                                <span className="sr-only">Publish Article</span>
                                {activeActionId === article.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Publish Article</p></TooltipContent>
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
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileCheck2 className="text-green-600"/>Published Articles Log</CardTitle>
            <CardDescription>A log of all articles successfully sent to your publishing workflow (e.g., Zapier).</CardDescription>
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
      <HeadlineDialog 
        headlines={selectedArticleForHeadlines?.headlineSuggestions}
        articleTitle={selectedArticleForHeadlines?.title}
        open={isHeadlineDialogOpen}
        onOpenChange={onHeadlineDialogOpenChange}
      />
      <SocialMediaDialog article={selectedArticleForSocial} open={isSocialDialogOpen} onOpenChange={setIsSocialDialogOpen} />
    </>
  );
}
