
'use client';

import { useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, Target, FileSearch, BarChart, FlaskConical, CircleCheck, ClipboardCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type ActionResponse, handleCompetitorAnalysis } from '@/app/actions';
import { type CompetitorAnalyzerOutput } from '@/ai/flows/competitor-analyzer-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSearch className="mr-2 h-4 w-4" />}
      Analyze Competitor
    </Button>
  );
}

export function CompetitorAnalyzerClient() {
  const { toast } = useToast();
  const [state, setState] = useState<ActionResponse<CompetitorAnalyzerOutput>>({});
  const [isAnalyzing, startTransition] = useTransition();

  const formAction = (formData: FormData) => {
    setState({});
    
    startTransition(async () => {
      const result = await handleCompetitorAnalysis(formData);
      setState(result);
      if (result.data) {
        toast({ title: "Analysis Complete!", description: "Competitor report card is ready." });
      } else if (result.error) {
        toast({ variant: 'destructive', title: "Analysis Failed", description: result.error });
      }
    });
  };
  
  const resultData = state?.data;

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <form action={formAction}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Target className="h-7 w-7 text-primary" />
                Content Competitor Analyzer
            </CardTitle>
            <CardDescription>
              Enter a competitor's article URL. Our AI will deploy a headless browser to crawl the page, extract its content, and generate a strategic report card to help you outperform them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="url">Competitor Article URL</Label>
            <Input id="url" name="url" type="url" placeholder="https://competitor.com/blog/their-article" required disabled={isAnalyzing} />
             {state?.validationErrors?.url && (
              <p className="text-sm text-destructive mt-2">{state.validationErrors.url.join(', ')}</p>
            )}
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      
      {isAnalyzing && (
         <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-2 gap-6">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </CardContent>
        </Card>
      )}

      {resultData && !isAnalyzing && (
        <Card className="animate-fadeIn">
            <CardHeader>
                <CardTitle>Competitor Report Card</CardTitle>
                <CardDescription>An AI analysis of the provided URL.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border rounded-lg flex flex-col justify-center">
                        <h3 className="font-semibold flex items-center gap-2 mb-2"><BarChart className="text-primary"/> Content Grade</h3>
                        <p className="text-5xl font-bold">{resultData.contentGrade}</p>
                        <p className="text-sm text-muted-foreground mt-1">Based on readability, structure, and SEO.</p>
                    </div>
                     <div className="p-4 border rounded-lg flex flex-col justify-center">
                        <h3 className="font-semibold flex items-center gap-2 mb-2"><FlaskConical className="text-primary"/> Tone & Style</h3>
                        <p className="text-lg font-semibold">{resultData.toneAnalysis}</p>
                    </div>
                </div>
                <Separator />
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold flex items-center gap-2 mb-3"><ClipboardCheck className="text-primary"/> Key Topics & Keywords</h3>
                     <div className="flex flex-wrap gap-2">
                        {resultData.keyTopics.map(topic => <Badge key={topic} variant="secondary" className="text-base py-1 px-3">{topic}</Badge>)}
                    </div>
                </div>
                 <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                    <h3 className="font-semibold flex items-center gap-2 mb-3 text-green-800 dark:text-green-300"><CircleCheck className="text-green-600"/> Content Gaps & Opportunities</h3>
                    <p className="text-sm text-muted-foreground mb-3">Here are topics the competitor missed. Covering these could make your article better.</p>
                     <ul className="space-y-2 list-disc pl-5 text-base">
                        {resultData.contentGaps.map((gap, index) => <li key={index}>{gap}</li>)}
                    </ul>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
