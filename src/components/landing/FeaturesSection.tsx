
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Wand2, ScanText, FileText, UploadCloud, BarChart3, BrainCircuit } from 'lucide-react';

const features = [
  {
    icon: <BarChart3 className="mb-4 h-10 w-10 text-primary" />,
    title: 'Trend Discovery',
    description: 'Identify emerging trends and hot topics in your industry before they peak. Stay ahead of the curve.',
  },
   {
    icon: <BrainCircuit className="mb-4 h-10 w-10 text-primary" />,
    title: 'Answer the AI',
    description: 'Go beyond keywords. Generate strategic content angles (Who, What, When, Where, How) to create comprehensive articles.',
  },
  {
    icon: <FileText className="mb-4 h-10 w-10 text-primary" />,
    title: 'AI Content Generation',
    description: 'Craft engaging, SEO-friendly articles, blog posts, and social media content in minutes.',
  },
    {
    icon: <Wand2 className="mb-4 h-10 w-10 text-primary" />,
    title: 'AI Humanizer',
    description: 'Refine AI-generated text to sound more natural and engaging. Adjust the tone to match your brand voice.',
  },
  {
    icon: <ScanText className="mb-4 h-10 w-10 text-primary" />,
    title: 'AI Detector',
    description: "Analyze content for AI patterns. Get a 'humanization score' and suggestions for improvement.",
  },
  {
    icon: <UploadCloud className="mb-4 h-10 w-10 text-primary" />,
    title: 'One-Click Publishing',
    description: 'Seamlessly publish your generated and refined articles directly to your WordPress site with a single click.',
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
