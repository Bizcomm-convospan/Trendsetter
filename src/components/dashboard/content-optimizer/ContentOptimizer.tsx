

'use client';

import { useState, useTransition, useMemo, useEffect, useRef, useCallback } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, CheckCircle, FileText, BarChart, BookOpen, Lightbulb, Languages, Edit, Type, Palette, Bold, Italic, Underline, List, Heading2, Heading3, Save, ArrowLeft, Heading1, ShieldCheck, BrainCircuit, ScanSearch, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type ActionResponse, handleAnalyzeContentForSeo, handleUpdateArticleContent, handleAiDetection, handlePlagiarismCheck, handleGenerateHumanizedContent } from '@/app/actions';
import { type ContentOptimizerOutput } from '@/ai/flows/content-optimizer-flow';
import { type AiDetectorOutput } from '@/ai/flows/ai-detector-flow';
import { type PlagiarismCheckerOutput } from '@/ai/flows/plagiarism-checker-flow';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChartContainer, ChartConfig } from '@/components/ui/chart';
import { RadialBarChart, RadialBar, PolarGrid, PolarAngleAxis } from 'recharts';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Timestamp } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';


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
  meta: {
      yoast: { title: string; description: string; };
      aioseo: { title: string; description: string; };
  }
}

interface ContentOptimizerProps {
    article: Article;
    onBack: () => void;
}

const EditorToolbar = ({ onCommand }: { onCommand: (command: string, value?: string) => void }) => {
    return (
        <div className="flex flex-wrap items-center gap-1 border rounded-md p-1 bg-muted">
            <ToggleGroup type="single" size="sm" onValueChange={(value) => value && onCommand('formatBlock', value)}>
                <ToggleGroupItem value="h2" aria-label="Toggle H2"><Heading2 className="h-4 w-4" /></ToggleGroupItem>
                <ToggleGroupItem value="h3" aria-label="Toggle H3"><Heading3 className="h-4 w-4" /></ToggleGroupItem>
            </ToggleGroup>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <ToggleGroup type="multiple" size="sm">
                <ToggleGroupItem value="bold" aria-label="Toggle bold" onClick={() => onCommand('bold')}><Bold className="h-4 w-4" /></ToggleGroupItem>
                <ToggleGroupItem value="italic" aria-label="Toggle italic" onClick={() => onCommand('italic')}><Italic className="h-4 w-4" /></ToggleGroupItem>
                <ToggleGroupItem value="underline" aria-label="Toggle underline" onClick={() => onCommand('underline')}><Underline className="h-4 w-4" /></ToggleGroupItem>
            </ToggleGroup>
             <Separator orientation="vertical" className="h-6 mx-1" />
             <Button variant="ghost" size="sm" onClick={() => onCommand('insertUnorderedList')}><List className="h-4 w-4" /></Button>
             <Button variant="ghost" size="sm" onClick={() => onCommand('createLink', window.prompt("Enter URL") || undefined)}><LinkIcon className="h-4 w-4" /></Button>
             <Button variant="ghost" size="sm" onClick={() => onCommand('insertImage', window.prompt("Enter image URL") || undefined)}><ImageIcon className="h-4 w-4" /></Button>
        </div>
    )
}

interface LocalAnalysis {
  wordCount: number;
  paragraphCount: number;
  headingCount: number;
  imageCount: number;
}

interface KeywordMetric {
  keyword: string;
  count: number;
  target: number;
}

export function ContentOptimizer({ article, onBack }: ContentOptimizerProps) {
  const [title, setTitle] = useState(article.title);
  const [description, setDescription] = useState(article.meta.yoast.description);
  const [content, setContent] = useState(article.content);
  const [keyword, setKeyword] = useState(article.topic);
  
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSaving, startSavingTransition] = useTransition();

  const [isAnalyzingSeo, startSeoTransition] = useTransition();
  const [seoResult, setSeoResult] = useState<ContentOptimizerOutput | null>(null);

  useEffect(() => {
    // Set initial content for the editor when the component mounts
    if (editorRef.current) {
      editorRef.current.innerHTML = article.content;
    }
  }, [article.content]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const handleManualContentUpdate = (e: React.FormEvent<HTMLDivElement>) => {
    setContent(e.currentTarget.innerHTML);
  };

  const runSeoAnalysis = useCallback(() => {
    setSeoResult(null);
    const formData = new FormData();
    formData.append('content', content);
    formData.append('keyword', keyword);
    
    startSeoTransition(async () => {
      const response = await handleAnalyzeContentForSeo(formData);
      if (response.data) {
        setSeoResult(response.data);
        toast({ title: 'SEO Analysis Complete!', description: 'Your content has been scored.' });
      } else if (response.error) {
        toast({ variant: 'destructive', title: 'SEO Analysis Failed', description: response.error });
      }
    });
  }, [content, keyword, toast]);

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
    if(!value && (command === 'createLink' || command === 'insertImage')) return;
    document.execCommand(command, false, value);
    if(editorRef.current) {
        editorRef.current.focus();
        setContent(editorRef.current.innerHTML); // Update state after command
    }
  };

  const localAnalysis: LocalAnalysis = useMemo(() => {
    const plainText = editorRef.current?.innerText || '';
    const words = plainText.match(/\b\w+\b/g) || [];
    const paragraphs = plainText.split(/\n+/).filter(p => p.trim().length > 0);
    const headings = content.match(/<h[1-3]>/gi) || [];
    const images = content.match(/<img/gi) || [];

    return {
      wordCount: words.length,
      paragraphCount: paragraphs.length,
      headingCount: headings.length,
      imageCount: images.length
    };
  }, [content]);
  
  const keywordMetrics: KeywordMetric[] = useMemo(() => {
      if (!seoResult?.nlpKeywords) return [];
      const plainText = editorRef.current?.innerText.toLowerCase() || '';

      return seoResult.nlpKeywords.map(kw => {
        const regex = new RegExp(`\\b${kw.toLowerCase()}\\b`, 'g');
        const count = (plainText.match(regex) || []).length;
        // Mock target, in a real app this would come from the AI
        const target = Math.ceil(localAnalysis.wordCount / 100); 
        return { keyword: kw, count, target: target > 0 ? target : 1 };
      });
  }, [content, seoResult, localAnalysis.wordCount]);

  const chartConfig = useMemo(() => ({
    value: { label: 'Score' },
    score: { label: 'Content Score', color: 'hsl(var(--primary))' },
  }), []);

  return (
    <div className="space-y-4 p-4">
        <header className="flex justify-between items-center">
            <Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4"/> Back to Hub</Button>
            <div className='flex items-center gap-2'>
                <Button variant="outline" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Editor */}
        <div className="lg:col-span-2 space-y-4">
            <Card className="shadow-lg">
                <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-xs font-semibold uppercase text-muted-foreground">Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="text-2xl font-bold h-auto p-0 border-none focus-visible:ring-0" />
                         <p className="text-xs text-muted-foreground text-right">{title.length} / 70</p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-xs font-semibold uppercase text-muted-foreground">Meta Description</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="border-none p-0 focus-visible:ring-0" />
                        <p className="text-xs text-muted-foreground text-right">{description.length} / 160</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="shadow-lg">
                <CardContent className="p-2 space-y-2">
                    <EditorToolbar onCommand={handleEditorCommand} />
                    <div
                        ref={editorRef}
                        id="content"
                        contentEditable={!isAnalyzingSeo}
                        onInput={handleManualContentUpdate}
                        className="prose dark:prose-invert max-w-none min-h-[600px] w-full rounded-md border border-input bg-card px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </CardContent>
            </Card>
        </div>

        {/* Right Column: Analysis Sidebar */}
        <aside className="lg:col-span-1 space-y-6 sticky top-24">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Content Assistant</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Tabs defaultValue="guidelines" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 px-2">
                            <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
                            <TabsTrigger value="facts">Facts</TabsTrigger>
                            <TabsTrigger value="outline">Outline</TabsTrigger>
                        </TabsList>
                        <TabsContent value="guidelines" className="pt-4 px-4">
                            <ScrollArea className="h-[70vh] pr-4">
                                <div className="space-y-6">
                                    {/* Score */}
                                    <div className="text-center">
                                        <h3 className="font-semibold text-foreground mb-2">Content Score</h3>
                                        {isAnalyzingSeo && !seoResult ? <Skeleton className='h-40 w-40 rounded-full mx-auto' /> :
                                            seoResult ? (
                                                <ChartContainer config={chartConfig} className="mx-auto aspect-square h-40 w-40">
                                                    <RadialBarChart data={[{ name: 'Score', value: seoResult.contentScore, fill: 'hsl(var(--primary))' }]} startAngle={-270} endAngle={90} innerRadius="70%" outerRadius="100%" barSize={16} cy="55%">
                                                        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                                                        <PolarGrid gridType="circle" stroke="none" />
                                                        <RadialBar dataKey="value" background={{ fill: 'hsl(var(--muted))' }} cornerRadius={10} />
                                                        <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-3xl font-bold">{seoResult.contentScore.toFixed(0)}</text>
                                                    </RadialBarChart>
                                                </ChartContainer>
                                            ) : <Button onClick={runSeoAnalysis}>Run Analysis</Button>
                                        }
                                    </div>
                                    <Separator/>
                                    {/* Content Structure */}
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-4">Content Structure</h3>
                                        <div className="grid grid-cols-2 gap-4 text-center">
                                            <div>
                                                <p className="font-bold text-xl">{localAnalysis.wordCount}</p>
                                                <p className="text-xs text-muted-foreground">Words</p>
                                            </div>
                                            <div>
                                                <p className="font-bold text-xl">{localAnalysis.headingCount}</p>
                                                <p className="text-xs text-muted-foreground">Headings</p>
                                            </div>
                                            <div>
                                                <p className="font-bold text-xl">{localAnalysis.paragraphCount}</p>
                                                <p className="text-xs text-muted-foreground">Paragraphs</p>
                                            </div>
                                             <div>
                                                <p className="font-bold text-xl">{localAnalysis.imageCount}</p>
                                                <p className="text-xs text-muted-foreground">Images</p>
                                            </div>
                                        </div>
                                    </div>
                                    <Separator/>
                                    {/* Terms */}
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">Terms</h3>
                                        <div className="relative">
                                            <ScanSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="Search terms..." className="pl-9" />
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {keywordMetrics.map(kw => (
                                                <Badge key={kw.keyword} variant={kw.count > 0 ? "default" : "secondary"}>
                                                    {kw.keyword} {kw.count}/{kw.target}
                                                </Badge>
                                            ))}
                                            {!seoResult && <p className="text-xs text-muted-foreground">Run analysis to see keyword suggestions.</p>}
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        </TabsContent>
                         <TabsContent value="facts" className="pt-4 px-4">
                            <p className="text-sm text-muted-foreground">Fact-checking and outline features are coming soon.</p>
                         </TabsContent>
                         <TabsContent value="outline" className="pt-4 px-4">
                             <p className="text-sm text-muted-foreground">Fact-checking and outline features are coming soon.</p>
                         </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </aside>
        </div>
    </div>
  );
}
