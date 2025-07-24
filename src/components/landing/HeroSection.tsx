
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="container grid gap-12 lg:grid-cols-2 items-center py-12 md:py-20 lg:py-24">
      <div className="flex flex-col items-center text-center lg:items-start lg:text-left gap-6 lg:gap-8">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tighter sm:text-5xl md:text-6xl text-foreground">
          Deploy a Self-Improving AI that Wins at <span className="text-primary">Content & SEO</span>
        </h1>
        <p className="max-w-[600px] text-lg text-muted-foreground sm:text-xl">
         Go beyond basic generation. Trendsetter Pro uses a proprietary performance feedback loop, learning from your results to create content that ranks higher and converts better over time.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/dashboard">Deploy Your AI Agents</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-lg shadow-2xl animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-500 border-2 border-primary/20 bg-card/70 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-2xl text-center font-bold text-primary">
                    The Unfair Advantage for Growth
                </CardTitle>
                <CardDescription className="text-center text-md">
                    We help you acquire customers profitably by deploying specialized AI agents to do the work of an entire marketing team.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <ul className="space-y-3 text-sm">
                    <li className="flex items-start">
                        <Check className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                        <div>
                            <span className="font-semibold text-foreground">Create Content that Ranks:</span>
                            <span className="text-muted-foreground"> Generate articles aligned with Google's core E-E-A-T principles for long-term SEO success.</span>
                        </div>
                    </li>
                    <li className="flex items-start">
                        <Check className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                        <div>
                            <span className="font-semibold text-foreground">Outsmart Your Competition:</span>
                            <span className="text-muted-foreground"> Use the Competitor Agent to find strategic gaps and generate superior content.</span>
                        </div>
                    </li>
                     <li className="flex items-start">
                        <Check className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                        <div>
                            <span className="font-semibold text-foreground">Close the Loop with Performance Data:</span>
                            <span className="text-muted-foreground"> Our AI analyzes your content's performance to give you actionable advice, creating a feedback loop for continuous improvement.</span>
                        </div>
                    </li>
                </ul>
            </CardContent>
            <CardFooter>
                <Button asChild size="lg" className="w-full text-lg py-6">
                    <Link href="/pricing">Unleash Your AI Agents</Link>
                </Button>
            </CardFooter>
        </Card>
      </div>
    </section>
  );
}
