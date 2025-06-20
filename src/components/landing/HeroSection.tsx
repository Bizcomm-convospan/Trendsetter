
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10 lg:grid-cols-2">
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl text-foreground">
          Automate Your Growth with <br className="hidden sm:inline" />
          <span className="text-primary">AI-Powered Insights</span>
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
          Discover trends, generate compelling content, and find your ideal customers effortlessly. Trendsetter Pro is your all-in-one AI platform for marketing and sales automation.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/dashboard">Get Started Now</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </div>
      </div>
      <div className="flex justify-center">
        <Image
          src="https://placehold.co/600x400.png"
          alt="AI powered insights dashboard"
          width={600}
          height={400}
          className="rounded-lg shadow-2xl"
          data-ai-hint="dashboard analytics"
          priority
        />
      </div>
    </section>
  );
}
