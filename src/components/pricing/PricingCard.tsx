
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  id: string;
  name: string;
  price: string;
  frequency: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

export function PricingCard({ id, name, price, frequency, description, features, cta, popular }: PricingCardProps) {
  return (
    <Card className={cn("flex flex-col shadow-lg hover:shadow-2xl transition-shadow duration-300", popular ? "border-primary border-2 ring-2 ring-primary/50 relative" : "")}>
      {popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
          Most Popular
        </div>
      )}
      <CardHeader className="items-center text-center pt-8">
        <CardTitle className="text-2xl font-bold">{name}</CardTitle>
        <div className="my-2">
          <span className="text-4xl font-extrabold text-foreground">{price}</span>
          {frequency && <span className="text-sm text-muted-foreground">{frequency}</span>}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-start">
              <Check className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button asChild className={cn("w-full", popular ? "bg-primary hover:bg-primary/90" : "bg-secondary hover:bg-secondary/80 text-secondary-foreground")} size="lg">
          {id === 'enterprise' ? <Link href="/contact-sales">{cta}</Link> : <Link href={`/checkout/${id}`}>{cta}</Link>}
        </Button>
      </CardFooter>
    </Card>
  );
}
