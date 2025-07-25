
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, BarChart, Eye, Share2, Lightbulb, Wand2, FileText, Loader2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { handleAnalyzePerformance, type ActionResponse } from '@/app/actions';
import { type AnalyzePerformanceOutput } from '@/ai/flows/analyze-performance-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


interface PerformanceArticle {
  id: string;
  title: string;
  status: 'published';
  publishedAt?: Timestamp;
  topic: string;
  content: string; // Add content for humanizer/rewrite actions
  views: number;
  shares: number;
  ctr: number;
  engagementRate: number;
  score: number;
  analysis?: AnalyzePerformanceOutput; // To store the AI analysis result
}

export function PerformanceClient() {
    const { toast } = useToast();
    const router = useRouter();
    const [articles, setArticles] = useState<PerformanceArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        const articlesRef = collection(db, 'articles');
        const q = query(articlesRef, where('status', '==', 'published'), orderBy('publishedAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => {
                const articleData = doc.data();
                // In a real app, this data would come from an analytics integration.
                // Here, we generate plausible random data for demonstration.
                const views = Math.floor(Math.random() * 5000) + 100;
                const clicks = Math.floor(Math.random() * (views / 20));
                const ctr = parseFloat(((clicks / views) * 100).toFixed(2));
                const engagementRate = Math.floor(Math.random() * 60) + 10;
                const score = Math.floor(ctr * 10 + engagementRate / 2);
                
                return { 
                    id: doc.id,
                    ...articleData,
                    views,
                    shares: Math.floor(Math.random() * 200),
                    ctr,
                    engagementRate,
                    score,
                } as PerformanceArticle
            });

            setArticles(data);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching published articles:", error);
            toast({ variant: "destructive", title: "Could not load content performance data" });
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);

    const runAnalysis = async (articleId: string) => {
      setAnalyzingId(articleId);
      const article = articles.find(a => a.id === articleId);
      if (!article) return;

      const result = await handleAnalyzePerformance({
        articleTitle: article.title,
        articleTopic: article.topic,
        performanceData: {
          views: article.views,
          ctr: article.ctr,
          engagementRate: article.engagementRate,
        }
      });

      if (result.data) {
        setArticles(prev => prev.map(a => a.id === articleId ? { ...a, analysis: result.data } : a));
        toast({ title: 'Analysis Complete', description: 'AI has provided a recommendation.' });
      } else {
        toast({ variant: 'destructive', title: 'Analysis Failed', description: result.error });
      }
      setAnalyzingId(null);
    };

    const takeAction = (article: PerformanceArticle) => {
      if (!article.analysis) return;
      const { suggestedAction } = article.analysis;
      
      switch(suggestedAction) {
        case 'optimize_headlines':
          localStorage.setItem('content-creation-initial-topic', article.topic);
          toast({ title: "Action Required", description: "Taking you to the Content Creation Hub to optimize headlines."});
          router.push('/dashboard/content-creation');
          break;
        case 'humanize_content':
          localStorage.setItem('humanizer-initial-content', article.content);
          toast({ title: "Action Required", description: "Opening the AI Humanizer with your article content."});
          router.push('/dashboard/humanizer');
          break;
        case 'rewrite_article':
           localStorage.setItem('content-creation-initial-topic', `Rewrite and improve article about: ${article.topic}`);
           toast({ title: "Action Required", description: "Taking you to the Content Creation Hub to rewrite the article."});
           router.push('/dashboard/content-creation');
          break;
        default:
          toast({ title: "No action required", description: "This article is performing well."});
      }
    };

  return (
    <TooltipProvider>
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="text-primary h-7 w-7" />
            Content Performance & Audit
          </CardTitle>
          <CardDescription>
            Track your content's performance and use the AI Audit to get actionable recommendations for improvement. This creates a feedback loop to make your content strategy smarter over time.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[30%]">Article</TableHead>
                        <TableHead>Metrics</TableHead>
                        <TableHead className="w-[35%]">AI Analysis & Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [...Array(3)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-16 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-16 w-full" /></TableCell>
                            </TableRow>
                        ))
                    ) : articles.length > 0 ? (
                        articles.map(article => (
                            <TableRow key={article.id}>
                                <TableCell className="font-semibold text-foreground align-top">
                                  <p>{article.title}</p>
                                  <p className="text-xs text-muted-foreground font-normal">Topic: <Badge variant="secondary">{article.topic}</Badge></p>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                      <span className="text-muted-foreground flex items-center gap-1.5"><Eye className="h-4 w-4"/>Views</span>
                                      <span className="font-medium">{article.views.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-muted-foreground">CTR</span>
                                      <span className="font-medium">{article.ctr.toFixed(2)}%</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-muted-foreground">Score</span>
                                      <Progress value={article.score} className="w-20 h-2" />
                                      <span className="font-bold">{article.score}</span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="align-top">
                                  {article.analysis ? (
                                    <Alert>
                                      <Sparkles className="h-4 w-4" />
                                      <AlertTitle>{article.analysis.diagnosis}</AlertTitle>
                                      <AlertDescription>
                                        <p className="mb-3">{article.analysis.recommendation}</p>
                                        <Button size="sm" onClick={() => takeAction(article)}>
                                          {article.analysis.suggestedAction === 'optimize_headlines' && <Lightbulb className="mr-2 h-4 w-4" />}
                                          {article.analysis.suggestedAction === 'humanize_content' && <Wand2 className="mr-2 h-4 w-4" />}
                                          {article.analysis.suggestedAction === 'rewrite_article' && <FileText className="mr-2 h-4 w-4" />}
                                          Take Action
                                        </Button>
                                      </AlertDescription>
                                    </Alert>
                                  ) : (
                                    <Button 
                                      variant="outline"
                                      onClick={() => runAnalysis(article.id)}
                                      disabled={analyzingId === article.id}
                                      className="w-full"
                                    >
                                      {analyzingId === article.id ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                      ) : (
                                        <BarChart className="mr-2 h-4 w-4" />
                                      )}
                                      Run AI Audit
                                    </Button>
                                  )}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="h-48 text-center">
                                <BarChart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-xl font-semibold">No Published Articles Found</h3>
                                <p className="text-muted-foreground mt-2">
                                  Publish an article from the "Content Creation" hub to start tracking its performance.
                                </p>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
}
