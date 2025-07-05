
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { User, CreditCard, BarChart2, KeyRound, Copy, RefreshCw, Loader2, FileText, TrendingUp, ScanText, Cpu, BrainCircuit, MessageCircleQuestion, Target } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

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
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-8">
            <Card className="shadow-lg">
                <CardHeader className="text-center items-center">
                    <Avatar className="h-24 w-24 mb-4 border-4 border-primary/20">
                        <AvatarImage src="https://placehold.co/100x100.png" alt="@user" data-ai-hint="profile avatar" />
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

        {/* Right Column - Subscription, Usage, API */}
        <div className="lg:col-span-2 space-y-8">
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
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <p className="font-semibold text-foreground">Payment Method</p>
                            <p className="text-sm text-muted-foreground">Visa ending in •••• 4242</p>
                        </div>
                        <Button variant="outline" disabled>Update Payment</Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart2 /> Current Usage</CardTitle>
                    <CardDescription>Your usage statistics for the current billing cycle. Resets on July 20, 2025.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-medium"><TrendingUp className="h-4 w-4" /> Trend Discoveries</Label>
                        <Progress value={25} />
                        <p className="text-sm text-muted-foreground">5 of 20 searches used.</p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-medium"><MessageCircleQuestion className="h-4 w-4" /> Question Spy Searches</Label>
                        <Progress value={60} />
                        <p className="text-sm text-muted-foreground">6 of 10 searches used.</p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-medium"><Target className="h-4 w-4" /> Competitor Analyses</Label>
                        <Progress value={20} />
                        <p className="text-sm text-muted-foreground">1 of 5 reports used.</p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-medium"><BrainCircuit className="h-4 w-4" /> "Answer the AI" Generations</Label>
                        <Progress value={50} />
                        <p className="text-sm text-muted-foreground">10 of 20 generations used.</p>
                    </div>
                    <Separator />
                     <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-medium"><FileText className="h-4 w-4" /> Content Generation</Label>
                        <Progress value={40} />
                        <p className="text-sm text-muted-foreground">10 of 25 articles used.</p>
                    </div>
                     <Separator />
                     <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-medium"><ScanText className="h-4 w-4" /> AI Detector Analyses</Label>
                        <Progress value={80} />
                        <p className="text-sm text-muted-foreground">40 of 50 analyses used.</p>
                    </div>
                </CardContent>
            </Card>
            
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><KeyRound /> API Access</CardTitle>
                    <CardDescription>Use your API key for custom integrations. Available on Pro plan and higher.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <Input value={apiKey} readOnly className="font-mono text-sm" />
                        <Button variant="outline" size="icon" onClick={handleCopyKey} aria-label="Copy API Key">
                            <Copy className="h-4 w-4" />
                        </Button>
                         <Button variant="outline" size="icon" onClick={handleRegenerateKey} aria-label="Regenerate API Key">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
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
                        <Select defaultValue="gemini" disabled>
                            <SelectTrigger id="ai-model" className="w-full sm:w-[280px]">
                                <SelectValue placeholder="Select a model" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Supported Models</SelectLabel>
                                    <SelectItem value="gemini">Google Gemini (Active)</SelectItem>
                                    <SelectItem value="openai">OpenAI GPT-4 (Requires separate API key)</SelectItem>
                                    <SelectItem value="anthropic">Anthropic Claude 3 (Requires separate API key)</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Model switching is a feature planned for future updates. The app currently uses Google Gemini.
                        </p>
                    </div>
                </CardContent>
            </Card>

        </div>
      </div>
    </div>
  );
}
