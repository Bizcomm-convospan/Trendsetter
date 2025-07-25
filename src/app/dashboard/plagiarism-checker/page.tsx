
import { PlagiarismCheckerClient } from '@/components/dashboard/plagiarism-checker/PlagiarismCheckerClient';
import { AppLayout } from '@/components/layout/AppLayout';

export default function PlagiarismCheckerPage() {
  return (
    <AppLayout>
      <PlagiarismCheckerClient />
    </AppLayout>
  );
}
