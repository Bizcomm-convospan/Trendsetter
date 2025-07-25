
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ActionResponse } from '@/app/actions';
import { handleGenerateHumanizedContent } from '@/app/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
      Generate Humanized Content
    </Button>
  );
}

export function HumanizerClient() {
  const [result, setResult] = useState('');
  const [content, setContent] = useState('');
  const { toast } = useToast();
  const [isGenerating, startTransition] = useTransition();

  useEffect(() => {
    try {
      const initialContent = localStorage.getItem('humanizer-initial-content');
      if (initialContent) {
        setContent(initialContent);
        localStorage.removeItem('humanizer-initial-content'); // Clean up after use
      }
    } catch (error) {
       console.error("Could not access localStorage:", error);
    }
  }, []);

  const formAction = (formData: FormData) => {
    startTransition(async () => {
      const response = await handleGenerateHumanizedContent(formData);
      if (response.data) {
        setResult(response.data);
        toast({
          title: 'Content Generated!',
          description: 'Your human-like article is ready.',
        });
      }
      if (response.error) {
        toast({
          variant: 'destructive',
          title: 'Error Generating Content',
          description: response.error,
        });
      }
    });
  };

  return (
    <div className="space-y-8">
       <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Wand2 className="h-8 w-8 text-primary" />
          AI Article Humanizer
        </h1>
        <p className="text-lg text-muted-foreground">
          Transform existing text into engaging, human-like content with specific tones, keywords, and insights.
        </p>
      </header>

      <Card className="shadow-lg">
        <form action={formAction}>
          <CardHeader>
            <CardTitle>Humanizer Engine</CardTitle>
            <CardDescription>
              Paste your content below. The AI will rewrite it to sound more natural and engaging based on your selected options.
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
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-3">
              <Label>Tone</Label>
              <RadioGroup name="tone" defaultValue="mixed" className="flex flex-wrap gap-x-6 gap-y-2">
                {['formal', 'casual', 'storytelling', 'mixed'].map(toneValue => (
                  <div key={toneValue} className="flex items-center space-x-2">
                    <RadioGroupItem value={toneValue} id={`tone-${toneValue}`} disabled={isGenerating}/>
                    <Label htmlFor={`tone-${toneValue}`} className="font-normal capitalize">{toneValue}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="keyword">Keyword (Optional)</Label>
                <Input id="keyword" name="keyword" placeholder="e.g., solar power" disabled={isGenerating}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="userInsight">Specific Insight (Optional)</Label>
                <Input id="userInsight" name="userInsight" placeholder="e.g., Mention the impact on developing nations" disabled={isGenerating}/>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {isGenerating && (
        <Card className="shadow-lg animate-pulse">
            <CardHeader>
                <CardTitle>Generating Content...</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p>The AI is rewriting your content. Please wait a moment...</p>
                </div>
            </CardContent>
        </Card>
      )}

      {result && (
        <Card className="shadow-lg animate-fadeIn">
          <CardHeader>
            <CardTitle>Generated Output</CardTitle>
             <CardDescription>The humanized version of your content is ready below.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea value={result} className="min-h-[400px] text-base bg-muted/30" readOnly />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
