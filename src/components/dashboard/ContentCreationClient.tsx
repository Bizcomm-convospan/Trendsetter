
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { handleGenerateArticle, handlePublishArticle, handleGenerateHeadlines, type ActionResponse } from '@/app/actions';
import type { GenerateSeoArticleOutput } from '@/ai/flows/generate-seo-article';
import type { GenerateHeadlinesOutput } from '@/ai/flows/generate-headlines-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, Wand2, UploadCloud, Send, FileCheck2, Globe, CheckCircle, Lightbulb, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '../ui/progress';

interface Article {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'published';
  createdAt: Timestamp;
  publishedAt?: Timestamp;
  topic: string;
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
      <TableCell><Skeleton className="h-10 w-full" /></TableCell>
    </TableRow>
  );
}

export function ContentCreationClient({ initialTopic }: { initialTopic?: string }) {
  const { toast } = useToast();
  const router = useRouter();

  const [topic, setTopic] = useState(initialTopic || '');
  const [isGenerating, startGenerating] = useTransition();
  const [generateState, setGenerateState] = useState<ActionResponse<GenerateSeoArticleOutput>>({});
  
  const [draftArticles, setDraftArticles] = useState<Article[]>([]);
  const [publishedArticles, setPublishedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  // State for Headline Optimizer
  const [isGeneratingHeadlines, startGeneratingHeadlines] = useTransition();
  const [headlineResults, setHeadlineResults] = useState<GenerateHeadlinesOutput | null>(null);
  const [selectedArticleForHeadlines, setSelectedArticleForHeadlines] = useState<Article | null>(null);
  const [isHeadlineDialogOpen, setIsHeadlineDialogOpen] = useState(false);

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
    startGenerating(async () => {
      const result = await handleGenerateArticle(formData);
      setGenerateState(result);
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
    setPublishingId(articleId);
    const result = await handlePublishArticle(articleId);
    if (result.error) {
      toast({ variant: 'destructive', title: 'Publishing Failed', description: result.error });
    } else {
      toast({ title: 'Article Published!', description: 'Your article has been sent to WordPress.' });
    }
    setPublishingId(null);
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
  }

  const onGenerateHeadlines = (article: Article) => {
    setSelectedArticleForHeadlines(article);
    setHeadlineResults(null);
    setIsHeadlineDialogOpen(true);
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

  return (
    <Dialog open={isHeadlineDialogOpen} onOpenChange={onHeadlineDialogOpenChange}>
      <div className="space-y-8">
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
              <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Webhook URL</h3>
                <p className="text-sm text-muted-foreground">
                  The application is ready to send data to the URL configured in your <code>.env</code> file (<code>WP_WEBHOOK_URL</code>).
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-lg border p-4">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Authentication Token</h3>
                <p className="text-sm text-muted-foreground">
                  A security token is correctly sent in the <code>x-ai-token</code> header, based on your <code>.env</code> file (<code>WP_WEBHOOK_TOKEN</code>).
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
        
        {/* Article Generation Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Generate a New Article</CardTitle>
            <CardDescription>
              Enter a topic or keyword to generate an SEO-optimized article. It will appear in your drafts below, ready for publishing.
            </CardDescription>
          </CardHeader>
          <form action={generateArticleAction}>
            <CardContent>
              <Label htmlFor="topic" className="text-base font-semibold">Topic or Keyword</Label>
              <Input
                id="topic"
                name="topic"
                placeholder="e.g., 'AI innovations in 2025' or 'sustainable energy'"
                required
                className="text-base"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isGenerating}
              />
              {generateState?.validationErrors?.topic && (
                  <p className="text-sm text-destructive mt-2">{generateState.validationErrors.topic.join(', ')}</p>
                )}
            </CardContent>
            <CardFooter className="border-t pt-6">
              <GenerateArticleButton />
            </CardFooter>
          </form>
        </Card>

        {/* Drafts Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UploadCloud className="text-primary"/>Drafts Ready to Publish</CardTitle>
            <CardDescription>These articles are generated and waiting to be published to your website.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
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
                      <TableCell className="font-medium text-foreground">{article.title}</TableCell>
                      <TableCell>{article.createdAt ? format(article.createdAt.toDate(), 'PP') : 'N/A'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => onGenerateHeadlines(article)}>
                           <Lightbulb className="mr-2 h-4 w-4" /> Headlines
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleHumanizeClick(article.content)}>
                          <Wand2 className="mr-2 h-4 w-4" /> Humanize
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handlePublish(article.id)}
                          disabled={publishingId === article.id}
                        >
                          {publishingId === article.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                          Publish
                        </Button>
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
            <CardTitle className="flex items-center gap-2"><FileCheck2 className="text-green-600"/>Published Articles</CardTitle>
            <CardDescription>A log of all articles successfully published to your website.</CardDescription>
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
                      <TableCell><Badge variant="outline" className="text-green-600 border-green-500 bg-green-50">Published</Badge></TableCell>
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
      </div>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Headline Optimizer</DialogTitle>
          <DialogDescription>
            {isGeneratingHeadlines ? "The AI is generating headline ideas..." : `Showing headline ideas for: "${selectedArticleForHeadlines?.title}"`}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isGeneratingHeadlines && <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />}
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
  );
}
