
'use client';

import { useState, useTransition, useEffect, ChangeEvent } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ScanText, FileUp, Sparkles, CheckCircle, BrainCircuit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type ActionResponse, handleAiDetection } from '@/app/actions';
import { type AiDetectorOutput } from '@/ai/flows/ai-detector-flow';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg">
      {pending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ScanText className="mr-2 h-5 w-5" />}
      Analyze Content
    </Button>
  );
}

export function AiDetectorClient() {
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const [isAnalyzing, startTransition] = useTransition();
  const [state, setState] = useState<ActionResponse<AiDetectorOutput>>({});

  useEffect(() => {
    // This logic must be in useEffect to avoid hydration errors.
    // It runs only on the client, after the initial server render has been "hydrated".
    try {
      const initialContent = localStorage.getItem('humanizer-initial-content');
      if (initialContent) {
        setContent(initialContent);
        localStorage.removeItem('humanizer-initial-content'); // Clean up
      }
    } catch (error) {
        console.error("Could not access localStorage:", error);
    }
  }, []);

  const formAction = (formData: FormData) => {
    setState({}); // Clear previous results
    startTransition(async () => {
      const result = await handleAiDetection(formData);
      setState(result);
    });
  };
  
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'text/plain') {
        setFileName(file.name);
        const text = await file.text();
        setContent(text);
        toast({ title: "File loaded", description: `${file.name} content has been loaded into the textarea.` });
      } else {
        toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please upload a .txt file.' });
      }
    }
     // Reset file input to allow re-uploading the same file
    e.target.value = '';
  };

  const handleHumanizeClick = () => {
    if (state.data?.humanizedContent) {
      localStorage.setItem('humanizer-initial-content', state.data.humanizedContent);
      router.push('/dashboard/humanizer');
    }
  };


  useEffect(() => {
    if (state?.data) {
      toast({
        title: 'Analysis Complete!',
        description: 'AI content analysis and suggestions are ready.',
      });
    }
    if (state?.error) {
      toast({
        variant: 'destructive',
        title: 'Error During Analysis',
        description: state.error,
      });
    }
  }, [state, toast]);

  const analysisResult = state?.data;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <BrainCircuit className="h-8 w-8 text-primary" />
          AI Detector & Humanizer
        </h1>
        <p className="text-lg text-muted-foreground">
          Analyze content for a "humanization score" and rewrite text to sound natural.
        </p>
      </header>
      <Card className="shadow-lg">
        <form action={formAction}>
          <CardHeader>
            <CardTitle>Analyze Your Content</CardTitle>
            <CardDescription>
              Paste your content or upload a .txt file. The AI will analyze its quality, check for robotic tones, and suggest human-like improvements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="content">Paste Your Content Here</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Start by pasting the article or text you want to analyze..."
                required
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isAnalyzing}
              />
              {state?.validationErrors?.content && (
                <p className="text-sm text-destructive">{state.validationErrors.content.join(', ')}</p>
              )}
            </div>
             <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
            </div>
             <div className="space-y-2">
                 <Label htmlFor="fileUpload" className="flex gap-2 items-center cursor-pointer text-primary hover:underline">
                    <FileUp className="h-5 w-5" />
                    Upload a .txt file
                 </Label>
                <input id="fileUpload" type="file" accept=".txt" onChange={handleFileChange} className="sr-only" disabled={isAnalyzing} />
                 {fileName && <p className="text-sm text-muted-foreground">Loaded: <span className="font-medium text-foreground">{fileName}</span></p>}
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      
      {isAnalyzing && (
        <Card className="shadow-lg animate-pulse">
            <CardHeader>
                <CardTitle>Analyzing...</CardTitle>
                <CardDescription>The AI is reviewing your content. Please wait a moment.</CardDescription>
            </CardHeader>
            <CardContent>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
        </Card>
      )}

      {analysisResult && (
        <div className="space-y-8 animate-fadeIn">
            {/* Analysis Summary Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Humanization Score: {analysisResult.humanizationScore}/100</Label>
                        <Progress value={analysisResult.humanizationScore} className="mt-2" />
                        <p className="text-xs text-muted-foreground mt-1">A higher score means the content sounds more natural and human-like.</p>
                    </div>
                    <Separator />
                    <div>
                        <Label>AI's Overall Analysis</Label>
                        <p className="text-sm text-foreground mt-2 p-3 bg-muted/50 rounded-md">{analysisResult.overallAnalysis}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Suggestions Card */}
            {analysisResult.suggestions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Improvement Suggestions</CardTitle>
                        <CardDescription>The AI has identified parts of your text that could be improved.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {analysisResult.suggestions.map((item, index) => (
                            <div key={index} className="space-y-3 p-4 border rounded-lg">
                                <div>
                                    <Badge variant="secondary">Original Text</Badge>
                                    <p className="text-sm mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-md font-mono">"{item.originalText}"</p>
                                </div>
                                <div>
                                    <Badge variant="default" className="bg-green-600">Suggested Change</Badge>
                                    <p className="text-sm mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-md font-mono">"{item.suggestedChange}"</p>
                                </div>
                                <div>
                                    <p className="text-sm flex items-start gap-2 text-muted-foreground"><Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-primary"/> <span className="font-semibold text-foreground mr-1">Reason:</span> {item.reason}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Final Humanized Content */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CheckCircle className="text-green-500" /> Fully Humanized Content</CardTitle>
                    <CardDescription>Here is the complete, rewritten article incorporating all of the AI's suggestions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea value={analysisResult.humanizedContent} readOnly rows={15} className="bg-muted/30"/>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleHumanizeClick}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Further Refine in Humanizer
                    </Button>
                </CardFooter>
            </Card>
        </div>
      )}
    </div>
  );
}
