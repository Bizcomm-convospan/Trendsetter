'use client';

import { useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Search, MessageCircleQuestion, Lightbulb, Users, GitCompareArrows, ClipboardCheck, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type ActionResponse, handleQuestionSpy } from '@/app/actions';
import { type QuestionSpyOutput } from '@/ai/flows/question-spy-flow';
import { Skeleton } from '../ui/skeleton';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
      Find Questions
    </Button>
  );
}

const categoryInfo = {
    gettingStarted: { icon: Users, label: "Getting Started" },
    comparisons: { icon: GitCompareArrows, label: "Comparisons" },
    problemSolving: { icon: ClipboardCheck, label: "Problem Solving" },
    advanced: { icon: GraduationCap, label: "Advanced Topics" },
};

export function QuestionSpyClient() {
  const { toast } = useToast();
  const [state, setState] = useState<ActionResponse<QuestionSpyOutput>>({});
  const [isSearching, startTransition] = useTransition();

  const formAction = (formData: FormData) => {
    setState({});
    startTransition(async () => {
      const result = await handleQuestionSpy(formData);
      setState(result);
      if (result.data) {
        toast({ title: "Questions Found!", description: "AI has finished searching for user questions." });
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
                <MessageCircleQuestion className="h-7 w-7 text-primary" />
                Question Spy
            </CardTitle>
            <CardDescription>
              Enter a topic to discover what real questions people are asking on Google, Reddit, and Quora.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="topic">Topic or Keyword</Label>
            <Input id="topic" name="topic" placeholder="e.g., 'sustainable gardening' or 'project management software'" required disabled={isSearching} />
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
            <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </CardContent>
        </Card>
      )}

      {resultData && !isSearching && (
        <Card className="animate-fadeIn">
            <CardHeader>
                <CardTitle>Discovered Questions</CardTitle>
                <CardDescription>Here's what people are asking about your topic.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" defaultValue={['gettingStarted']} className="w-full">
                {(Object.keys(resultData) as (keyof QuestionSpyOutput)[]).map((key) => {
                    const info = categoryInfo[key];
                    const questions = resultData[key];
                    if (!info || !questions || questions.length === 0) return null;
                    const Icon = info.icon;
                    return (
                        <AccordionItem value={key} key={key}>
                        <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                            <div className="flex items-center gap-3">
                                <Icon className="h-6 w-6 text-primary/80" />
                                {info.label}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <ul className="space-y-2 list-disc pl-5">
                                {questions.map((question, index) => (
                                    <li key={index} className="text-base text-foreground">{question}</li>
                                ))}
                            </ul>
                        </AccordionContent>
                        </AccordionItem>
                    );
                })}
                </Accordion>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
