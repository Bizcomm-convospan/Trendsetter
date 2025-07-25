
'use client';

import { useState, useTransition, useMemo } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, CheckCircle, FileText, BarChart, BookOpen, Lightbulb, Languages } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type ActionResponse, handleAnalyzeContentForSeo } from '@/app/actions';
import { type ContentOptimizerOutput } from '@/ai/flows/content-optimizer-flow';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface LocalAnalysis {
  wordCount: number;
  paragraphCount: number;
  headingCount: number;
  keywordDensity: number;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg">
      {pending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
      Analyze with AI
    </Button>
  );
}

export function ContentOptimizerClient() {
  const [content, setContent] = useState('');
  const [keyword, setKeyword] = useState('');
  const { toast } = useToast();

  const [isAnalyzing, startTransition] = useTransition();
  const [state, setState] = useState<ActionResponse<ContentOptimizerOutput>>({});

  const formAction = (formData: FormData) => {
    setState({});
    startTransition(async () => {
      const response = await handleAnalyzeContentForSeo(formData);
      setState(response);
      if (response.data) {
        toast({ title: 'Analysis Complete!', description: 'Your content has been scored and analyzed.' });
      } else if (response.error) {
        toast({ variant: 'destructive', title: 'Analysis Failed', description: response.error });
      }
    });
  };

  const localAnalysis = useMemo((): LocalAnalysis => {
    const words = content.match(/\b\w+\b/g) || [];
    const paragraphs = content.split(/\n+/).filter(p => p.trim().length > 0);
    const headings = content.match(/^#+\s/gm) || [];
    
    let keywordCount = 0;
    if (keyword.trim().length > 0) {
      const regex = new RegExp(`\\b${keyword.trim()}\\b`, 'gi');
      keywordCount = (content.match(regex) || []).length;
    }
    
    const keywordDensity = words.length > 0 ? (keywordCount / words.length) * 100 : 0;

    return {
      wordCount: words.length,
      paragraphCount: paragraphs.length,
      headingCount: headings.length,
      keywordDensity: parseFloat(keywordDensity.toFixed(2)),
    };
  }, [content, keyword]);
  
  const analysisResult = state?.data;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Editor */}
      <div className="lg:col-span-2">
        <form action={formAction}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Content Optimizer</CardTitle>
              <CardDescription>
                Write or paste your content below. Use the real-time metrics for basic guidance, then run the AI analysis for a full SEO score and recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="keyword">Target Keyword</Label>
                  <Input 
                    id="keyword" 
                    name="keyword" 
                    placeholder="e.g., sustainable living" 
                    required 
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    disabled={isAnalyzing} 
                  />
                  {state.validationErrors?.keyword && <p className="text-destructive text-sm">{state.validationErrors.keyword[0]}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="language">Content Language</Label>
                   <Select name="language" defaultValue="en" disabled={isAnalyzing}>
                        <SelectTrigger id="language">
                            <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                            <SelectItem value="it">Italian</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Your Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Start writing your article here..."
                  rows={25}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isAnalyzing}
                  required
                />
                 {state.validationErrors?.content && <p className="text-destructive text-sm">{state.validationErrors.content[0]}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </Card>
        </form>
      </div>

      {/* Right Column: Analysis */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="shadow-lg sticky top-24">
           <CardHeader>
            <CardTitle>Real-Time Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Word Count</span>
              <span className="font-semibold">{localAnalysis.wordCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Paragraphs</span>
              <span className="font-semibold">{localAnalysis.paragraphCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Headings</span>
              <span className="font-semibold">{localAnalysis.headingCount}</span>
            </div>
             <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Keyword Density</span>
              <span className="font-semibold">{localAnalysis.keywordDensity}%</span>
            </div>
          </CardContent>
        </Card>

        {isAnalyzing && (
            <Card className="shadow-lg animate-pulse">
                <CardHeader><CardTitle>AI Analysis</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </CardContent>
            </Card>
        )}

        {analysisResult && (
           <Card className="shadow-lg animate-fadeIn">
            <CardHeader>
                <CardTitle>AI Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label className="text-lg">Content Score: {analysisResult.contentScore}/100</Label>
                    <Progress value={analysisResult.contentScore} className="mt-2 h-4" />
                </div>
                <Separator />
                <div className="space-y-3">
                     <h4 className="font-semibold flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Analysis Breakdown</h4>
                     <p className="text-sm"><strong className="text-muted-foreground">Structure:</strong> {analysisResult.analysis.structure}</p>
                     <p className="text-sm"><strong className="text-muted-foreground">Readability:</strong> {analysisResult.analysis.readability}</p>
                     <p className="text-sm"><strong className="text-muted-foreground">Keywords:</strong> {analysisResult.analysis.keywordUsage}</p>
                </div>
                <Separator />
                <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" /> Recommendations</h4>
                    <ul className="list-disc space-y-1 pl-5 text-sm">
                       {analysisResult.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                    </ul>
                </div>
                 <Separator />
                <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> NLP Keywords to Add</h4>
                    <div className="flex flex-wrap gap-2">
                        {analysisResult.nlpKeywords.map(kw => <Badge key={kw} variant="secondary">{kw}</Badge>)}
                    </div>
                </div>
            </CardContent>
           </Card>
        )}
      </div>
    </div>
  );
}
