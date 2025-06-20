
'use client';

import { useState, useEffect } from 'react';
import { useActionState, useFormStatus } from 'react'; // Changed from react-dom
import { handleFindProspects, ActionResponse } from '@/app/actions';
import type { AutonomousProspectingOutput, ProspectData } from '@/ai/flows/autonomous-prospecting';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, Search, Building2, User, Briefcase, Linkedin, ExternalLink } from 'lucide-react';
import Link from 'next/link';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
      Find Prospects
    </Button>
  );
}

function ProspectCard({ prospect }: { prospect: ProspectData }) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Building2 className="mr-2 h-5 w-5 text-primary" />
          {prospect.companyName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 flex-grow">
        <div className="flex items-center text-sm text-foreground">
          <User className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{prospect.contactName}</span>
        </div>
        <div className="flex items-center text-sm text-foreground">
          <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{prospect.jobTitle}</span>
        </div>
        {prospect.linkedinProfile && (
          <div className="flex items-center text-sm">
            <Linkedin className="mr-2 h-4 w-4 text-muted-foreground" />
            <Link href={prospect.linkedinProfile} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
              LinkedIn Profile <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProspectingClient() {
  const [prospects, setProspects] = useState<AutonomousProspectingOutput | null>(null);
  const { toast } = useToast();
  const { pending } = useFormStatus();


  const initialState: ActionResponse<AutonomousProspectingOutput> = {};
  const [state, formAction] = useActionState(handleFindProspects, initialState); // Changed to useActionState

  useEffect(() => {
    if (state?.data) {
      setProspects(state.data);
      toast({
        title: "Prospects Found!",
        description: `Discovered ${state.data.length} potential prospects.`,
      });
    }
    if (state?.error) {
      toast({
        variant: "destructive",
        title: "Error Finding Prospects",
        description: state.error,
      });
    }
     if (state?.validationErrors) {
       Object.entries(state.validationErrors).forEach(([key, messages]) => {
        if (messages && messages.length > 0) {
          toast({
            variant: "destructive",
            title: `Invalid ${key}`,
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
            Define your Ideal Customer Profile (ICP) to find relevant prospects.
            AI will crawl public web data based on your criteria.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="industry" className="text-base font-semibold">Industry</Label>
                <Input id="industry" name="industry" placeholder="e.g., tech, healthcare" required className="text-base" />
                {state?.validationErrors?.industry && (
                  <p className="text-sm text-destructive">{state.validationErrors.industry.join(', ')}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="region" className="text-base font-semibold">Region</Label>
                <Input id="region" name="region" placeholder="e.g., US, Europe" required className="text-base" />
                 {state?.validationErrors?.region && (
                  <p className="text-sm text-destructive">{state.validationErrors.region.join(', ')}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitles" className="text-base font-semibold">Job Titles (comma-separated)</Label>
              <Input id="jobTitles" name="jobTitles" placeholder="e.g., CEO, CTO, Marketing Manager" required className="text-base" />
              <p className="text-xs text-muted-foreground">Enter multiple job titles separated by commas.</p>
              {state?.validationErrors?.jobTitles && (
                <p className="text-sm text-destructive">{state.validationErrors.jobTitles.join(', ')}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {pending && !prospects && (
        <div className="text-center py-10">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">Searching for prospects...</p>
        </div>
      )}

      {prospects && (
        <section className="animate-fadeIn">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Users className="mr-3 h-7 w-7 text-primary" />
            Prospect Dashboard ({prospects.length} found)
          </h2>
          {prospects.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {prospects.map((prospect, index) => (
                <ProspectCard key={`${prospect.companyName}-${prospect.contactName}-${index}`} prospect={prospect} />
              ))}
            </div>
          ) : (
            <Card className="shadow-md">
              <CardContent className="py-10 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl font-semibold text-foreground">No Prospects Found</p>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your ICP criteria or the AI might not have found matches for the current input.
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      )}
    </div>
  );
}
