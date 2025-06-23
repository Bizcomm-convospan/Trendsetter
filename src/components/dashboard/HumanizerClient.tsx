'use client';

import { useState, useEffect, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ActionResponse } from '@/app/actions';
import { handleGenerateHumanizedContent } from '@/app/actions';
import type { HumanizedContentOutput } from '@/ai/flows/humanized-content';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
      Generate
    </Button>
  );
}

export function HumanizerClient() {
  const [result, setResult] = useState('');
  const [content, setContent] = useState('');
  const { toast } = useToast();

  const initialState: ActionResponse<HumanizedContentOutput> = {};
  const [isGenerating, startTransition] = useTransition();
  const [state, setState] = useState(initialState);
  
  const formAction = (formData: FormData) => {
    startTransition(async () => {
      const result = await handleGenerateHumanizedContent(state, formData);
      setState(result);
    });
  };

  useEffect(() => {
    const initialContent = localStorage.getItem('humanizer-initial-content');
    if (initialContent) {
      setContent(initialContent);
      localStorage.removeItem('humanizer-initial-content'); // Clean up after use
    }
  }, []);

  useEffect(() => {
    if (state?.data) {
      setResult(state.data);
      toast({
        title: 'Content Generated!',
        description: 'Your human-like article is ready.',
      });
    }
    if (state?.error) {
      toast({
        variant: 'destructive',
        title: 'Error Generating Content',
        description: state.error,
      });
    }
  }, [state, toast]);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <form action={formAction}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">AI Article Humanizer</CardTitle>
            <CardDescription>
              Transform existing text into engaging, human-like content with specific tones, keywords, and insights.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="contentToHumanize">Content to Humanize</Label>
              <Textarea
                id="contentToHumanize"
                name="contentToHumanize"
                placeholder="Paste or write the content you want to make more human-like here..."
                required
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              {state?.validationErrors?.contentToHumanize && (
                <p className="text-sm text-destructive">{state.validationErrors.contentToHumanize.join(', ')}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Tone</Label>
              <RadioGroup name="tone" defaultValue="mixed" className="flex flex-wrap gap-x-6 gap-y-2">
                {['formal', 'casual', 'storytelling', 'mixed'].map(toneValue => (
                  <div key={toneValue} className="flex items-center space-x-2">
                    <RadioGroupItem value={toneValue} id={`tone-${toneValue}`} />
                    <Label htmlFor={`tone-${toneValue}`} className="font-normal capitalize">{toneValue}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="keyword">Keyword (Optional)</Label>
                <Input id="keyword" name="keyword" placeholder="e.g., solar power" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userInsight">Specific Insight (Optional)</Label>
                <Input id="userInsight" name="userInsight" placeholder="e.g., Mention the impact on developing nations" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {result && (
        <Card className="shadow-lg animate-fadeIn">
          <CardHeader>
            <CardTitle>Generated Output</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={result} className="min-h-[400px] text-base bg-muted/30" readOnly />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
