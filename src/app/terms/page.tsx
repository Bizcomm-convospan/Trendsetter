
import { LandingLayout } from '@/components/layout/LandingLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <LandingLayout>
      <section className="container py-12 md:py-20">
        <Card className="max-w-3xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing or using Trendsetter Pro (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, then you may not access the Service.</p>

            <h2>2. Description of Service</h2>
            <p>Trendsetter Pro provides AI-powered tools for trend discovery, content generation, and autonomous prospecting. The features and services offered may change over time.</p>
            
            <h2>3. User Accounts</h2>
            <p>To access certain features of the Service, you may be required to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.</p>

            <h2>4. Use of Service</h2>
            <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:</p>
            <ul>
              <li>In any way that violates any applicable national or international law or regulation.</li>
              <li>To exploit, harm, or attempt to exploit or harm minors in any way.</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation.</li>
              <li>To impersonate or attempt to impersonate Trendsetter Pro, a Trendsetter Pro employee, another user, or any other person or entity.</li>
            </ul>

            <h2>5. Intellectual Property</h2>
            <p>The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of Trendsetter Pro and its licensors.</p>
            
            <h2>6. Subscription and Payment</h2>
            <p>Certain features of the Service may be subject to payment. All payment terms will be disclosed to you at the time of purchase. Payments are processed through a third-party payment processor, and your use of such processor is subject to their terms and conditions.</p>

            <h2>7. Termination</h2>
            <p>We may terminate or suspend your access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
            
            <h2>8. Limitation of Liability</h2>
            <p>In no event shall Trendsetter Pro, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

            <h2>9. Changes to Terms</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page.</p>

            <h2>10. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at support@trendsetter.pro (this is a dummy email).</p>
            
            <p className="text-sm text-muted-foreground">Last updated: June 20, 2025</p>
          </CardContent>
        </Card>
      </section>
    </LandingLayout>
  );
}
