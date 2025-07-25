
'use client';

import { useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Mail, Sparkles, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type ActionResponse, handleEmailOutreach } from '@/app/actions';
import { type EmailOutreachOutput } from '@/ai/flows/email-outreach-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
      Generate Sequence
    </Button>
  );
}

export function EmailOutreachClient() {
  const { toast } = useToast();
  const [state, setState] = useState<ActionResponse<EmailOutreachOutput>>({});
  const [isGenerating, startTransition] = useTransition();
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const formAction = (formData: FormData) => {
    setState({});
    startTransition(async () => {
      const result = await handleEmailOutreach(formData);
      setState(result);
      if (result.data) {
        toast({ title: "Sequence Generated!", description: "Your email outreach sequence is ready." });
      } else if (result.error) {
        toast({ variant: 'destructive', title: "Error", description: result.error });
      }
    });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({...prev, [id]: true}));
    setTimeout(() => setCopiedStates(prev => ({...prev, [id]: false})), 2000);
  };
  
  const resultData = state?.data;

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <form action={formAction}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Mail className="h-7 w-7 text-primary" />
                Email Outreach Agent
            </CardTitle>
            <CardDescription>
              Describe your target audience and goal. The AI will generate a personalized, multi-step email sequence to help you connect and convert.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="recipientProfile">Recipient Profile</Label>
                    <Textarea id="recipientProfile" name="recipientProfile" placeholder="e.g., Marketing Managers at B2B SaaS companies with 50-200 employees..." required disabled={isGenerating} rows={4} />
                    {state?.validationErrors?.recipientProfile && <p className="text-sm text-destructive mt-1">{state.validationErrors.recipientProfile.join(', ')}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="productInfo">Your Product/Service Info</Label>
                    <Textarea id="productInfo" name="productInfo" placeholder="e.g., Trendsetter Pro is an AI-powered content marketing platform that helps businesses..." required disabled={isGenerating} rows={4} />
                    {state?.validationErrors?.productInfo && <p className="text-sm text-destructive mt-1">{state.validationErrors.productInfo.join(', ')}</p>}
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="goal">Campaign Goal</Label>
                <Input id="goal" name="goal" placeholder="To book a 15-minute demo call" required disabled={isGenerating} />
                {state?.validationErrors?.goal && <p className="text-sm text-destructive mt-1">{state.validationErrors.goal.join(', ')}</p>}
            </div>
             <div className="space-y-3">
              <Label>Tone of Voice</Label>
              <RadioGroup name="tone" defaultValue="casual" className="flex flex-wrap gap-x-6 gap-y-2">
                {['formal', 'casual', 'enthusiastic', 'direct'].map(toneValue => (
                  <div key={toneValue} className="flex items-center space-x-2">
                    <RadioGroupItem value={toneValue} id={`tone-${toneValue}`} disabled={isGenerating}/>
                    <Label htmlFor={`tone-${toneValue}`} className="font-normal capitalize">{toneValue}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      
      {isGenerating && (
         <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-2/3 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </CardContent>
        </Card>
      )}

      {resultData && !isGenerating && (
        <Card className="animate-fadeIn">
            <CardHeader>
                <CardTitle>Generated Email Sequence</CardTitle>
                <CardDescription>A multi-step email campaign ready to be deployed.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible defaultValue="item-0" className="w-full space-y-4">
                    {resultData.sequence.map((step, index) => (
                        <AccordionItem value={`item-${index}`} key={index} className="border rounded-lg px-4 bg-muted/30">
                            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left">
                                    <Badge>Day {step.day}</Badge>
                                    <span>{step.subject}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 space-y-4">
                                <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Purpose:</span> {step.purpose}</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor={`subject-${index}`}>Subject</Label>
                                         <Button variant="ghost" size="sm" onClick={() => handleCopy(step.subject, `subject-${index}`)}>
                                            {copiedStates[`subject-${index}`] ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                                            Copy
                                        </Button>
                                    </div>
                                    <Input id={`subject-${index}`} value={step.subject} readOnly />
                                </div>
                                <div className="space-y-2">
                                     <div className="flex justify-between items-center">
                                        <Label htmlFor={`body-${index}`}>Body</Label>
                                         <Button variant="ghost" size="sm" onClick={() => handleCopy(step.body, `body-${index}`)}>
                                             {copiedStates[`body-${index}`] ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                                            Copy
                                        </Button>
                                    </div>
                                    <Textarea id={`body-${index}`} value={step.body} readOnly rows={10} className="bg-background"/>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
