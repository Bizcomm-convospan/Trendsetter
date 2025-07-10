
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LandingLayout } from '@/components/layout/LandingLayout';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, CalendarDays, Lock } from 'lucide-react';

const planDetails: Record<string, { name: string; price: string }> = {
  basic: { name: 'Basic Plan', price: '$29/month' },
  pro: { name: 'Pro Plan', price: '$79/month' },
};

type PageStatus = 'loading' | 'ready' | 'invalid' | 'submitting' | 'success';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<PageStatus>('loading');
  const [currentPlan, setCurrentPlan] = useState<{ name: string; price: string } | null>(null);

  const planId = typeof params.planId === 'string' ? params.planId : '';

  useEffect(() => {
    if (planId) {
      if (planDetails[planId]) {
        setCurrentPlan(planDetails[planId]);
        setStatus('ready');
      } else {
        setStatus('invalid');
        toast({ variant: 'destructive', title: 'Invalid Plan', description: 'The selected plan is not valid.' });
      }
    } else {
        // This case handles if the URL is somehow /checkout/ without a planId
        setStatus('invalid');
    }
  }, [planId, toast]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setStatus('success');
    toast({
      title: 'Payment Successful!',
      description: `You've subscribed to the ${currentPlan?.name || 'selected plan'}.`,
    });
    router.push('/thank-you?plan=' + planId);
  };
  
  const isLoading = status === 'submitting' || status === 'loading';

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-12 w-12 animate-spin text-primary" />;

      case 'invalid':
        return (
          <Card className="w-full max-w-lg text-center">
            <CardHeader>
              <CardTitle>Invalid Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <p>The plan you selected is not available. Please return to our pricing page.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => router.push('/pricing')} className="w-full">Go to Pricing</Button>
            </CardFooter>
          </Card>
        );

      case 'ready':
      case 'submitting':
      case 'success':
        if (!currentPlan) return null; // Should not happen in these states
        return (
          <Card className="w-full max-w-lg shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Complete Your Purchase</CardTitle>
              <CardDescription>
                You&apos;re subscribing to the <span className="font-semibold text-primary">{currentPlan.name}</span> for <span className="font-semibold text-primary">{currentPlan.price}</span>.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePayment}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Jane Doe" required disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input id="cardNumber" placeholder="•••• •••• •••• ••••" className="pl-10" required disabled={isLoading} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input id="expiryDate" placeholder="MM / YY" className="pl-10" required disabled={isLoading} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input id="cvc" placeholder="•••" className="pl-10" required disabled={isLoading} />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  This is a simulated payment gateway. No real transaction will occur.
                </p>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {status === 'submitting' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : `Pay ${currentPlan.price}`}
                </Button>
              </CardFooter>
            </form>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <LandingLayout>
      <section className="container flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
        {renderContent()}
      </section>
    </LandingLayout>
  );
}

    