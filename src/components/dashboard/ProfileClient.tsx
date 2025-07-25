
'use client';

import { useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { User, CreditCard, BarChart2, KeyRound, Copy, RefreshCw, Loader2, FileText, TrendingUp, ScanText, Cpu, BrainCircuit, MessageCircleQuestion, Target, Zap, Palette, BookText, Video } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { handleSaveWebhookUrl, type ActionResponse, handleSaveBrandSettings } from '@/app/actions';
import { Textarea } from '../ui/textarea';


const planLimits = {
    pro: {
        articles: 25,
        trends: Infinity,
        competitorReports: Infinity,
        videos: 10,
    }
}

function SaveButton({ children }: { children: React.ReactNode }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </Button>
    )
}


export function ProfileClient() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('tp_live_********************1234');
  
  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast({ title: "API Key Copied", description: "Your API key has been copied to the clipboard." });
  };
  
  const handleRegenerateKey = () => {
    setApiKey(`tp_live_********************${Math.floor(Math.random() * 9000) + 1000}`);
    toast({ title: "API Key Regenerated", description: "A new API key has been generated." });
  };

  const saveBrandSettingsAction = async (formData: FormData) => {
    const response = await handleSaveBrandSettings(formData);
    if(response.data) {
        toast({ title: "Success", description: "Brand settings saved." });
    } else {
        toast({ variant: 'destructive', title: 'Error', description: response.error });
    }
  };


  return (
    <div className="space-y-8">
       <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile & Settings</h1>
        <p className="text-lg text-muted-foreground">
          Manage your account details, subscription, and app usage.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column - Profile Info & API Key */}
        <div className="lg:col-span-1 space-y-8">
            <Card className="shadow-lg">
                <CardHeader className="text-center items-center">
                    <Avatar className="h-24 w-24 mb-4 border-4 border-primary/20">
                        <AvatarImage src="https://placehold.co/100x100.png" alt="User profile avatar" data-ai-hint="profile avatar" />
                        <AvatarFallback>TP</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-2xl">Test User</CardTitle>
                    <CardDescription>test@example.com</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue="Test User" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue="test@example.com" />
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><KeyRound /> API Key</CardTitle>
                    <CardDescription>Use this key for programmatic access to the Trendsetter Pro API.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Input value={apiKey} readOnly />
                        <Button variant="outline" size="icon" onClick={handleCopyKey}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button variant="secondary" className="w-full" onClick={handleRegenerateKey}>
                       <RefreshCw className="mr-2"/> Regenerate Key
                    </Button>
                </CardContent>
            </Card>
        </div>

        {/* Right Column - Brand, AI, Subscription */}
        <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CreditCard /> Subscription & Usage</CardTitle>
                    <CardDescription>You are currently on the <span className="font-bold text-primary">Pro Plan</span>. Your limits reset on July 20, 2025.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Dummy data for usage */}
                        <UsageMeter icon={FileText} label="Article Generations" used={12} total={planLimits.pro.articles} />
                        <UsageMeter icon={Video} label="Video Generations" used={4} total={planLimits.pro.videos} />
                        <UsageMeter icon={TrendingUp} label="Trend Searches" used={87} total={planLimits.pro.trends} />
                        <UsageMeter icon={Target} label="Competitor Reports" used={23} total={planLimits.pro.competitorReports} />
                    </div>
                </CardContent>
                 <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/pricing">Manage Subscription</Link>
                    </Button>
                </CardFooter>
            </Card>

            <form action={saveBrandSettingsAction}>
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Palette /> Global AI Settings</CardTitle>
                        <CardDescription>Define your brand voice and guidelines once. The AI will use them for all future content generation.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="brandVoice">Brand Voice Description</Label>
                            <Textarea id="brandVoice" name="brandVoice" placeholder="e.g., 'Our brand is witty, informal, and uses pop culture references. We avoid corporate jargon...'" rows={3} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="customGuidelines">Custom Content Guidelines</Label>
                            <Textarea id="customGuidelines" name="customGuidelines" placeholder="e.g., 'Always end articles with a question. Never mention competitor X...'" rows={3} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ai-model">Default AI Model</Label>
                             <Select name="modelProvider" defaultValue="google-ai">
                                <SelectTrigger id="ai-model" className="w-full">
                                    <SelectValue placeholder="Select a model" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Supported Models</SelectLabel>
                                        <SelectItem value="google-ai">Google Gemini (Recommended)</SelectItem>
                                        <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                             <p className="text-xs text-muted-foreground">
                                Using models other than Google Gemini requires setting the appropriate API key (e.g., OPENAI_API_KEY) in the project's environment variables.
                            </p>
                        </div>
                    </CardContent>
                     <CardFooter>
                        <SaveButton>Save AI Settings</SaveButton>
                    </CardFooter>
                </Card>
            </form>
        </div>
      </div>
    </div>
  );
}

function UsageMeter({ icon: Icon, label, used, total }: { icon: React.ElementType, label: string, used: number, total: number}) {
    const percentage = total === Infinity ? 100 : Math.min((used / total) * 100, 100);
    const isUnlimited = total === Infinity;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <p className="font-medium text-muted-foreground flex items-center gap-2"><Icon className="h-4 w-4"/> {label}</p>
                <p className="font-semibold text-foreground">
                    {isUnlimited ? 'Unlimited' : `${used.toLocaleString()} / ${total.toLocaleString()}`}
                </p>
            </div>
            <Progress value={percentage} aria-label={`${label} usage`} />
        </div>
    )
}
