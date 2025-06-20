
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CtaSection() {
  return (
    <section className="container py-12 md:py-24 text-center">
      <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl text-foreground mb-6">
        Ready to Revolutionize Your Workflow?
      </h2>
      <p className="max-w-[600px] mx-auto text-lg text-muted-foreground sm:text-xl mb-8">
        Join hundreds of businesses leveraging Trendsetter Pro to automate growth and achieve remarkable results. Start your journey today!
      </p>
      <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
        <Link href="/pricing">Explore Plans & Get Started</Link>
      </Button>
    </section>
  );
}
