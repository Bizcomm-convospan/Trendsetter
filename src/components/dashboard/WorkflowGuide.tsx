
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, FileText, Users, ArrowRight } from "lucide-react";

const steps = [
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
    icon: <Users className="h-8 w-8 text-green-500" />,
    title: 'Step 3: Find Prospects',
    description: 'Automatically extract contact information and leads from any company website.',
    cta: 'Find Prospects',
    tabValue: 'prospecting'
  }
];

export function WorkflowGuide({ onTabChange }: { onTabChange: (tab: string) => void }) {
  return (
    <Card className="shadow-lg animate-fadeIn">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Your Path to Growth</CardTitle>
        <CardDescription>Follow this simple 3-step workflow to get the most out of Trendsetter Pro.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center rounded-lg border bg-card p-6 text-center transition-all hover:border-primary hover:shadow-lg">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                {step.icon}
              </div>
              <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 flex-grow text-sm text-muted-foreground">{step.description}</p>
              <Button onClick={() => onTabChange(step.tabValue)} variant="ghost" className="mt-4 text-primary hover:text-primary/90">
                {step.cta} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
