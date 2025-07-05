
'use client';

import { useState, useEffect, useTransition } from 'react';
import { handleDiscoverTrends, type ActionResponse } from '@/app/actions';
import type { DiscoverTrendsOutput } from '@/ai/flows/discover-trends-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TrendingUp, BarChart3, FileText, HelpCircle, BrainCircuit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '../ui/skeleton';
import { useRouter } from 'next/navigation';

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
      Discover Trends
    </Button>
  );
}

export function TrendDiscoveryClient({ onSelectTrend }: { onSelectTrend: (topic: string) => void }) {
  const [trendsData, setTrendsData] = useState<DiscoverTrendsOutput | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const [isDiscovering, startDiscovering] = useTransition();
  const [state, setState] = useState<ActionResponse<DiscoverTrendsOutput>>({});

  const formAction = (formData: FormData) => {
    setTrendsData(null); // Clear previous results
    startDiscovering(async () => {
      const result = await handleDiscoverTrends(formData);
      setState(result);
    });
  };

  useEffect(() => {
    if (state?.data) {
      setTrendsData(state.data);
      toast({
        title: "Trends Discovered!",
        description: `Found ${state.data.discoveredTrends.length} potential trends.`,
      });
    }
    if (state?.error) {
      toast({
        variant: "destructive",
        title: "Error Discovering Trends",
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

  const handleGetContentAngles = () => {
    if (!trendsData?.discoveredTrends) return;
    try {
      localStorage.setItem('answer-the-ai-trends', JSON.stringify(trendsData.discoveredTrends));
      router.push('/dashboard/answer-the-ai');
    } catch (error) {
      console.error("Error writing to localStorage", error);
      toast({ variant: 'destructive', title: 'Could not navigate', description: 'There was an issue passing trend data.' });
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Step 1: Discover Trending Topics</CardTitle>
          <CardDescription>
            Start your content creation process here. Enter a topic to focus the trend discovery, or leave it blank for general trends. The results can then be used to generate articles.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-base font-semibold">Focus Topic (Optional)</Label>
              <Input
                id="topic"
                name="topic"
                placeholder="e.g., technology, marketing, finance"
                className="text-base"
                disabled={isDiscovering}
              />
              {state?.validationErrors?.topic && (
                <p className="text-sm text-destructive">{state.validationErrors.topic.join(', ')}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="geography">Geography</Label>
                    <Select name="geography" defaultValue="US" disabled={isDiscovering}>
                        <SelectTrigger id="geography">
                            <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="GB">United Kingdom</SelectItem>
                            <SelectItem value="IN">India</SelectItem>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="AU">Australia</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select name="language" defaultValue="en" disabled={isDiscovering}>
                        <SelectTrigger id="language">
                            <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" defaultValue="all" disabled={isDiscovering}>
                        <SelectTrigger id="category">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="Business">Business</SelectItem>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Entertainment">Entertainment</SelectItem>
                            <SelectItem value="Sports">Sports</SelectItem>
                            <SelectItem value="Science">Science</SelectItem>
                            <SelectItem value="Health">Health</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <SubmitButton pending={isDiscovering} />
          </CardFooter>
        </form>
      </Card>

      {isDiscovering && (
        <section className="animate-fadeIn">
          <h2 className="text-xl font-bold mb-4 flex items-center text-muted-foreground">
            <BarChart3 className="mr-3 h-6 w-6 text-primary animate-spin" />
            Awaiting AI output...
          </h2>
          <Card className="shadow-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">Trend Title</TableHead>
                  <TableHead className="w-[40%]">Description</TableHead>
                  <TableHead>Keywords</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-3/4"/></TableCell>
                    <TableCell><Skeleton className="h-4 w-full"/></TableCell>
                    <TableCell>
                      <div className="flex gap-1"><Skeleton className="h-5 w-16"/><Skeleton className="h-5 w-16"/></div>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="sm" disabled>
                          <FileText className="mr-2 h-4 w-4" />
                          Use this Topic
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>
      )}

      {trendsData && !isDiscovering && (
        <section className="animate-fadeIn space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl font-bold flex items-center">
                    <BarChart3 className="mr-3 h-6 w-6 text-primary" />
                    Discovered Trends ({trendsData.discoveredTrends.length} found)
                </h2>
                {trendsData.discoveredTrends.length > 0 && (
                    <Button onClick={handleGetContentAngles}>
                        <BrainCircuit className="mr-2 h-4 w-4" />
                        Generate Content Angles for All
                    </Button>
                )}
            </div>

            {trendsData.discoveredTrends.length > 0 ? (
                <Card className="shadow-md">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="w-[25%]">Trend Title</TableHead>
                        <TableHead className="w-[40%]">Description</TableHead>
                        <TableHead>Keywords</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {trendsData.discoveredTrends.map((trend) => (
                        <TableRow key={trend.title}>
                        <TableCell className="font-medium text-foreground">{trend.title}</TableCell>
                        <TableCell className="text-muted-foreground">{trend.description}</TableCell>
                        <TableCell>
                            <div className="flex flex-wrap gap-1">
                            {trend.keywords.map(keyword => (
                                <Badge key={keyword} variant="secondary">{keyword}</Badge>
                            ))}
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => onSelectTrend(trend.title)}>
                                <FileText className="mr-2 h-4 w-4" />
                                Use this Topic
                            </Button>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </Card>
            ) : (
                <Card className="shadow-md">
                <CardContent className="py-10 text-center">
                    <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-xl font-semibold text-foreground">No Trends Found</p>
                    <p className="text-muted-foreground mt-2">
                    The AI couldn't find any trends for the given topic. Please try another one.
                    </p>
                </CardContent>
                </Card>
            )}
        </section>
      )}
    </div>
  );
}
