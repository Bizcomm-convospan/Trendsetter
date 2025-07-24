
import { LandingLayout } from '@/components/layout/LandingLayout';
import { ComparisonTable } from '@/components/landing/ComparisonTable';
import { Badge } from '@/components/ui/badge';
import { BarChart, Wand2, Search } from 'lucide-react';

export default function ComparePage() {
  return (
    <LandingLayout>
      <section className="container py-12 md:py-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center space-y-4 text-center mb-12">
          <Badge variant="secondary" className="text-sm">The Trendsetter Pro Advantage</Badge>
          <h1 className="font-bold text-4xl leading-tight sm:text-5xl md:text-6xl text-foreground">
            More Than a Tool—An Integrated Strategy Engine
          </h1>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            The market is full of tools that do one thing well. We believe true growth comes from an integrated system where AI agents work together, from ideation to performance analysis, creating a feedback loop that gets smarter over time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 text-center">
            <div className="space-y-3">
                <Wand2 className="mx-auto h-10 w-10 text-primary" />
                <h3 className="text-xl font-semibold">Generic AI Writers</h3>
                <p className="text-muted-foreground text-sm">Great for raw text generation, but lack strategic SEO direction and performance insights. They help you write, but not necessarily rank.</p>
            </div>
            <div className="space-y-3 p-6 rounded-lg border-2 border-primary bg-primary/5">
                <BarChart className="mx-auto h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold text-primary">Trendsetter Pro</h3>
                <p className="text-foreground text-sm">Unifies the entire content lifecycle. It's a strategic partner that helps you discover opportunities, create E-E-A-T aligned content, and improve based on real performance data.</p>
            </div>
            <div className="space-y-3">
                <Search className="mx-auto h-10 w-10 text-primary" />
                <h3 className="text-xl font-semibold">Traditional SEO Toolkits</h3>
                <p className="text-muted-foreground text-sm">Powerful for data analysis and keyword research, but the content creation process is completely separate. They show you the 'what', not the 'how'.</p>
            </div>
        </div>

        <ComparisonTable />
        
      </section>
    </LandingLayout>
  );
}
