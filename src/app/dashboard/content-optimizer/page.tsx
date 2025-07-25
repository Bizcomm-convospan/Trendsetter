
import { ContentOptimizerClient } from '@/components/dashboard/content-optimizer/ContentOptimizerClient';
import { AppLayout } from '@/components/layout/AppLayout';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function OptimizerPageSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-40" />
                <Skeleton className="h-96" />
            </div>
            <div className="lg:col-span-1 space-y-6">
                <Skeleton className="h-48" />
                <Skeleton className="h-64" />
            </div>
        </div>
    )
}

export default function ContentOptimizerPage() {
  return (
    <AppLayout>
      <Suspense fallback={<OptimizerPageSkeleton />}>
        <ContentOptimizerClient />
      </Suspense>
    </AppLayout>
  );
}
