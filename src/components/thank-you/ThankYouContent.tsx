
'use client';

import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function ThankYouContent() {
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan');
  
  const planNames: Record<string, string> = {
    basic: 'Basic Plan',
    pro: 'Pro Plan',
  };
  const planName = planId ? planNames[planId] || 'your selected plan' : 'your selected plan';

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
