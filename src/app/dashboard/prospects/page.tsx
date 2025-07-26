

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserPlus, Filter, Download } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { AppLayout } from '@/components/layout/AppLayout';

// This is a placeholder for the real ICP criteria you would define.
const idealCustomerProfile = {
  industries: ['Technology', 'Healthcare', 'Finance'],
  regions: ['North America', 'Europe'],
  jobTitles: ['CEO', 'CTO', 'VP of Engineering'],
};

// This is a placeholder for the real prospect data that would be streamed from the AI engine.
const initialProspects = [
  { id: 'p1', companyName: 'Innovate Inc.', contactName: 'Alice Johnson', jobTitle: 'CTO', industry: 'Technology', region: 'North America', score: 95, status: 'Contacted' },
  { id: 'p2', companyName: 'HealthWell Group', contactName: 'Bob Williams', jobTitle: 'CEO', industry: 'Healthcare', region: 'Europe', score: 88, status: 'New' },
  { id: 'p3', companyName: 'FinSecure', contactName: 'Charlie Brown', jobTitle: 'VP of Engineering', industry: 'Finance', region: 'North America', score: 82, status: 'New' },
  { id: 'p4', companyName: 'DataDriven Co.', contactName: 'Diana Miller', jobTitle: 'Data Scientist', industry: 'Technology', region: 'North America', score: 75, status: 'Nurturing' },
  { id: 'p5', companyName: 'MedTech Solutions', contactName: 'Ethan Davis', jobTitle: 'Product Manager', industry: 'Healthcare', region: 'Europe', score: 68, status: 'New' },
];


type Prospect = typeof initialProspects[0];

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCrawling, setIsCrawling] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate initial loading of prospects
    setTimeout(() => {
      setProspects(initialProspects);
      setIsLoading(false);
    }, 1500);
  }, []);

  const handleStartCrawling = () => {
    setIsCrawling(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCrawling(false);
          // Add a new mock prospect
          setProspects(old => [{
              id: `p${old.length + 1}`,
              companyName: 'Global-AI',
              contactName: 'Frank White',
              jobTitle: 'CEO',
              industry: 'Technology',
              region: 'North America',
              score: 98,
              status: 'New'
          }, ...old]);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Contacted':
        return <Badge variant="default">Contacted</Badge>;
      case 'Nurturing':
        return <Badge variant="secondary">Nurturing</Badge>;
      case 'New':
      default:
        return <Badge variant="outline">New</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-bold">Autonomous Prospecting</CardTitle>
                <CardDescription>
                  Your AI agent is continuously scanning for new prospects based on your Ideal Customer Profile (ICP).
                </CardDescription>
              </div>
              <Button onClick={handleStartCrawling} disabled={isCrawling}>
                {isCrawling ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                {isCrawling ? 'Crawling in Progress...' : 'Start New Crawl Session'}
              </Button>
            </div>
            {isCrawling && (
              <div className="mt-4">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground mt-2 text-center">Simulating web crawl... found 1 new prospect.</p>
              </div>
            )}
          </CardHeader>
        </Card>

        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Ideal Customer Profile (ICP)</CardTitle>
                <CardDescription>Your AI uses these criteria to find relevant prospects.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-x-6 gap-y-4 text-sm">
                <div>
                    <h4 className="font-semibold mb-2">Industries</h4>
                    <div className="flex flex-wrap gap-2">
                        {idealCustomerProfile.industries.map(i => <Badge key={i} variant="secondary">{i}</Badge>)}
                    </div>
                </div>
                 <div>
                    <h4 className="font-semibold mb-2">Regions</h4>
                    <div className="flex flex-wrap gap-2">
                        {idealCustomerProfile.regions.map(r => <Badge key={r} variant="secondary">{r}</Badge>)}
                    </div>
                </div>
                 <div>
                    <h4 className="font-semibold mb-2">Key Job Titles</h4>
                    <div className="flex flex-wrap gap-2">
                        {idealCustomerProfile.jobTitles.map(j => <Badge key={j} variant="secondary">{j}</Badge>)}
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Prospect Dashboard</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
                <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Export</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>ICP Score</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Loader2 className="h-5 w-5 animate-spin" /></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))
                ) : (
                  prospects.map((prospect) => (
                    <TableRow key={prospect.id}>
                      <TableCell className="font-medium">{prospect.companyName}</TableCell>
                      <TableCell>
                        <div className="font-medium">{prospect.contactName}</div>
                        <div className="text-sm text-muted-foreground">{prospect.jobTitle}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={prospect.score} className="w-20" />
                          <span>{prospect.score}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(prospect.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
