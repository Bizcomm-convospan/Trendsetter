
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { CtaSection } from '@/components/landing/CtaSection';
import { LandingLayout } from '@/components/layout/LandingLayout';
import { FaqSection } from '@/components/landing/FaqSection';

export default function HomePage() {
  return (
    <LandingLayout>
      <HeroSection />
      <FeaturesSection />
      <FaqSection />
      <CtaSection />
    </LandingLayout>
  );
}
