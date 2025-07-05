
'use client';

import { LandingLayout } from '@/components/layout/LandingLayout';
import { PricingCard } from '@/components/pricing/PricingCard';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const pricingPlans = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$29',
    frequency: '/month',
    description: 'For individuals and small teams starting out.',
    features: [
      'Trend Discovery (10 searches/mo)',
      "Question Spy (10 searches/mo)",
      "Competitor Analyzer (5 reports/mo)",
      "'Answer the AI' Content Angles (10/mo)",
      'Content Generation (5 articles/mo)',
      'AI Humanizer & Detector (10 analyses/mo)',
      'WordPress Publishing (5 articles/mo)',
      'Basic Support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$79',
    frequency: '/month',
    description: 'For growing businesses and professionals.',
    features: [
      'Trend Discovery (Unlimited)',
      "Question Spy (Unlimited)",
      "Competitor Analyzer (Unlimited)",
      "'Answer the AI' Content Angles (Unlimited)",
      'Content Generation (25 articles/mo)',
      'AI Humanizer & Detector (Unlimited)',
      'WordPress Publishing (Unlimited)',
      'API Access',
      'Priority Support',
    ],
    cta: 'Choose Pro',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    frequency: '',
    description: 'For large organizations with custom needs.',
    features: [
      'All Pro Features',
      'Unlimited Team Members',
      'Dedicated Account Manager',
      'Custom Integrations & Onboarding',
      'SLA & Enterprise-grade Security',
    ],
    cta: 'Contact Us',
    popular: false,
  },
];

export default function PricingPage() {
  const { t } = useTranslation();
  return (
    <LandingLayout>
      <section className="container py-12 md:py-20">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12">
          <h1 className="font-bold text-4xl leading-[1.1] sm:text-4xl md:text-6xl text-foreground">
            {t('pricing.title')}
          </h1>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            {t('pricing.description')}
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.id} {...plan} />
          ))}
        </div>
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold mb-4 text-foreground">All Plans Include:</h3>
          <ul className="space-y-2 text-muted-foreground max-w-md mx-auto">
            <li className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" /> AI-Powered Tools
            </li>
            <li className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" /> Regular Feature Updates
            </li>
            <li className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" /> Secure Data Handling
            </li>
          </ul>
        </div>
      </section>
    </LandingLayout>
  );
}
