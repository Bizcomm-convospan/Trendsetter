
'use client';

import { LandingLayout } from '@/components/layout/LandingLayout';
import { PricingCard } from '@/components/pricing/PricingCard';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const pricingPlans = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$27.99',
    frequency: '/month',
    description: 'For individuals and small teams starting out.',
    features: [
      'Trend Discovery (10 searches/mo)',
      "Question Spy (10 searches/mo)",
      "Competitor Analyzer (5 reports/mo)",
      "E-E-A-T Aligned Content Generation (5 articles/mo)",
      'AI Video Generation (2 videos/mo)',
      'AI Humanizer & Detector (10 analyses/mo)',
      'Headline & Social Media Tools',
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
      'Everything in Basic, plus:',
      "Unlimited Trend, Question & Competitor Searches",
      "E-E-A-T Aligned Content Generation (25 articles/mo)",
      "AI Video Generation (10 videos/mo)",
      "AI Performance Audits & Recommendations",
      'Unlimited AI Humanizer & Detector use',
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
      'Unlimited Video Generation',
      'Personalized AI Model Training',
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
            Pricing Plans for Your AI Agent Workforce
          </h1>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Choose the right plan and deploy your team of AI agents today. Cancel anytime.
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
              <CheckCircle className="h-5 w-5 text-green-500" /> A Full Suite of AI Agents
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
