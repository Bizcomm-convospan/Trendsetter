
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
import { User, CreditCard, BarChart2, KeyRound, Copy, RefreshCw, Loader2, FileText, TrendingUp, ScanText, Cpu, BrainCircuit, MessageCircleQuestion, Target, Zap, Palette, BookText } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { handleSaveWebhookUrl, type ActionResponse } from '@/app/actions';
import { Textarea } from '../ui/textarea';


export function ProfileClient() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [apiKey, setApiKey] = useState('tp_live_********************1234');
  
  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    toast({ title: "Profile Updated", description: "Your changes have been saved successfully." });
  };
  
  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast({ title: "API Key Copied", description: "Your API key has been copied to the clipboard." });
  };
  
  const handleRegenerateKey = () => {
    setApiKey(`tp_live_********************${Math.floor(Math.random() * 9000) + 1000}`);
    toast({ title: "API Key Regenerated", description: "A new API key has been generated." });
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
        {/* Left Column - Profile Info & Brand Voice */}
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
                        <Input id="name" defaultValue="Test User" disabled={isSaving} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue="test@example.com" disabled={isSaving} />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave} className="w-full" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>
        </div>

        {/* Right Column - Brand, AI, Subscription */}
        <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Palette className="text-primary" /> Global Brand Voice</CardTitle>
                    <CardDescription>Define your brand voice once. The AI will use it for all future content generation.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="brandVoice">Brand Voice Description</Label>
                        <Textarea id="brandVoice" name="brandVoice" placeholder="e.g., 'Our brand is witty, informal, and uses pop culture references. We avoid corporate jargon...'" rows={4} />
                    </div>
                </CardContent>
            </Card>

             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BookText className="text-primary" /> Custom Content Guidelines</CardTitle>
                    <CardDescription>Set rules for the AI to follow, such as topics to avoid or specific CTAs to include.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="customGuidelines">Content Rules & Guidelines</Label>
                        <Textarea id="customGuidelines" name="customGuidelines" placeholder="e.g., 'Always end articles with a question. Never mention competitor X. Include a link to our pricing page...'" rows={4} />
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Cpu /> AI Model Configuration</CardTitle>
                    <CardDescription>Select the underlying AI model for content generation and analysis.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="ai-model">Active Model</Label>
                        <Select defaultValue="google-ai">
                            <SelectTrigger id="ai-model" className="w-full sm:w-[280px]">
                                <SelectValue placeholder="Select a model" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Supported Models</SelectLabel>
                                    <SelectItem value="google-ai">Google Gemini</SelectItem>
                                    <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                                    <SelectItem value="anthropic" disabled>Anthropic Claude 3 (Coming Soon)</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Note: Using models other than Google Gemini requires setting the appropriate API key (e.g., OPENAI_API_KEY) in the project's environment variables.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CreditCard /> Subscription & Billing</CardTitle>
                    <CardDescription>Manage your plan and payment details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <p className="font-semibold text-foreground">Current Plan: Pro</p>
                            <p className="text-sm text-muted-foreground">Renews on July 20, 2025.</p>
                        </div>
                        <Button asChild variant="outline">
                            <Link href="/pricing">Change Plan</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
