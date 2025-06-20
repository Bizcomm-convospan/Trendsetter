
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendDiscoveryClient } from '@/components/dashboard/TrendDiscoveryClient';
import { ContentCreationClient } from '@/components/dashboard/ContentCreationClient';
import { ProspectingClient } from '@/components/dashboard/ProspectingClient';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome to Trendsetter Pro</h1>
        <p className="text-lg text-muted-foreground">
          Your AI-powered platform for automated content generation and prospecting.
        </p>
      </header>

      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-6">
          <TabsTrigger value="trends" className="py-2.5 text-base">Trend Discovery</TabsTrigger>
          <TabsTrigger value="content" className="py-2.5 text-base">Content Creation</TabsTrigger>
          <TabsTrigger value="prospecting" className="py-2.5 text-base">Autonomous Prospecting</TabsTrigger>
        </TabsList>
        <TabsContent value="trends">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Trend Discovery Engine</CardTitle>
              <CardDescription>
                Identify current trends, optionally focused on a specific topic. AI will (simulatedly) analyze various sources.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrendDiscoveryClient />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="content">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Content Creation Engine</CardTitle>
              <CardDescription>
                Generate SEO-optimized articles based on trending topics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContentCreationClient />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="prospecting">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Autonomous Prospecting Engine</CardTitle>
              <CardDescription>
                Define your Ideal Customer Profile and let AI find relevant prospects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProspectingClient />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <section className="grid gap-6 md:grid-cols-1">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold">
              Boost Your Outreach
            </CardTitle>
            <Zap className="h-6 w-6 text-accent" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Leverage AI to stay ahead of trends and connect with the right people, effortlessly.
            </CardDescription>
             <p className="mt-4 text-sm text-muted-foreground">
              Explore the features above and start automating your growth today.
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>How it Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p><strong>1. Discover Trends:</strong> Use the 'Trend Discovery' tab. Input a topic or let the system identify current trends.</p>
            <p><strong>2. Generate Content:</strong> Use the 'Content Creation' tab. Our AI crafts engaging, SEO-friendly articles and suggests imagery based on identified trends.</p>
            <p><strong>3. Define Your ICP:</strong> Use the 'Autonomous Prospecting' tab. Specify your ideal customer criteria for targeted prospecting.</p>
            <p><strong>4. Uncover Prospects:</strong> AI scours public web data to find potential leads matching your ICP.</p>
            <p><strong>5. Automate & Grow:</strong> Streamline your content and prospecting workflows by combining these powerful AI agents directly from this dashboard.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
