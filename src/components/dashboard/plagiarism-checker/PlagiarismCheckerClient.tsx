
'use client';

import { useState, useTransition, ChangeEvent } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShieldCheck, FileUp, Sparkles, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type ActionResponse, handlePlagiarismCheck } from '@/app/actions';
import { type PlagiarismCheckerOutput } from '@/ai/flows/plagiarism-checker-flow';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg">
      {pending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
      Check Originality
    </Button>
  );
}

export function PlagiarismCheckerClient() {
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const { toast } = useToast();

  const [isChecking, startTransition] = useTransition();
  const [state, setState] = useState<ActionResponse<PlagiarismCheckerOutput>>({});

  const formAction = (formData: FormData) => {
    setState({}); // Clear previous results
    startTransition(async () => {
      const result = await handlePlagiarismCheck(formData);
      setState(result);
       if (result.data) {
        toast({ title: 'Check Complete!', description: 'Originality analysis is ready.' });
      } else if (result.error) {
        toast({ variant: 'destructive', title: 'Error During Check', description: result.error });
      }
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
    e.target.value = ''; // Reset file input
  };

  const analysisResult = state?.data;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          Plagiarism Checker
        </h1>
        <p className="text-lg text-muted-foreground">
          Analyze content for originality. The AI identifies common phrases and potential sources to help you create unique content.
        </p>
      </header>
      <Card className="shadow-lg">
        <form action={formAction}>
          <CardHeader>
            <CardTitle>Analyze Content Originality</CardTitle>
            <CardDescription>
              Paste your content or upload a .txt file. The AI will provide an originality score and identify segments that may be unoriginal.
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
                disabled={isChecking}
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
                <input id="fileUpload" type="file" accept=".txt" onChange={handleFileChange} className="sr-only" disabled={isChecking} />
                 {fileName && <p className="text-sm text-muted-foreground">Loaded: <span className="font-medium text-foreground">{fileName}</span></p>}
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      
      {isChecking && (
        <Card className="shadow-lg animate-pulse">
            <CardHeader>
                <CardTitle>Checking for Originality...</CardTitle>
                <CardDescription>The AI is scanning your content. Please wait a moment.</CardDescription>
            </CardHeader>
            <CardContent>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
        </Card>
      )}

      {analysisResult && (
        <div className="space-y-8 animate-fadeIn">
            <Card>
                <CardHeader>
                    <CardTitle>Originality Report</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Originality Score: {analysisResult.originalityScore}/100</Label>
                        <Progress value={analysisResult.originalityScore} className="mt-2" />
                        <p className="text-xs text-muted-foreground mt-1">A higher score indicates more unique content.</p>
                    </div>
                    <Separator />
                    <div>
                        <Label>AI's Overall Analysis</Label>
                        <p className="text-sm text-foreground mt-2 p-3 bg-muted/50 rounded-md">{analysisResult.analysis}</p>
                    </div>
                </CardContent>
            </Card>

            {analysisResult.matchedSegments.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Potentially Unoriginal Segments</CardTitle>
                        <CardDescription>The AI has identified parts of your text that may not be original.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {analysisResult.matchedSegments.map((item, index) => (
                            <div key={index} className="space-y-3 p-4 border rounded-lg">
                                <div>
                                    <Badge variant="secondary">Matched Text</Badge>
                                    <blockquote className="text-sm mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border-l-4 border-yellow-400 italic">
                                        "{item.segment}"
                                    </blockquote>
                                </div>
                                <div>
                                     <p className="text-sm flex items-start gap-2 text-muted-foreground">
                                        <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-primary"/>
                                        <span className="font-semibold text-foreground mr-1">Possible Source Type:</span>
                                        {item.sourceType}
                                     </p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
      )}
    </div>
  );
}
