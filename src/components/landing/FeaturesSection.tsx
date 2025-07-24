
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Wand2, ScanText, FileText, UploadCloud, BarChart3, BrainCircuit, MessageCircleQuestion, Target, TrendingUp, Video } from 'lucide-react';

const features = [
  {
    icon: <BarChart3 className="mb-4 h-10 w-10 text-primary" />,
    title: 'Trend Discovery Agent',
    description: 'Identify emerging trends and hot topics in your industry before they peak. Stay ahead of the curve.',
  },
  {
    icon: <MessageCircleQuestion className="mb-4 h-10 w-10 text-primary" />,
    title: 'Question Spy Agent',
    description: "Discover the real questions your audience is asking on Google, Reddit, and Quora to create content that resonates.",
  },
  {
    icon: <Target className="mb-4 h-10 w-10 text-primary" />,
    title: 'Competitor Analyzer Agent',
    description: 'Analyze competitor articles to find content gaps and strategic opportunities to outperform them in search rankings.',
  },
  {
    icon: <FileText className="mb-4 h-10 w-10 text-primary" />,
    title: 'E-E-A-T Content Agent',
    description: 'Craft engaging articles aligned with Google\'s core principles for helpful content that ranks for the long term.',
  },
  {
    icon: <Video className="mb-4 h-10 w-10 text-primary" />,
    title: 'AI Video Agent',
    description: "Transform any generated article into a short, engaging video for social media and web embeds with a single click.",
  },
  {
    icon: <TrendingUp className="mb-4 h-10 w-10 text-primary" />,
    title: 'Performance Audit Agent',
    description: 'Closes the loop by analyzing your content\'s performance data to provide actionable, AI-driven improvement suggestions.',
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-muted">
      <div className="container py-16 md:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12 md:mb-16">
          <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl text-foreground">Meet Your Team of AI Agents</h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Each feature is a specialized AI agent, ready to automate your marketing and sales workflows.
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
