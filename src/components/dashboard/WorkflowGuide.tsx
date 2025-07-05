
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Wand2, ArrowRight, Target, Users as UsersIcon } from "lucide-react";

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
    title: 'Step 1: Ideation & Discovery',
    description: 'Find emerging topics with the Trend Agent or uncover questions your audience is asking with the Question Spy.',
    cta: 'Start Research',
    href: '/dashboard/content-creation'
  },
  {
    icon: <Target className="h-8 w-8 text-accent" />,
    title: 'Step 2: Strategy & Analysis',
    description: 'Analyze competitors to find content gaps or generate strategic angles for your topic with Answer the AI.',
    cta: 'Build Strategy',
    href: '/dashboard/competitor-analyzer'
  },
  {
    icon: <Wand2 className="h-8 w-8 text-purple-500" />,
    title: 'Step 3: Create & Refine',
    description: 'Generate, humanize, optimize headlines, and publish your SEO-ready article from one unified hub.',
    cta: 'Go to Creator Hub',
    href: '/dashboard/content-creation'
  },
  {
    icon: <UsersIcon className="h-8 w-8 text-green-500" />,
    title: 'Step 4: Prospect & Outreach',
    description: 'Switch to sales mode. Extract company and contact data from any website to find new leads.',
    cta: 'Find Prospects',
    href: '/dashboard/prospecting'
  }
];

export function WorkflowGuide() {
  return (
    <Card className="shadow-lg animate-fadeIn">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Your Path to Growth</CardTitle>
        <CardDescription>Follow this workflow to get the most out of Trendsetter Pro's AI agents.</CardDescription>
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
