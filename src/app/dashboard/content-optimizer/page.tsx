import { ContentOptimizerClient } from '@/components/dashboard/content-optimizer/ContentOptimizerClient';
import { AppLayout } from '@/components/layout/AppLayout';

export default function ContentOptimizerPage() {
  return (
    <AppLayout>
      <ContentOptimizerClient />
    </AppLayout>
  );
}
