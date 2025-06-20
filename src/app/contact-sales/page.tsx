
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LandingLayout } from '@/components/layout/LandingLayout';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';

export default function ContactSalesPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    toast({
      title: 'Message Sent!',
      description: 'Our sales team will get back to you shortly. (This is a simulation)',
    });
    setFormData({ name: '', email: '', company: '', message: '' }); // Reset form
  };

  return (
    <LandingLayout>
      <section className="container flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Contact Sales</CardTitle>
            <CardDescription>
              Interested in our Enterprise plan or have custom requirements? Let us know!
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Jane Doe" value={formData.name} onChange={handleChange} required disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="you@company.com" value={formData.email} onChange={handleChange} required disabled={isLoading} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company Name (Optional)</Label>
                <Input id="company" placeholder="Your Company Inc." value={formData.company} onChange={handleChange} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Tell us about your needs..." rows={5} value={formData.message} onChange={handleChange} required disabled={isLoading} />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Send Message
              </Button>
            </CardFooter>
          </form>
        </Card>
      </section>
    </LandingLayout>
  );
}
