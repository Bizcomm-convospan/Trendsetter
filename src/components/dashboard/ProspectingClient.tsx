
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { handleProspectingJob, type ActionResponse } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, ClipboardCheck, ArrowRight, CircleAlert, CircleCheck, Hourglass } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, limit, Timestamp } from 'firebase/firestore';
import { format, formatDistanceToNow } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';

interface Job {
    id: string;
    url: string;
    status: 'queued' | 'processing' | 'complete' | 'failed';
    createdAt: Timestamp;
    updatedAt: Timestamp;
    error?: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
      Extract Prospects
    </Button>
  );
}

const statusInfo = {
    queued: { icon: Hourglass, color: 'bg-blue-500', label: 'Queued' },
    processing: { icon: Loader2, color: 'bg-yellow-500 animate-spin', label: 'Processing' },
    complete: { icon: CircleCheck, color: 'bg-green-500', label: 'Complete' },
    failed: { icon: CircleAlert, color: 'bg-red-500', label: 'Failed' },
};

export function ProspectingClient() {
    const { toast } = useToast();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [state, setState] = useState<ActionResponse<{ jobId: string }>>({});
    const [isSubmitting, startSubmitting] = useTransition();

    useEffect(() => {
        setIsLoading(true);
        const jobsRef = collection(db, 'prospecting_jobs');
        const q = query(jobsRef, orderBy('createdAt', 'desc'), limit(20));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const jobData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
            setJobs(jobData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching prospecting jobs:", error);
            toast({ variant: "destructive", title: "Could not load jobs" });
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);

    const formAction = (formData: FormData) => {
        startSubmitting(async () => {
            const result = await handleProspectingJob(formData);
            setState(result);
            if (result.data) {
                toast({ title: "Job Submitted!", description: `Job ID: ${result.data.jobId} has been queued.` });
            } else if (result.error) {
                toast({ variant: "destructive", title: "Submission Failed", description: result.error });
            }
        });
    };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="text-primary h-7 w-7"/>
            Autonomous Prospecting
          </CardTitle>
          <CardDescription>
            Enter a URL (e.g., a company's 'About Us' or 'Team' page) to automatically extract potential leads, including company names, people, roles, and contact info.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
            <CardContent>
                <Label htmlFor="url">Target URL</Label>
                <Input
                    id="url"
                    name="url"
                    type="url"
                    placeholder="https://example.com/about-us"
                    required
                    disabled={isSubmitting}
                />
                 {state?.validationErrors?.url && (
                    <p className="text-sm text-destructive mt-2">{state.validationErrors.url.join(', ')}</p>
                )}
            </CardContent>
            <CardFooter>
                <SubmitButton />
            </CardFooter>
        </form>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Recent Prospecting Jobs</CardTitle>
            <CardDescription>A real-time log of your 20 most recent jobs.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [...Array(3)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : jobs.length > 0 ? (
                        jobs.map(job => {
                            const status = statusInfo[job.status] || { icon: CircleAlert, color: 'bg-gray-400', label: 'Unknown' };
                            const Icon = status.icon;
                            return (
                                <TableRow key={job.id}>
                                    <TableCell>
                                        <Badge variant="outline" className="flex items-center gap-2">
                                            <span className={cn("h-2 w-2 rounded-full", status.color)}></span>
                                            {status.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm truncate max-w-xs">{job.url}</TableCell>
                                    <TableCell>{job.createdAt ? formatDistanceToNow(job.createdAt.toDate(), { addSuffix: true }) : 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        {job.status === 'complete' && (
                                            <Button asChild size="sm" variant="ghost">
                                                <Link href="/dashboard/prospects">View Prospects <ArrowRight className="ml-2 h-4 w-4"/></Link>
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                No prospecting jobs submitted yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
