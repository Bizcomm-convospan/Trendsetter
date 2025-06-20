
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { CtaSection } from '@/components/landing/CtaSection';
import { LandingLayout } from '@/components/layout/LandingLayout';

export default function HomePage() {
  return (
    <LandingLayout>
      <HeroSection />
      <FeaturesSection />
      <CtaSection />
    </LandingLayout>
  );
}
