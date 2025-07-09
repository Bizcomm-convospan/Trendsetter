// This page's content has been moved to a section on the homepage.
// This file is no longer actively used in navigation but is kept to avoid breaking bookmarked links.

import { LandingLayout } from '@/components/layout/LandingLayout';
import { FaqSection } from '@/components/landing/FaqSection';

export default function FaqPage() {
  return (
    <LandingLayout>
      <FaqSection />
    </LandingLayout>
  );
}
