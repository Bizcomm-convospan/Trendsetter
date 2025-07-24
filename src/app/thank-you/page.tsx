
'use client';

import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LandingLayout } from '@/components/layout/LandingLayout';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';


function ThankYouContentInner() {
  const searchParams = useSearchParams();
  const [planName, setPlanName] = useState<string | null>(null);

  // This useEffect will only run on the client, after hydration.
  // This prevents the server from rendering one thing and the client another.
  useEffect(() => {
    const planNames: Record<string, string> = {
      basic: 'Basic Plan',
      pro: 'Pro Plan',
    };
    const planId = searchParams.get('plan');
    const name = planId ? planNames[planId] || 'your selected plan' : 'your selected plan';
    setPlanName(name);
  }, [searchParams]);

  if (planName === null) {
      return (
          <Card className="w-full max-w-lg text-center shadow-xl">
              <CardContent className="p-10 flex items-center justify-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                  <p>Loading your subscription details...</p>
              </CardContent>
          </Card>
      )
  }

  return (
    <Card className="w-full max-w-lg text-center shadow-xl animate-in fade-in-50">
      <CardHeader>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle className="text-3xl font-bold">Thank You!</CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          Your subscription to the {planName} is confirmed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          Welcome to Trendsetter Pro! You can now access all the features included in your plan.
        </p>
        <Button asChild size="lg" className="w-full">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <p className="text-xs text-muted-foreground">
          A confirmation email (simulated) has been sent to your address.
        </p>
      </CardContent>
    </Card>
  );
}

export default function ThankYouPage() {
  return (
    <LandingLayout>
      <section className="container flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
        <Suspense fallback={<div>Loading thank you message...</div>}>
          <ThankYouContentInner />
        </Suspense>
      </section>
    </LandingLayout>
  );
}
