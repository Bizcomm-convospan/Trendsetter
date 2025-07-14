
'use client';

import { WorkflowGuide } from '@/components/dashboard/WorkflowGuide';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MessageCircleQuestion, BrainCircuit, Wand2, ScanText, Users, ArrowRight, Target, Key } from 'lucide-react';

const toolCards = [
  {
    href: '/dashboard/content-creation',
    icon: Wand2,
    title: 'Content Creation Hub',
    description: 'Unified hub to discover trends, generate articles, and publish to your website.',
    cta: 'Start Creating',
  },
  {
    href: '/dashboard/keyword-strategy',
    icon: Key,
    title: 'Keyword Strategy Agent',
    description: 'Generate keyword clusters, long-tail variations, and related questions for any topic.',
    cta: 'Build Strategy',
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
    href: '/dashboard/prospecting',
    icon: Users,
    title: 'Autonomous Prospecting',
    description: 'Extract company and contact data from any website to find new sales leads.',
    cta: 'Find Prospects',
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
    icon: ScanText,
    title: 'AI Detector & Humanizer',
    description: 'Analyze content for a "humanization score" and rewrite text to sound natural.',
    cta: 'Analyze Content',
  },
];


export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome to Trendsetter Pro</h1>
        <p className="text-lg text-muted-foreground">
          Your toolkit of specialized AI agents for dominating content strategy and SEO.
        </p>
      </header>

      <WorkflowGuide />

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
