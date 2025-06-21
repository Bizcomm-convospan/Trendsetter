
'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { handleFindProspects, type ActionResponse } from '@/app/actions';
import type { AutonomousProspectingOutput, ExtractedProspect } from '@/ai/flows/autonomous-prospecting';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, Search, Building2, User, Mail, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
      Extract Prospects from URL
    </Button>
  );
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
      <CardContent className="space-y-3 flex-grow">
        {prospect.contactPersons && prospect.contactPersons.length > 0 && (
          <div className="text-sm text-foreground">
            <User className="mr-2 h-4 w-4 text-muted-foreground inline-block align-middle" />
            <span className="align-middle">{prospect.contactPersons.join(', ')}</span>
          </div>
        )}
        {prospect.emails && prospect.emails.length > 0 && (
          <div className="text-sm text-foreground">
            <Mail className="mr-2 h-4 w-4 text-muted-foreground inline-block align-middle" />
            <span className="align-middle">{prospect.emails.join(', ')}</span>
          </div>
        )}
        {prospect.industryKeywords && prospect.industryKeywords.length > 0 && (
            <div>
                 <p className="text-sm font-medium mb-2 flex items-center"><Tag className="mr-2 h-4 w-4 text-muted-foreground"/> Industry Keywords</p>
                <div className="flex flex-wrap gap-2">
                    {prospect.industryKeywords.map(keyword => <Badge key={keyword} variant="secondary">{keyword}</Badge>)}
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProspectingClient() {
  const [extractionResult, setExtractionResult] = useState<AutonomousProspectingOutput | null>(null);
  const { toast } = useToast();

  const initialState: ActionResponse<AutonomousProspectingOutput> = {};
  const [state, formAction, isProspecting] = useActionState(handleFindProspects, initialState);

  useEffect(() => {
    if (state?.data) {
      setExtractionResult(state.data);
      toast({
        title: "Extraction Complete!",
        description: `Found ${state.data.prospects.length} potential prospects.`,
      });
    }
    if (state?.error) {
      toast({
        variant: "destructive",
        title: "Error Extracting Prospects",
        description: state.error,
      });
    }
     if (state?.validationErrors) {
       Object.entries(state.validationErrors).forEach(([key, messages]) => {
        if (messages && messages.length > 0) {
          toast({
            variant: "destructive",
            title: `Invalid input for ${key}`,
            description: messages.join(', '),
          });
        }
      });
    }
  }, [state, toast]);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Autonomous Prospecting Engine</CardTitle>
           <CardDescription>
            Enter a URL and let the AI crawl the page and extract potential prospect data like company names, contacts, and emails.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-6">
             <div className="space-y-2">
              <Label htmlFor="url" className="text-base font-semibold">Website URL</Label>
              <Input id="url" name="url" placeholder="e.g., https://example.com" required type="url" className="text-base" disabled={isProspecting} />
              {state?.validationErrors?.url && (
                <p className="text-sm text-destructive">{state.validationErrors.url.join(', ')}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {isProspecting && !extractionResult && (
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
