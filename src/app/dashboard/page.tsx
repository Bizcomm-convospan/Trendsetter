
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Zap, TrendingUp } from "lucide-react"; // Added TrendingUp
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome to Trendsetter Pro</h1>
        <p className="text-lg text-muted-foreground">
          Your AI-powered platform for automated content generation and prospecting.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold">
              Trend Discovery
            </CardTitle>
            <TrendingUp className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Identify current trends, optionally focused on a specific topic.
            </CardDescription>
            <Button asChild className="w-full bg-primary hover:bg-primary/90">
              <Link href="/dashboard/trends">Discover Trends</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold">
              Content Creation
            </CardTitle>
            <FileText className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Generate SEO-optimized articles based on trending topics.
            </CardDescription>
            <Button asChild className="w-full bg-primary hover:bg-primary/90">
              <Link href="/dashboard/content-creation">Start Creating</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold">
              Autonomous Prospecting
            </CardTitle>
            <Users className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Define your Ideal Customer Profile and let AI find relevant prospects.
            </CardDescription>
            <Button asChild className="w-full bg-primary hover:bg-primary/90">
              <Link href="/dashboard/prospecting">Find Prospects</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-3 lg:col-span-3">
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
              Explore the features and start automating your growth today.
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
            <p><strong>1. Discover Trends:</strong> Input a topic or let the system identify current trends using the new Trend Discovery agent.</p>
            <p><strong>2. Generate Content:</strong> Our AI crafts engaging, SEO-friendly articles and suggests imagery based on identified trends.</p>
            <p><strong>3. Define Your ICP:</strong> Specify your ideal customer criteria for targeted prospecting.</p>
            <p><strong>4. Uncover Prospects:</strong> AI scours public web data to find potential leads matching your ICP.</p>
            <p><strong>5. Automate & Grow:</strong> Streamline your content and prospecting workflows by combining these powerful AI agents.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
