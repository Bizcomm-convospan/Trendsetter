'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, FileText, ArrowRight, Wand2, UploadCloud } from "lucide-react";

interface WorkflowStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  tabValue?: string;
  href?: string;
}

const steps: WorkflowStep[] = [
  {
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    title: 'Step 1: Discover Trends',
    description: 'Identify emerging topics and stay ahead of the curve. Find the fuel for your content engine.',
    cta: 'Discover Now',
    tabValue: 'trends'
  },
  {
    icon: <FileText className="h-8 w-8 text-accent" />,
    title: 'Step 2: Generate Content',
    description: 'Transform a trending topic into a high-quality, SEO-optimized article in minutes.',
    cta: 'Create Content',
    tabValue: 'content'
  },
  {
    icon: <Wand2 className="h-8 w-8 text-purple-500" />,
    title: 'Step 3: Refine & Analyze',
    description: 'Use the AI Detector to score, analyze, and humanize your article for maximum impact and quality.',
    cta: 'Analyze Content',
    href: '/dashboard/ai-detector'
  },
  {
    icon: <UploadCloud className="h-8 w-8 text-green-500" />,
    title: 'Step 4: Publish Content',
    description: 'Review your drafts and publish them directly to your integrated WordPress website with one click.',
    cta: 'Publish Now',
    tabValue: 'content'
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
              {step.href ? (
                <Button asChild variant="ghost" className="mt-4 text-primary hover:text-primary/90">
                  <Link href={step.href}>
                    {step.cta} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button onClick={() => onTabChange(step.tabValue!)} variant="ghost" className="mt-4 text-primary hover:text-primary/90">
                  {step.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
