'use client';

import { useState, useEffect, useTransition } from 'react';
import { handleDiscoverTrends, handleAnswerTheAI, type ActionResponse } from '@/app/actions';
import type { DiscoverTrendsOutput } from '@/ai/flows/discover-trends-flow';
import type { AnswerTheAIOutput } from '@/ai/flows/answer-the-ai-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TrendingUp, BarChart3, FileText, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnswerTheAiClient } from './AnswerTheAiClient';
import { Skeleton } from '../ui/skeleton';

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
      Discover Trends
    </Button>
  );
}

export function TrendDiscoveryClient({ onSelectTrend }: { onSelectTrend?: (topic: string) => void }) {
  const [trendsData, setTrendsData] = useState<DiscoverTrendsOutput | null>(null);
  const { toast } = useToast();

  const [isDiscovering, startDiscovering] = useTransition();
  const [state, setState] = useState<ActionResponse<DiscoverTrendsOutput>>({});

  const [answerTheAiData, setAnswerTheAiData] = useState<AnswerTheAIOutput | null>(null);
  const [isAnswering, startAnswering] = useTransition();

  const formAction = (formData: FormData) => {
    setTrendsData(null); // Clear previous results
    setAnswerTheAiData(null); // Also clear the angles
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
    setAnswerTheAiData(null); // Clear previous results
    startAnswering(async () => {
      const result = await handleAnswerTheAI(JSON.stringify(trendsData.discoveredTrends));
      if (result.data) {
        setAnswerTheAiData(result.data);
        toast({
          title: "Content Angles Generated!",
          description: "The AI has generated questions to inspire your content.",
        });
      }
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error Generating Angles",
          description: result.error,
        });
      }
    });
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Trend Discovery Engine</CardTitle>
          <CardDescription>
            Enter an optional topic to focus the trend discovery, or leave blank for general trends.
            The AI will analyze various sources to provide actionable insights.
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
                disabled={isDiscovering || isAnswering}
              />
              {state?.validationErrors?.topic && (
                <p className="text-sm text-destructive">{state.validationErrors.topic.join(', ')}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="geography">Geography</Label>
                    <Select name="geography" defaultValue="US" disabled={isDiscovering || isAnswering}>
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
                    <Select name="language" defaultValue="en" disabled={isDiscovering || isAnswering}>
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
                    <Select name="category" defaultValue="all" disabled={isDiscovering || isAnswering}>
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

             <div className="space-y-2">
              <Label htmlFor="simulatedSources" className="text-base font-semibold">Simulated Trend Sources</Label>
              <Textarea
                id="simulatedSources"
                name="simulatedSources"
                readOnly
                rows={3}
                className="bg-muted/50 text-sm"
                value={`For this demonstration, the AI will simulate checking real-time data from sources like Google Trends, top news sites, and social media to identify current trends.`}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <SubmitButton pending={isDiscovering || isAnswering} />
          </CardFooter>
        </form>
      </Card>

      {isDiscovering && (
        <section className="animate-fadeIn">
          <h2 className="text-2xl font-bold mb-4 flex items-center text-muted-foreground">
            <BarChart3 className="mr-3 h-7 w-7 text-primary animate-spin" />
            Awaiting AI output...
          </h2>
          <Card className="shadow-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">Trend Title</TableHead>
                  <TableHead className="w-[40%]">Description</TableHead>
                  <TableHead>Keywords</TableHead>
                  {onSelectTrend && <TableHead className="text-right">Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-muted-foreground">Analyzing emerging trends...</TableCell>
                    <TableCell className="text-muted-foreground">The AI is currently processing data to provide a detailed description for this potential trend.</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary">evaluating</Badge>
                          <Badge variant="secondary">keywords</Badge>
                      </div>
                    </TableCell>
                    {onSelectTrend && (
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" disabled>
                          <FileText className="mr-2 h-4 w-4" />
                          Generate Article
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>
      )}

      {trendsData && !isDiscovering && (
        <section className="animate-fadeIn space-y-8">
            <div>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <h2 className="text-2xl font-bold flex items-center">
                        <BarChart3 className="mr-3 h-7 w-7 text-primary" />
                        Discovered Trends ({trendsData.discoveredTrends.length} found)
                    </h2>
                    {trendsData.discoveredTrends.length > 0 && (
                        <Button onClick={handleGetContentAngles} disabled={isAnswering}>
                            {isAnswering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <HelpCircle className="mr-2 h-4 w-4" />}
                            Generate Content Angles
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
                            {onSelectTrend && <TableHead className="text-right">Action</TableHead>}
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
                            {onSelectTrend && (
                                <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => onSelectTrend(trend.title)}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Generate Article
                                </Button>
                                </TableCell>
                            )}
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
            </div>

            {isAnswering && (
                <div className="space-y-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            )}
            
            {answerTheAiData && <AnswerTheAiClient data={answerTheAiData} />}

        </section>
      )}
    </div>
  );
}
