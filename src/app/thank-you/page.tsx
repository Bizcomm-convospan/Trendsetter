
'use client';

import { LandingLayout } from '@/components/layout/LandingLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the ThankYouContent component with SSR turned off.
const ThankYouContent = dynamic(() => import('@/components/thank-you/ThankYouContent'), {
  ssr: false,
});

function LoadingSpinner() {
    return (
        <Card className="w-full max-w-lg text-center shadow-xl">
            <CardContent className="p-10 flex items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                <p>Loading your subscription details...</p>
            </CardContent>
        </Card>
    )
}

export default function ThankYouPage() {
  return (
    <LandingLayout>
      <section className="container flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
        <Suspense fallback={<LoadingSpinner />}>
            <ThankYouContent />
        </Suspense>
      </section>
    </LandingLayout>
  );
}
