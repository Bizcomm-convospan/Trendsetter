
'use client';

import { useState, useTransition, useMemo, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, CheckCircle, FileText, BarChart, BookOpen, Lightbulb, Languages, Edit, Type, Palette, Bold, Italic, Underline, List, Heading2, Heading3, Save, ArrowLeft, Heading1, ShieldCheck, BrainCircuit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type ActionResponse, handleAnalyzeContentForSeo, handleUpdateArticleContent, handleAiDetection, handlePlagiarismCheck, handleGenerateHumanizedContent } from '@/app/actions';
import { type ContentOptimizerOutput } from '@/ai/flows/content-optimizer-flow';
import { type AiDetectorOutput } from '@/ai/flows/ai-detector-flow';
import { type PlagiarismCheckerOutput } from '@/ai/flows/plagiarism-checker-flow';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartConfig } from '@/components/ui/chart';
import { RadialBarChart, RadialBar, PolarGrid, PolarAngleAxis } from 'recharts';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Timestamp } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';


interface Article {
  id: string;
  title: string;
  content: string;
  topic: string;
  status: 'draft' | 'published';
  createdAt: Timestamp;
  publishedAt?: Timestamp;
  featuredImageUrl?: string;
  videoUrl?: string;
  isGeneratingVideo?: boolean;
}

interface ContentOptimizerProps {
    article: Article;
    onBack: () => void;
    onHumanize: (newContent: string) => void;
}

const EditorToolbar = ({ onCommand }: { onCommand: (command: string, value?: string) => void }) => {
    return (
        <div className="flex items-center gap-1 border rounded-md p-1 bg-muted">
            <ToggleGroup type="multiple" size="sm">
                <ToggleGroupItem value="bold" aria-label="Toggle bold" onClick={() => onCommand('bold')}>
                    <Bold className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="italic" aria-label="Toggle italic" onClick={() => onCommand('italic')}>
                    <Italic className="h-4 w-4" />
                </ToggleGroupItem>
                 <ToggleGroupItem value="underline" aria-label="Toggle underline" onClick={() => onCommand('underline')}>
                    <Underline className="h-4 w-4" />
                </ToggleGroupItem>
            </ToggleGroup>
            <Separator orientation="vertical" className="h-6 mx-1" />
             <ToggleGroup type="single" size="sm">
                <ToggleGroupItem value="h2" aria-label="Toggle H2" onClick={() => onCommand('formatBlock', 'h2')}>
                    <Heading2 className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="h3" aria-label="Toggle H3" onClick={() => onCommand('formatBlock', 'h3')}>
                    <Heading3 className="h-4 w-4" />
                </ToggleGroupItem>
            </ToggleGroup>
             <Separator orientation="vertical" className="h-6 mx-1" />
             <Button variant="ghost" size="sm" onClick={() => onCommand('insertUnorderedList')}>
                <List className="h-4 w-4" />
            </Button>
        </div>
    )
}

interface LocalAnalysis {
  wordCount: number;
  paragraphCount: number;
  headingCount: number;
  keywordDensity: number;
}


export function ContentOptimizer({ article, onBack, onHumanize }: ContentOptimizerProps) {
  const [content, setContent] = useState(article.content);
  const [keyword, setKeyword] = useState(article.topic);
  const [language, setLanguage] = useState('en');
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSaving, startSavingTransition] = useTransition();

  const [isAnalyzingSeo, startSeoTransition] = useTransition();
  const [seoState, setSeoState] = useState<ActionResponse<ContentOptimizerOutput>>({});
  
  const [isAnalyzingAi, startAiTransition] = useTransition();
  const [aiState, setAiState] = useState<ActionResponse<AiDetectorOutput>>({});

  const [isCheckingPlagiarism, startPlagiarismTransition] = useTransition();
  const [plagiarismState, setPlagiarismState] = useState<ActionResponse<PlagiarismCheckerOutput>>({});
  
  const [isHumanizing, startHumanizingTransition] = useTransition();


  useEffect(() => {
    // Set initial content for the editor when the component mounts
    if (editorRef.current) {
      editorRef.current.innerHTML = article.content;
    }
  }, [article.content]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);


  const handleManualContentUpdate = (e: React.FormEvent<HTMLDivElement>) => {
    setContent(e.currentTarget.innerHTML);
  };

  const runSeoAnalysis = () => {
    setSeoState({});
    const formData = new FormData();
    formData.append('content', content);
    formData.append('keyword', keyword);
    formData.append('language', language);

    startSeoTransition(async () => {
      const response = await handleAnalyzeContentForSeo(formData);
      setSeoState(response);
      if (response.data) {
        toast({ title: 'SEO Analysis Complete!', description: 'Your content has been scored.' });
      } else if (response.error) {
        toast({ variant: 'destructive', title: 'SEO Analysis Failed', description: response.error });
      }
    });
  };

  const runAiDetection = () => {
    setAiState({});
    const formData = new FormData();
    formData.append('content', content);
    startAiTransition(async () => {
        const response = await handleAiDetection(formData);
        setAiState(response);
        if (response.data) {
            toast({ title: 'AI Detection Complete!' });
        } else if (response.error) {
            toast({ variant: 'destructive', title: 'AI Detection Failed', description: response.error });
        }
    });
  };

  const runPlagiarismCheck = () => {
    setPlagiarismState({});
    const formData = new FormData();
    formData.append('content', content);
    startPlagiarismTransition(async () => {
        const response = await handlePlagiarismCheck(formData);
        setPlagiarismState(response);
        if (response.data) {
            toast({ title: 'Plagiarism Check Complete!' });
        } else if (response.error) {
            toast({ variant: 'destructive', title: 'Plagiarism Check Failed', description: response.error });
        }
    });
  };

  const runHumanize = () => {
    const formData = new FormData();
    formData.append('contentToHumanize', content);
    startHumanizingTransition(async () => {
      const response = await handleGenerateHumanizedContent(formData);
      if (response.data) {
        onHumanize(response.data);
      } else {
        toast({ variant: 'destructive', title: 'Humanize Failed', description: response.error });
      }
    })
  };

  const handleSave = () => {
    startSavingTransition(async () => {
        const result = await handleUpdateArticleContent(article.id, content);
        if (result.data) {
            toast({ title: "Content Saved!", description: "Your changes have been saved to the draft."});
        } else {
             toast({ variant: 'destructive', title: 'Save Failed', description: result.error });
        }
    });
  };

  const handleEditorCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if(editorRef.current) {
        editorRef.current.focus();
        setContent(editorRef.current.innerHTML); // Update state after command
    }
  };

  const localAnalysis = useMemo((): LocalAnalysis => {
    const plainText = editorRef.current?.innerText || '';
    const words = plainText.match(/\b\w+\b/g) || [];
    const paragraphs = plainText.split(/\n+/).filter(p => p.trim().length > 0);
    const headings = content.match(/<h[1-3]>/gi) || [];
    
    let keywordCount = 0;
    if (keyword.trim().length > 0) {
      const regex = new RegExp(`\\b${keyword.trim()}\\b`, 'gi');
      keywordCount = (plainText.match(regex) || []).length;
    }
    
    const keywordDensity = words.length > 0 ? (keywordCount / words.length) * 100 : 0;

    return {
      wordCount: words.length,
      paragraphCount: paragraphs.length,
      headingCount: headings.length,
      keywordDensity: parseFloat(keywordDensity.toFixed(2)),
    };
  }, [content, keyword]);
  
  const seoResult = seoState?.data;
  const aiResult = aiState?.data;
  const plagiarismResult = plagiarismState?.data;

  const chartConfig = useMemo(() => ({
    value: { label: 'Score' },
    score: { label: 'Content Score', color: 'hsl(var(--primary))' },
  }), []);


  return (
    <div className="space-y-4">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4"/> Back to Drafts</Button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Editor */}
        <div className="lg:col-span-2">
            <Card className="shadow-lg">
                <CardHeader>
                <CardTitle>{article.title}</CardTitle>
                <CardDescription>
                    Use the rich text editor to format your article. Use the real-time metrics for basic guidance, then run the AI analysis for a full SEO score and recommendations.
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
                    />
                    {seoState.validationErrors?.keyword && <p className="text-destructive text-sm">{seoState.validationErrors.keyword[0]}</p>}
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="language">Content Language</Label>
                    <Select name="language" value={language} onValueChange={setLanguage}>
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
                    <div className="space-y-2">
                        <EditorToolbar onCommand={handleEditorCommand} />
                        <div
                            ref={editorRef}
                            id="content"
                            contentEditable={!isAnalyzingSeo}
                            onInput={handleManualContentUpdate}
                            className="prose dark:prose-invert max-w-none min-h-[400px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    {seoState.validationErrors?.content && <p className="text-destructive text-sm">{seoState.validationErrors.content[0]}</p>}
                </div>
                </CardContent>
                <CardFooter className="justify-end">
                <Button variant="outline" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
                </CardFooter>
            </Card>
        </div>

        {/* Right Column: Analysis */}
        <div className="lg:col-span-1 space-y-6 sticky top-24">
            <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Content Command Center</CardTitle>
            </CardHeader>
            <CardContent>
                 <Tabs defaultValue="seo">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="seo"><Sparkles className="mr-2 h-4 w-4" />SEO</TabsTrigger>
                        <TabsTrigger value="ai"><BrainCircuit className="mr-2 h-4 w-4" />AI</TabsTrigger>
                        <TabsTrigger value="plagiarism"><ShieldCheck className="mr-2 h-4 w-4" />Originality</TabsTrigger>
                    </TabsList>

                    <TabsContent value="seo" className="py-4">
                        <ScrollArea className="h-96 pr-4">
                            <div className="space-y-4 text-sm">
                                <h3 className="font-semibold text-foreground">Real-Time Metrics</h3>
                                <div className="flex justify-between items-center"><span className="text-muted-foreground">Word Count</span><span className="font-semibold">{localAnalysis.wordCount}</span></div>
                                <div className="flex justify-between items-center"><span className="text-muted-foreground">Paragraphs</span><span className="font-semibold">{localAnalysis.paragraphCount}</span></div>
                                <div className="flex justify-between items-center"><span className="text-muted-foreground">Headings</span><span className="font-semibold">{localAnalysis.headingCount}</span></div>
                                <div className="flex justify-between items-center"><span className="text-muted-foreground">Keyword Density</span><span className="font-semibold">{localAnalysis.keywordDensity}%</span></div>
                                <Separator className="my-4"/>

                                <h3 className="font-semibold text-foreground">AI Analysis</h3>
                                <Button onClick={runSeoAnalysis} disabled={isAnalyzingSeo} className="w-full">
                                    {isAnalyzingSeo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Run SEO Analysis
                                </Button>
                                {isAnalyzingSeo && <p className="text-xs text-center text-muted-foreground">AI is scoring your content...</p>}
                                
                                {seoResult && (
                                    <div className="space-y-4 pt-4 animate-fadeIn">
                                        <div className="flex justify-center items-center">
                                            <ChartContainer config={chartConfig} className="mx-auto aspect-square h-40 w-40">
                                                <RadialBarChart data={[{ name: 'Score', value: seoResult.contentScore, fill: 'hsl(var(--primary))' }]} startAngle={-270} endAngle={90} innerRadius="70%" outerRadius="100%" barSize={16} cy="55%">
                                                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                                                    <PolarGrid gridType="circle" stroke="none" />
                                                    <RadialBar dataKey="value" background={{ fill: 'hsl(var(--muted))' }} cornerRadius={10} />
                                                    <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-3xl font-bold">{seoResult.contentScore.toFixed(0)}</text>
                                                    <text x="50%" y="70%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-xs">Score</text>
                                                </RadialBarChart>
                                            </ChartContainer>
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="font-semibold flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" /> Recommendations</h4>
                                            <ul className="list-disc space-y-1 pl-5 text-sm">
                                            {seoResult.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                                            </ul>
                                        </div>
                                        <Separator />
                                        <div className="space-y-3">
                                            <h4 className="font-semibold flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> NLP Keywords to Add</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {seoResult.nlpKeywords.map(kw => <Badge key={kw} variant="secondary">{kw}</Badge>)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="ai" className="py-4">
                        <ScrollArea className="h-96 pr-4">
                           <div className="space-y-4 text-sm">
                                <h3 className="font-semibold text-foreground">AI Content Detection</h3>
                                <Button onClick={runAiDetection} disabled={isAnalyzingAi} className="w-full">
                                    {isAnalyzingAi && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Analyze for AI Content
                                </Button>
                                {isAnalyzingAi && <p className="text-xs text-center text-muted-foreground">AI is checking for robotic text...</p>}
                                
                                {aiResult && (
                                     <div className="space-y-4 pt-4 animate-fadeIn">
                                        <Label>Humanization Score: {aiResult.humanizationScore}/100</Label>
                                        <Progress value={aiResult.humanizationScore} className="mt-2" />
                                        <p className="text-xs text-muted-foreground mt-1">A higher score means more human-like content.</p>
                                        <Separator/>
                                        <Label>Overall Analysis</Label>
                                        <p className="text-sm text-foreground mt-2 p-3 bg-muted/50 rounded-md">{aiResult.overallAnalysis}</p>
                                        <Separator/>
                                        <h4 className="font-semibold flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" /> Humanize Content</h4>
                                        <p className="text-xs text-muted-foreground">Automatically rewrite the entire article to be more human-like, based on the suggestions above.</p>
                                        <Button onClick={runHumanize} disabled={isHumanizing} className="w-full" variant="secondary">
                                            {isHumanizing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Rewrite with AI
                                        </Button>
                                     </div>
                                )}
                           </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="plagiarism" className="py-4">
                        <ScrollArea className="h-96 pr-4">
                           <div className="space-y-4 text-sm">
                                <h3 className="font-semibold text-foreground">Originality Check</h3>
                                <Button onClick={runPlagiarismCheck} disabled={isCheckingPlagiarism} className="w-full">
                                    {isCheckingPlagiarism && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Check for Plagiarism
                                </Button>
                                {isCheckingPlagiarism && <p className="text-xs text-center text-muted-foreground">Scanning for unoriginal content...</p>}

                                {plagiarismResult && (
                                     <div className="space-y-4 pt-4 animate-fadeIn">
                                        <Label>Originality Score: {plagiarismResult.originalityScore}/100</Label>
                                        <Progress value={plagiarismResult.originalityScore} className="mt-2" />
                                        <p className="text-xs text-muted-foreground mt-1">A higher score means more unique content.</p>
                                        <Separator/>
                                        <Label>Overall Analysis</Label>
                                        <p className="text-sm text-foreground mt-2 p-3 bg-muted/50 rounded-md">{plagiarismResult.analysis}</p>
                                        <Separator/>
                                        {plagiarismResult.matchedSegments.length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="font-semibold flex items-center gap-2">Potentially Unoriginal Segments</h4>
                                                {plagiarismResult.matchedSegments.map((item, index) => (
                                                    <div key={index} className="space-y-2 p-3 border rounded-lg">
                                                        <blockquote className="text-xs mt-1 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border-l-2 border-yellow-400 italic">"{item.segment}"</blockquote>
                                                        <p className="text-xs flex items-start gap-2 text-muted-foreground"><Sparkles className="h-3 w-3 shrink-0 mt-0.5 text-primary"/> <span className="font-semibold text-foreground mr-1">Source Type:</span> {item.sourceType}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                     </div>
                                )}
                           </div>
                        </ScrollArea>
                    </TabsContent>
                 </Tabs>
            </CardContent>
            </Card>
        </div>
        </div>
    </div>
  );
}
