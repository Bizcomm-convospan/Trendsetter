
import { LandingLayout } from '@/components/layout/LandingLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <LandingLayout>
      <section className="container py-12 md:py-20">
        <Card className="max-w-3xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>Your privacy is important to us. It is Trendsetter Pro's policy to respect your privacy regarding any information we may collect from you across our website, and other sites we own and operate.</p>

            <h2>1. Information We Collect</h2>
            <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>
            <p>Information we may collect includes:</p>
            <ul>
                <li>Name</li>
                <li>Email address</li>
                <li>Payment information (processed by a third-party provider)</li>
                <li>Usage data related to the Service</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect in various ways, including to:</p>
            <ul>
                <li>Provide, operate, and maintain our Service</li>
                <li>Improve, personalize, and expand our Service</li>
                <li>Understand and analyze how you use our Service</li>
                <li>Develop new products, services, features, and functionality</li>
                <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the Service, and for marketing and promotional purposes</li>
                <li>Process your transactions</li>
                <li>Find and prevent fraud</li>
            </ul>

            <h2>3. Log Files</h2>
            <p>Trendsetter Pro follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable.</p>
            
            <h2>4. Cookies and Web Beacons</h2>
            <p>Like any other website, Trendsetter Pro uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.</p>

            <h2>5. Data Security</h2>
            <p>We take reasonable precautions to protect your information. However, no method of transmission over the Internet, or method of electronic storage, is 100% secure. While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security.</p>
            
            <h2>6. Third-Party Services</h2>
            <p>Our Service may contain links to other sites that are not operated by us. If you click on a third party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.</p>
            <p>We use third-party payment processors to handle payments. We do not store or collect your payment card details. That information is provided directly to our third-party payment processors whose use of your personal information is governed by their Privacy Policy.</p>

            <h2>7. Children's Privacy</h2>
            <p>Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with Personal Information, please contact us.</p>

            <h2>8. Changes to This Privacy Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>

            <h2>9. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at privacy@trendsetter.pro (this is a dummy email).</p>
            
            <p className="text-sm text-muted-foreground">Last updated: June 20, 2025</p>
          </CardContent>
        </Card>
      </section>
    </LandingLayout>
  );
}
