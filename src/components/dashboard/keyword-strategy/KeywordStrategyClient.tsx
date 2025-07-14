
'use client';

import { useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Key, Lightbulb, UserCheck, Search, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type ActionResponse, handleKeywordStrategy } from '@/app/actions';
import { type KeywordStrategyOutput } from '@/ai/flows/keyword-strategy-flow';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
      Generate Strategy
    </Button>
  );
}

const intentMap = {
    informational: "Seeking information (e.g., 'how to grow tomatoes')",
    navigational: "Looking for a specific site (e.g., 'facebook login')",
    commercial: "Investigating before a purchase (e.g., 'best running shoes')",
    transactional: "Ready to buy (e.g., 'buy nike air force 1')",
};

export function KeywordStrategyClient() {
  const { toast } = useToast();
  const [state, setState] = useState<ActionResponse<KeywordStrategyOutput>>({});
  const [isSearching, startTransition] = useTransition();

  const formAction = (formData: FormData) => {
    setState({});
    startTransition(async () => {
      const result = await handleKeywordStrategy(formData);
      setState(result);
      if (result.data) {
        toast({ title: "Strategy Generated!", description: "Your keyword strategy is ready." });
      } else if (result.error) {
        toast({ variant: 'destructive', title: "Error", description: result.error });
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
                <Key className="h-7 w-7 text-primary" />
                Keyword Strategy Agent
            </CardTitle>
            <CardDescription>
              Enter a core topic to generate a complete keyword strategy, including primary keywords, long-tail variations, search intent, and related questions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="topic">Core Topic</Label>
            <Input id="topic" name="topic" placeholder="e.g., 'cold brew coffee' or 'content marketing for startups'" required disabled={isSearching} />
             {state?.validationErrors?.topic && (
              <p className="text-sm text-destructive mt-2">{state.validationErrors.topic.join(', ')}</p>
            )}
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      
      {isSearching && (
         <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-2/3 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </CardContent>
        </Card>
      )}

      {resultData && !isSearching && (
        <Card className="animate-fadeIn">
            <CardHeader>
                <CardTitle>Keyword Strategy Report</CardTitle>
                <CardDescription>A comprehensive keyword plan based on your topic.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" defaultValue={['primary', 'long-tail']} className="w-full space-y-4">
                    {/* Primary Keywords */}
                    <AccordionItem value="primary" className="border rounded-lg px-4">
                        <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                            <div className="flex items-center gap-3">
                                <Key className="h-6 w-6 text-primary/80" />
                                Primary Keywords
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2">
                             {resultData.primaryKeywords.map(kw => (
                                <div key={kw.keyword} className="py-3 border-b last:border-b-0">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-base">{kw.keyword}</p>
                                        <Badge variant="secondary">Volume: {kw.searchVolume}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground capitalize">{kw.intent} Intent</p>
                                    <p className="text-xs text-muted-foreground/80 mt-1">{intentMap[kw.intent]}</p>
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                     {/* Long-Tail Keywords */}
                    <AccordionItem value="long-tail" className="border rounded-lg px-4">
                        <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                            <div className="flex items-center gap-3">
                                <UserCheck className="h-6 w-6 text-primary/80" />
                                Long-Tail Keywords
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2">
                             {resultData.longTailKeywords.map(kw => (
                                <div key={kw.keyword} className="py-3 border-b last:border-b-0">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-base">{kw.keyword}</p>
                                        <Badge variant="secondary">Volume: {kw.searchVolume}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground capitalize">{kw.intent} Intent</p>
                                    <p className="text-xs text-muted-foreground/80 mt-1">{intentMap[kw.intent]}</p>
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                    {/* Related Questions */}
                    <AccordionItem value="questions" className="border rounded-lg px-4">
                        <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                            <div className="flex items-center gap-3">
                                <HelpCircle className="h-6 w-6 text-primary/80" />
                                Related Questions
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2">
                            <ul className="space-y-2 list-disc pl-5">
                                {resultData.relatedQuestions.map((q, i) => <li key={i}>{q}</li>)}
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
