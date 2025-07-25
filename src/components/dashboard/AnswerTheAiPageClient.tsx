
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, BrainCircuit, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleAnswerTheAIFromText, handleAnswerTheAI, handleDiscoverTrends, type ActionResponse } from '@/app/actions';
import type { AnswerTheAIOutput } from '@/ai/flows/answer-the-ai-flow';
import { AnswerTheAiResult } from './AnswerTheAiResult';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function SubmitButton({ children, ...props }: { children: React.ReactNode } & React.ComponentProps<typeof Button>) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...props} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
      {children}
    </Button>
  );
}

export function AnswerTheAiPageClient() {
  const { toast } = useToast();
  const [result, setResult] = useState<AnswerTheAIOutput | null>(null);
  const [isProcessing, startTransition] = useTransition();
  const [isFromTrends, setIsFromTrends] = useState(false);

  // Effect to handle trends passed from another page
  useEffect(() => {
    try {
      const storedTrendsJson = localStorage.getItem('answer-the-ai-trends');
      if (storedTrendsJson) {
        setIsFromTrends(true);
        localStorage.removeItem('answer-the-ai-trends'); // Clean up after use
        handleGenerateFromTrends(storedTrendsJson);
      }
    } catch (error) {
      console.error("Could not access localStorage or parse trends", error);
    }
  }, []);

  const handleGenerateFromText = (formData: FormData) => {
    setResult(null);
    setIsFromTrends(false);
    startTransition(async () => {
      const response = await handleAnswerTheAIFromText(formData);
      if (response.data) {
        setResult(response.data);
        toast({ title: "Content Angles Generated!" });
      } else {
        toast({ variant: 'destructive', title: "Error", description: response.error });
      }
    });
  };

  const handleGenerateFromTrends = (trendsJson: string) => {
    setResult(null);
    startTransition(async () => {
      const response = await handleAnswerTheAI(trendsJson);
      if (response.data) {
        setResult(response.data);
        toast({ title: "Content Angles Generated from Trends!" });
      } else {
        toast({ variant: 'destructive', title: "Error", description: response.error });
      }
    });
  };

  const handleDiscoverAndGenerate = () => {
    setResult(null);
    setIsFromTrends(false);
    startTransition(async () => {
      // Step 1: Discover Trends
      const trendsResponse = await handleDiscoverTrends(new FormData());
      if (trendsResponse.error || !trendsResponse.data?.discoveredTrends) {
        toast({ variant: 'destructive', title: "Could not discover trends", description: trendsResponse.error });
        return;
      }

      toast({ title: "Trends Discovered", description: "Now generating content angles..." });

      // Step 2: Generate Angles
      const anglesResponse = await handleAnswerTheAI(JSON.stringify(trendsResponse.data.discoveredTrends));
      if (anglesResponse.data) {
        setResult(anglesResponse.data);
        toast({ title: "Content Angles Generated!" });
      } else {
        toast({ variant: 'destructive', title: "Error Generating Angles", description: anglesResponse.error });
      }
    });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <BrainCircuit className="h-8 w-8 text-primary" />
            Answer the AI
        </h1>
        <p className="text-lg text-muted-foreground">
          Generate strategic content angles to create comprehensive and engaging articles.
        </p>
      </header>
      
      {!isFromTrends && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-lg">
            <form action={handleGenerateFromText}>
              <CardHeader>
                <CardTitle>Generate From Custom Text</CardTitle>
                <CardDescription>Enter your own topic, keywords, or a block of text to generate content angles.</CardDescription>
              </CardHeader>
              <CardContent>
                <Label htmlFor="text" className="sr-only">Custom Text</Label>
                <Textarea
                  id="text"
                  name="text"
                  placeholder="e.g., The future of renewable energy, focusing on solar and wind power innovations..."
                  rows={5}
                  required
                  disabled={isProcessing}
                />
              </CardContent>
              <CardFooter>
                <SubmitButton>Generate From Text</SubmitButton>
              </CardFooter>
            </form>
          </Card>

          <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Generate From Latest Trends</CardTitle>
                <CardDescription>Automatically discover the latest general trends and generate content angles from them in one click.</CardDescription>
              </CardHeader>
              <CardContent>
                  <p className="text-sm text-muted-foreground">This action will first run the Trend Discovery engine and then immediately use the results to generate content questions.</p>
              </CardContent>
              <CardFooter>
                  <Button onClick={handleDiscoverAndGenerate} disabled={isProcessing} className="w-full sm:w-auto">
                      {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      Discover & Generate
                  </Button>
              </CardFooter>
          </Card>
        </div>
      )}

      {isProcessing && !result && (
        <div className="space-y-4 pt-4">
            {isFromTrends && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Processing Trends</AlertTitle>
                <AlertDescription>
                  Generating content angles based on the trends you selected.
                </AlertDescription>
              </Alert>
            )}
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-3/4" />
            <div className="pt-4 space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
      )}

      {result && !isProcessing && <AnswerTheAiResult data={result} />}

    </div>
  );
}
