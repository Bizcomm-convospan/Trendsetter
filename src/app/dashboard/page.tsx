
'use client';

import { WorkflowGuide } from '@/components/dashboard/WorkflowGuide';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MessageCircleQuestion, BrainCircuit, Wand2, ScanText, ArrowRight, Target, Key, TrendingUp, Search, FileSignature, BarChart2, Edit, Mail } from 'lucide-react';

const toolCards = [
  {
    href: '/dashboard/content-creation',
    icon: Wand2,
    title: 'Content Creation',
    description: 'Unified hub to discover trends, generate articles, and publish to your website.',
    cta: 'Start Creating',
    group: 'creation'
  },
  {
    href: '/dashboard/performance',
    icon: TrendingUp,
    title: 'Content Performance',
    description: 'Track article performance and use the AI Audit to get actionable recommendations.',
    cta: 'Analyze Performance',
    group: 'performance'
  },
  {
    href: '/dashboard/keyword-strategy',
    icon: Key,
    title: 'Keyword Strategy',
    description: 'Generate keyword clusters, long-tail variations, and related questions for any topic.',
    cta: 'Build Strategy',
    group: 'research'
  },
  {
    href: '/dashboard/question-spy',
    icon: MessageCircleQuestion,
    title: 'Question Spy',
    description: 'Uncover the exact questions your audience is asking on Google and Reddit.',
    cta: 'Find Questions',
    group: 'research'
  },
  {
    href: '/dashboard/competitor-analyzer',
    icon: Target,
    title: 'Competitor Analyzer',
    description: 'Analyze competitor articles to find content gaps and strategic opportunities.',
    cta: 'Analyze Competitors',
    group: 'research'
  },
  {
    href: '/dashboard/answer-the-ai',
    icon: BrainCircuit,
    title: 'Answer the AI',
    description: 'Turn any topic into a structured set of content angles for comprehensive articles.',
    cta: 'Get Angles',
    group: 'research'
  },
   {
    href: '/dashboard/email-outreach',
    icon: Mail,
    title: 'Email Outreach',
    description: 'Generate personalized, multi-step email sequences for sales and content promotion.',
    cta: 'Create Sequence',
    group: 'performance'
  },
  {
    href: '/dashboard/content-optimizer',
    icon: Edit,
    title: 'Content Optimizer',
    description: 'Get a real-time Content Score, NLP keywords, and suggestions to improve your on-page SEO.',
    cta: 'Optimize Content',
    group: 'creation'
  },
  {
    href: '/dashboard/ai-detector',
    icon: ScanText,
    title: 'AI Detector',
    description: 'Analyze content for a "humanization score" and get suggestions for improvement.',
    cta: 'Analyze Content',
    group: 'creation'
  },
  {
      href: '/dashboard/humanizer',
      icon: Wand2,
      title: 'AI Humanizer',
      description: 'Rewrite and transform existing text to sound more natural and engaging.',
      cta: 'Refine Content',
      group: 'creation'
  }
];

const groups = [
    { id: 'research', title: 'Content Strategy & Research', icon: Search },
    { id: 'creation', title: 'Content Creation & Refinement', icon: FileSignature },
    { id: 'performance', title: 'Performance & Outreach', icon: BarChart2 }
]


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

      <section className="space-y-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4">Your AI Agents</h2>
        {groups.map(group => (
            <div key={group.id} className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-foreground/90">
                    <group.icon className="h-6 w-6 text-primary"/>
                    {group.title}
                </h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {toolCards.filter(tool => tool.group === group.id).map((tool) => {
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
            </div>
        ))}
        </section>

    </div>
  );
}
