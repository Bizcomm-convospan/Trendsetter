
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Wand2, ScanText, FileText, UploadCloud, BarChart3, BrainCircuit, MessageCircleQuestion, Target } from 'lucide-react';

const features = [
  {
    icon: <BarChart3 className="mb-4 h-10 w-10 text-primary" />,
    title: 'Trend Discovery',
    description: 'Identify emerging trends and hot topics in your industry before they peak. Stay ahead of the curve.',
  },
  {
    icon: <MessageCircleQuestion className="mb-4 h-10 w-10 text-primary" />,
    title: 'Question Spy',
    description: "Discover the real questions your audience is asking on Google, Reddit, and Quora to create content that resonates.",
  },
  {
    icon: <Target className="mb-4 h-10 w-10 text-primary" />,
    title: 'Competitor Analyzer',
    description: 'Analyze competitor articles to find content gaps and strategic opportunities to outperform them in search rankings.',
  },
  {
    icon: <BrainCircuit className="mb-4 h-10 w-10 text-primary" />,
    title: 'Answer the AI',
    description: 'Go beyond keywords. Generate strategic content angles (Who, What, When, Where, How) to create comprehensive articles.',
  },
  {
    icon: <FileText className="mb-4 h-10 w-10 text-primary" />,
    title: 'Content Generation',
    description: 'Craft engaging, SEO-friendly articles, complete with a Headline Optimizer to maximize click-through rates.',
  },
  {
    icon: <Wand2 className="mb-4 h-10 w-10 text-primary" />,
    title: 'AI Humanizer & Detector',
    description: "Refine AI text to sound natural and analyze content for a 'humanization score' with improvement suggestions.",
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-muted">
      <div className="container py-16 md:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12 md:mb-16">
          <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl text-foreground">Platform Features</h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Everything you need to supercharge your marketing and sales efforts with the power of AI.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
              <CardHeader>
                {feature.icon}
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
