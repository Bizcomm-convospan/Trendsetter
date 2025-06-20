
'use client';

import { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { handleDiscoverTrends, ActionResponse } from '@/app/actions';
import type { DiscoverTrendsOutput, DiscoveredTrend } from '@/ai/flows/discover-trends-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TrendingUp, Lightbulb, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
      Discover Trends
    </Button>
  );
}

function TrendCard({ trend }: { trend: DiscoveredTrend }) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Lightbulb className="mr-2 h-5 w-5 text-primary" />
          {trend.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Badge variant="secondary">{trend.source}</Badge>
        </div>
        <div>
          <Label htmlFor={`relevance-${trend.title.replace(/\s+/g, '-')}`} className="text-xs text-muted-foreground">Relevance</Label>
          <Progress id={`relevance-${trend.title.replace(/\s+/g, '-')}`} value={trend.relevanceScore * 100} className="h-2 mt-1" />
          <p className="text-xs text-muted-foreground text-right mt-0.5">{(trend.relevanceScore * 100).toFixed(0)}%</p>
        </div>
      </CardContent>
    </Card>
  );
}


export function TrendDiscoveryClient() {
  const [trendsData, setTrendsData] = useState<DiscoverTrendsOutput | null>(null);
  const { toast } = useToast();
  const { pending } = useFormStatus();

  const initialState: ActionResponse<DiscoverTrendsOutput> = {};
  const [state, formAction] = useFormState(handleDiscoverTrends, initialState);

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

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Trend Discovery Engine</CardTitle>
          <CardDescription>
            Enter an optional topic to focus the trend discovery, or leave blank for general trends.
            The AI will (simulatedly) analyze various sources to find relevant insights.
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
              />
              {state?.validationErrors?.topic && (
                <p className="text-sm text-destructive">{state.validationErrors.topic.join(', ')}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {pending && !trendsData && (
        <div className="text-center py-10">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">Discovering trends...</p>
        </div>
      )}

      {trendsData && (
        <section className="animate-fadeIn">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <BarChart3 className="mr-3 h-7 w-7 text-primary" />
            Discovered Trends ({trendsData.discoveredTrends.length} found)
          </h2>
          {trendsData.discoveredTrends.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {trendsData.discoveredTrends.map((trend, index) => (
                <TrendCard key={`${trend.title}-${index}`} trend={trend} />
              ))}
            </div>
          ) : (
            <Card className="shadow-md">
              <CardContent className="py-10 text-center">
                <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl font-semibold text-foreground">No Trends Found</p>
                <p className="text-muted-foreground mt-2">
                  Try providing a topic or the AI might not have found general trends at this moment.
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      )}
    </div>
  );
}
