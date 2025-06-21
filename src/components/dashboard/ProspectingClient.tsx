
'use client';

import { useState, useEffect } from 'react';
import type { ExtractedProspect, AutonomousProspectingOutput } from '@/ai/flows/autonomous-prospecting';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, Search, Building2, Mail, Tag, Link as LinkIcon, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface ProspectDisplayData {
  summary: string;
  prospects: ExtractedProspect[];
}

function ProspectCard({ prospect }: { prospect: ExtractedProspect }) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Building2 className="mr-2 h-5 w-5 text-primary" />
          {prospect.companyName || 'N/A'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        {prospect.people && prospect.people.length > 0 && (
          <div>
            <div className="flex items-center text-sm font-semibold mb-2">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              Contacts
            </div>
            <div className="ml-6 space-y-2">
              {prospect.people.map((person, index) => (
                <div key={index}>
                  <p className="text-sm font-medium text-foreground">{person.name}</p>
                  {person.role && <p className="text-xs text-muted-foreground">{person.role}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {prospect.emails && prospect.emails.length > 0 && (
          <div>
            <div className="flex items-center text-sm font-semibold mb-2">
              <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
              Emails
            </div>
            <div className="ml-6 space-y-1">
              {prospect.emails.map((email) => (
                 <a href={`mailto:${email}`} key={email} className="text-sm text-primary hover:underline block truncate">{email}</a>
              ))}
            </div>
          </div>
        )}

         {prospect.links && prospect.links.length > 0 && (
          <div>
             <div className="flex items-center text-sm font-semibold mb-2">
              <LinkIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              Links
            </div>
            <div className="ml-6 space-y-1">
              {prospect.links.map(link => (
                <a href={link} key={link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline block truncate">
                  {link}
                </a>
              ))}
            </div>
          </div>
        )}

        {prospect.industryKeywords && prospect.industryKeywords.length > 0 && (
            <div>
                 <div className="flex items-center text-sm font-semibold mb-2"><Tag className="mr-2 h-4 w-4 text-muted-foreground"/> Industry Keywords</div>
                <div className="ml-6 flex flex-wrap gap-2">
                    {prospect.industryKeywords.map(keyword => <Badge key={keyword} variant="secondary">{keyword}</Badge>)}
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}

const progressMap: Record<string, { percent: number; text: string }> = {
  queued: { percent: 10, text: 'Job is queued for processing...' },
  starting: { percent: 25, text: 'Starting job...' },
  crawling: { percent: 40, text: 'Crawling website...' },
  analyzing: { percent: 75, text: 'Analyzing content with AI...' },
  saving: { percent: 90, text: 'Saving results...' },
  complete: { percent: 100, text: 'Job complete!' },
  failed: { percent: 100, text: 'Job failed. Please check the logs.' },
};

export function ProspectingClient() {
  const [url, setUrl] = useState('');
  const [scannedUrl, setScannedUrl] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  
  const [extractionResult, setExtractionResult] = useState<ProspectDisplayData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');

  // Real-time listener for job progress
  useEffect(() => {
    if (!jobId) return;

    const unsubscribe = onSnapshot(doc(db, 'prospecting_jobs', jobId), (jobSnap) => {
      const jobData = jobSnap.data();

      if (!jobData) {
        setIsLoading(false);
        setError("The prospecting job could not be found.");
        return;
      }
      
      const status = jobData.status || 'queued';
      const { percent, text } = progressMap[status] || { percent: 0, text: 'Initializing...' };
      setProgress(percent);
      setProgressText(text);

      if (status === 'complete') {
        const finalData = jobData.extractedData as AutonomousProspectingOutput;
        setExtractionResult({
            summary: finalData.summary,
            prospects: finalData.prospects || [],
        });
        toast({
            title: "Extraction Complete!",
            description: `Found ${finalData.prospects?.length || 0} potential prospects.`,
        });
        setIsLoading(false);
        setJobId(null); // Clear job to allow new submissions
      } else if (status === 'failed') {
        setError(jobData.error || 'An unknown error occurred during processing.');
        toast({
            variant: "destructive",
            title: "Prospecting Failed",
            description: jobData.error || 'Please try again.',
        });
        setIsLoading(false);
        setJobId(null);
      }
    });

    // Cleanup listener on component unmount or when jobId changes
    return () => unsubscribe();
  }, [jobId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
        toast({
            variant: "destructive",
            title: "URL is required",
            description: "Please enter a URL to extract prospects from.",
        });
        return;
    }
    
    // Reset state for new submission
    setIsLoading(true);
    setError(null);
    setExtractionResult(null);
    setJobId(null);
    setScannedUrl(url);
    setProgress(0);
    setProgressText('Submitting job...');

    try {
      const res = await fetch('/api/prospect', {
        method: 'POST',
        body: JSON.stringify({ url }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data: { jobId?: string; error?: string, details?: any } = await res.json();

      if (!res.ok || data.error) {
        let errorMessage = data.error || 'An unknown error occurred';
        if(data.details) {
            errorMessage += ` ${JSON.stringify(data.details)}`;
        }
        throw new Error(errorMessage);
      }
      
      if (data.jobId) {
        setJobId(data.jobId);
      } else {
        throw new Error("Did not receive a job ID from the server.");
      }

    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Error Starting Job",
        description: err.message,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Autonomous Prospecting Engine</CardTitle>
           <CardDescription>
            Enter a URL and let the AI crawl the page and extract potential prospect data like company names, contacts, and emails.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
             <div className="space-y-2">
              <Label htmlFor="url" className="text-base font-semibold">Website URL</Label>
              <Input
                id="url"
                name="url"
                placeholder="e.g., https://example.com"
                required
                type="url"
                className="text-base"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
               {error && !isLoading && (
                <p className="text-sm text-destructive pt-1">{error}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Extract Prospects from URL
            </Button>
          </CardFooter>
        </form>
      </Card>

      {isLoading && (
        <Card className="shadow-lg animate-fadeIn">
          <CardHeader>
            <CardTitle>Prospecting in Progress...</CardTitle>
            <CardDescription>The AI is working on your request. This may take a moment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{progressText}</p>
              <p className="text-sm font-semibold text-foreground">{progress}%</p>
            </div>
          </CardContent>
        </Card>
      )}

      {extractionResult && !isLoading && (
        <section className="animate-fadeIn">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <FileText className="mr-3 h-7 w-7 text-primary" />
            Prospecting Report
          </h2>
          <Card className="shadow-md mb-6">
            <CardHeader>
              <CardTitle>Run Summary</CardTitle>
              <CardDescription>A summary of the prospecting job that was just executed.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">URL Scanned</span>
                    <span className="font-medium text-right truncate">{scannedUrl}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="outline" className="border-green-600 bg-green-50 text-green-700">Complete</Badge>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Prospects Found</span>
                    <span className="font-semibold">{extractionResult.prospects.length}</span>
                </div>
                 <div className="pt-2">
                    <p className="text-muted-foreground"><span className="font-semibold text-foreground">AI Analysis:</span> {extractionResult.summary}</p>
                 </div>
            </CardContent>
          </Card>
          
          {extractionResult.prospects.length > 0 ? (
            <div>
              <h3 className="text-xl font-bold mb-4">Extracted Prospects</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {extractionResult.prospects.map((prospect, index) => (
                  <ProspectCard key={`${prospect.companyName || 'prospect'}-${index}`} prospect={prospect} />
                ))}
              </div>
            </div>
          ) : (
            <Card className="shadow-md">
              <CardContent className="py-10 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl font-semibold text-foreground">No Prospects Found</p>
                <p className="text-muted-foreground mt-2">
                  The AI couldn't extract structured prospect information from this URL. Try a different page.
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      )}
    </div>
  );
}
