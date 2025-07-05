
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, FileText, ArrowRight, BrainCircuit, UploadCloud } from "lucide-react";

interface WorkflowStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  href: string;
}

const steps: WorkflowStep[] = [
  {
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    title: 'Step 1: Discover Trends',
    description: 'Identify emerging topics and stay ahead of the curve. Find the fuel for your content engine.',
    cta: 'Discover Now',
    href: '/dashboard/trends'
  },
  {
    icon: <BrainCircuit className="h-8 w-8 text-accent" />,
    title: 'Step 2: Get Content Angles',
    description: 'Use "Answer the AI" to generate strategic questions (Who, What, etc.) to ensure comprehensive coverage.',
    cta: 'Get Angles',
    href: '/dashboard/answer-the-ai'
  },
  {
    icon: <FileText className="h-8 w-8 text-purple-500" />,
    title: 'Step 3: Generate Article',
    description: 'Transform your topic into a high-quality, SEO-optimized article in minutes.',
    cta: 'Create Content',
    href: '/dashboard/content-creation'
  },
  {
    icon: <UploadCloud className="h-8 w-8 text-green-500" />,
    title: 'Step 4: Refine & Publish',
    description: 'Analyze, humanize, and then publish your completed article directly to WordPress with one click.',
    cta: 'Go to Publisher',
    href: '/dashboard/content-creation'
  }
];

export function WorkflowGuide({ onTabChange }: { onTabChange: (tab: string) => void }) {
  return (
    <Card className="shadow-lg animate-fadeIn">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Your Path to Growth</CardTitle>
        <CardDescription>Follow this workflow to get the most out of Trendsetter Pro.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center rounded-lg border bg-card p-6 text-center transition-all hover:border-primary hover:shadow-lg">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                {step.icon}
              </div>
              <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 flex-grow text-sm text-muted-foreground">{step.description}</p>
              <Button asChild variant="ghost" className="mt-4 text-primary hover:text-primary/90">
                <Link href={step.href}>
                  {step.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
