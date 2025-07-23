
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, BarChart, Eye, Share2, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

// Enhanced Article interface to include performance metrics
interface PerformanceArticle {
  id: string;
  title: string;
  status: 'published';
  publishedAt?: Timestamp;
  topic: string;
  // Simulated performance data
  views: number;
  shares: number;
  score: number;
}

export function PerformanceClient() {
    const { toast } = useToast();
    const [articles, setArticles] = useState<PerformanceArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const articlesRef = collection(db, 'articles');
        // Query only for published articles
        const q = query(articlesRef, where('status', '==', 'published'), orderBy('publishedAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            // Simulate adding performance data to each article
            const data = snapshot.docs.map(doc => {
                const articleData = doc.data();
                // In a real app, this data would come from an analytics integration.
                // Here, we generate plausible random data for demonstration.
                const views = Math.floor(Math.random() * 5000) + 100;
                const shares = Math.floor(Math.random() * 200);
                const score = Math.floor((views / 5000) * 60 + (shares / 200) * 40); // Weighted score
                
                return { 
                    id: doc.id,
                    ...articleData,
                    views,
                    shares,
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

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="text-primary h-7 w-7" />
            Content Performance
          </CardTitle>
          <CardDescription>
            Track the performance of your published articles. This data is used to improve future AI suggestions and build your competitive advantage.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[35%]">Article Title</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead className="text-center">Views</TableHead>
                        <TableHead className="text-center">Shares</TableHead>
                        <TableHead className="text-center">Performance Score</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-32 mx-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : articles.length > 0 ? (
                        articles.map(article => (
                            <TableRow key={article.id}>
                                <TableCell className="font-semibold text-foreground">{article.title}</TableCell>
                                <TableCell><Badge variant="secondary">{article.topic}</Badge></TableCell>
                                <TableCell className="text-center font-medium flex items-center justify-center gap-2">
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                  {article.views.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-center font-medium flex items-center justify-center gap-2">
                                  <Share2 className="h-4 w-4 text-muted-foreground" />
                                  {article.shares.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Progress value={article.score} className="w-24 h-2" />
                                        <span className="font-bold text-foreground">{article.score}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-48 text-center">
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
  );
}
