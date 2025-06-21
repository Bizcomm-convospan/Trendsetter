
'use client';

import { useState } from 'react';
import type { ExtractedProspect } from '@/ai/flows/autonomous-prospecting';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, Search, Building2, Mail, Tag, Link as LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// This is the shape the component uses for rendering
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


export function ProspectingClient() {
  const [url, setUrl] = useState('');
  const [extractionResult, setExtractionResult] = useState<ProspectDisplayData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setExtractionResult(null);

    if (!url) {
        toast({
            variant: "destructive",
            title: "URL is required",
            description: "Please enter a URL to extract prospects from.",
        });
        setIsLoading(false);
        return;
    }

    try {
      const res = await fetch('/api/prospect', {
        method: 'POST',
        body: JSON.stringify({ url }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const rawData: { summary: string; prospects: ExtractedProspect[]; error?: string, details?: any } = await res.json();

      if (!res.ok || rawData.error) {
        let errorMessage = rawData.error || 'An unknown error occurred';
        if(rawData.details) {
            errorMessage += ` ${JSON.stringify(rawData.details)}`;
        }
        throw new Error(errorMessage);
      }

      setExtractionResult({
        summary: rawData.summary,
        prospects: rawData.prospects || [],
      });

      toast({
        title: "Extraction Complete!",
        description: `Found ${rawData.prospects?.length || 0} potential prospects.`,
      });

    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Error Extracting Prospects",
        description: err.message,
      });
    } finally {
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
        <div className="text-center py-10">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">Crawling and extracting information...</p>
        </div>
      )}

      {extractionResult && (
        <section className="animate-fadeIn">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Users className="mr-3 h-7 w-7 text-primary" />
            Extraction Results
          </h2>
           <Card className="shadow-md mb-6">
              <CardHeader>
                  <CardTitle>AI Summary</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-muted-foreground">{extractionResult.summary}</p>
              </CardContent>
          </Card>
          
          {extractionResult.prospects.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {extractionResult.prospects.map((prospect, index) => (
                <ProspectCard key={`${prospect.companyName || 'prospect'}-${index}`} prospect={prospect} />
              ))}
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
