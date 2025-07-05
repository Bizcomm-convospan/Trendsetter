
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LandingLayout } from '@/components/layout/LandingLayout';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, MessageSquare, ShieldAlert, Lightbulb } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FormState = {
  name: string;
  email: string;
  message: string;
}

// A reusable form component for different contact reasons
function ContactForm({
  formType,
  setIsLoading,
  isLoading,
}: {
  formType: 'inquiry' | 'grievance' | 'feedback';
  setIsLoading: (loading: boolean) => void;
  isLoading: boolean;
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormState>({ name: '', email: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    toast({
      title: 'Message Sent!',
      description: `Thank you for your ${formType}. We've received your message. (This is a simulation)`,
    });
    setFormData({ name: '', email: '', message: '' }); // Reset form
  };

  const getLabels = () => {
    switch (formType) {
      case 'grievance':
        return {
          title: 'Grievance Form',
          description: 'Please provide details about your grievance. We take these matters seriously.',
          messageLabel: 'Describe your Grievance',
          messagePlaceholder: 'Please provide a detailed account of the issue...'
        };
      case 'feedback':
        return {
          title: 'Feedback Form',
          description: 'We value your feedback! Let us know how we can improve.',
          messageLabel: 'Your Feedback',
          messagePlaceholder: 'What\'s on your mind?'
        };
      case 'inquiry':
      default:
        return {
          title: 'General Inquiry Form',
          description: 'For general questions, please fill out the form below. Or, you can email us directly at bizcomm.solutions@gmail.com.',
          messageLabel: 'Your Message',
          messagePlaceholder: 'How can we help you today?'
        };
    }
  };

  const { title, description, messageLabel, messagePlaceholder } = getLabels();

  return (
    <div className="space-y-4">
        <div className="text-center">
             <h3 className="text-xl font-semibold">{title}</h3>
             <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
                <Label htmlFor={`${formType}-name`}>Full Name</Label>
                <Input id="name" placeholder="Jane Doe" value={formData.name} onChange={handleChange} required disabled={isLoading} />
            </div>
            <div className="space-y-2">
                <Label htmlFor={`${formType}-email`}>Email Address</Label>
                <Input id="email" type="email" placeholder="you@company.com" value={formData.email} onChange={handleChange} required disabled={isLoading} />
            </div>
            </div>
            <div className="space-y-2">
            <Label htmlFor={`${formType}-message`}>{messageLabel}</Label>
            <Textarea id="message" placeholder={messagePlaceholder} rows={5} value={formData.message} onChange={handleChange} required disabled={isLoading} />
            </div>
            <div className="flex justify-end">
                <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Send Message
                </Button>
            </div>
        </form>
    </div>
  )
}

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LandingLayout>
      <section className="container flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Contact Us</CardTitle>
            <CardDescription>
              We're here to help. Choose a category below to get in touch.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="inquiry" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="inquiry"><MessageSquare className="mr-2 h-4 w-4"/>Inquiry</TabsTrigger>
                <TabsTrigger value="grievance"><ShieldAlert className="mr-2 h-4 w-4"/>Grievance</TabsTrigger>
                <TabsTrigger value="feedback"><Lightbulb className="mr-2 h-4 w-4"/>Feedback</TabsTrigger>
              </TabsList>
              <TabsContent value="inquiry" className="pt-6">
                <ContactForm formType="inquiry" isLoading={isLoading} setIsLoading={setIsLoading} />
              </TabsContent>
              <TabsContent value="grievance" className="pt-6">
                 <ContactForm formType="grievance" isLoading={isLoading} setIsLoading={setIsLoading} />
              </TabsContent>
              <TabsContent value="feedback" className="pt-6">
                 <ContactForm formType="feedback" isLoading={isLoading} setIsLoading={setIsLoading} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </LandingLayout>
  );
}
