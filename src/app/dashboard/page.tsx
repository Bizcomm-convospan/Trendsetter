
'use client';

import { WorkflowGuide } from '@/components/dashboard/WorkflowGuide';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { TrendingUp, MessageCircleQuestion, Target, BrainCircuit, Wand2, ScanText, UploadCloud, ArrowRight } from 'lucide-react';

const toolCards = [
  {
    href: '/dashboard/trends',
    icon: TrendingUp,
    title: 'Trend Discovery',
    description: 'Find emerging topics and keywords before they become mainstream.',
    cta: 'Discover Trends',
  },
  {
    href: '/dashboard/question-spy',
    icon: MessageCircleQuestion,
    title: 'Question Spy',
    description: 'Uncover the exact questions your audience is asking on Google and Reddit.',
    cta: 'Find Questions',
  },
  {
    href: '/dashboard/competitor-analyzer',
    icon: Target,
    title: 'Competitor Analyzer',
    description: 'Analyze competitor articles to find content gaps and strategic opportunities.',
    cta: 'Analyze Competitors',
  },
  {
    href: '/dashboard/content-creation',
    icon: UploadCloud,
    title: 'WordPress Publisher',
    description: 'Generate and publish SEO-optimized articles directly to your website.',
    cta: 'Go to Publisher',
  },
  {
    href: '/dashboard/answer-the-ai',
    icon: BrainCircuit,
    title: 'Answer the AI',
    description: 'Turn any topic into a structured set of content angles for comprehensive articles.',
    cta: 'Get Angles',
  },
  {
    href: '/dashboard/ai-detector',
    icon: Wand2,
    title: 'AI Detector & Humanizer',
    description: 'Analyze content for a "humanization score" and rewrite text to sound natural.',
    cta: 'Analyze Content',
  },
];


export default function DashboardPage() {
  const handleTabChange = (tab: string) => {
    // This function is a placeholder now that the guide uses direct links.
    // It could be used in the future to scroll to specific sections if the dashboard becomes a single long page.
    console.log(`Navigation requested for: ${tab}`);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome to Trendsetter Pro</h1>
        <p className="text-lg text-muted-foreground">
          Your toolkit of specialized AI agents for dominating content strategy and SEO.
        </p>
      </header>

      <WorkflowGuide onTabChange={handleTabChange} />

      <section>
        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4">Your AI Agents</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {toolCards.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card key={tool.title} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-6 w-6 text-primary" />
                    {tool.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription>{tool.description}</CardDescription>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="secondary" className="w-full">
                    <Link href={tool.href}>
                      {tool.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

    </div>
  );
}
