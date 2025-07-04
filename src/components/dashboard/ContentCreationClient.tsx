
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { handleGenerateArticle, handlePublishArticle, type ActionResponse } from '@/app/actions';
import type { GenerateSeoArticleOutput } from '@/ai/flows/generate-seo-article';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, Wand2, UploadCloud, Send, FileCheck2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';

interface Article {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'published';
  createdAt: Timestamp;
  publishedAt?: Timestamp;
  trendingTopic: string;
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
      <TableCell><Skeleton className="h-10 w-24" /></TableCell>
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

  return (
    <div className="space-y-8">
      {/* Article Generation Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Content Generation</CardTitle>
          <CardDescription>
            Enter a trending topic to generate an SEO-optimized article. It will appear in your drafts below, ready for publishing.
          </CardDescription>
        </CardHeader>
        <form action={generateArticleAction}>
          <CardContent>
            <Label htmlFor="trendingTopic" className="text-base font-semibold">Trending Topic</Label>
            <Input
              id="trendingTopic"
              name="trendingTopic"
              placeholder="e.g., AI innovations in 2025"
              required
              className="text-base"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isGenerating}
            />
             {generateState?.validationErrors?.trendingTopic && (
                <p className="text-sm text-destructive mt-2">{generateState.validationErrors.trendingTopic.join(', ')}</p>
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
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No drafts found. Generate an article to get started.</TableCell>
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
  );
}
