
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Users, Link as LinkIcon, Mail, Loader2, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { type ActionResponse, handleEmailOutreach } from '@/app/actions';
import type { EmailOutreachOutput } from '@/ai/flows/email-outreach-flow';

interface Person {
    name: string;
    role?: string;
}

interface Prospect {
    id: string;
    companyName?: string;
    people?: Person[];
    emails?: string[];
    links?: string[];
    industryKeywords?: string[];
    sourceUrl: string;
    createdAt: Timestamp;
}

function EmailOutreachDialog({ prospect }: { prospect: Prospect }) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [isGenerating, startGenerating] = useTransition();
    const [result, setResult] = useState<ActionResponse<EmailOutreachOutput>>({});
    
    const formAction = (formData: FormData) => {
        setResult({});
        startGenerating(async () => {
            const response = await handleEmailOutreach(formData);
            setResult(response);
            if (response.data) {
                toast({ title: "Email Drafted!", description: "Your personalized outreach email is ready." });
            } else {
                toast({ variant: 'destructive', title: "Error", description: response.error });
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <Mail className="mr-2 h-4 w-4"/> Draft Email
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Draft Outreach Email for {prospect.companyName}</DialogTitle>
                    <DialogDescription>
                        Provide details about your offer and the AI will draft a personalized email based on the prospect's data.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} className="space-y-4">
                    <input type="hidden" name="prospectJson" value={JSON.stringify(prospect)} />
                    <div className="space-y-2">
                        <Label htmlFor="ourCompanyOffer">Your Company's Offer</Label>
                        <Input id="ourCompanyOffer" name="ourCompanyOffer" placeholder="e.g., We help B2B companies double their leads with AI..." required disabled={isGenerating} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="senderName">Your Name (Sender)</Label>
                        <Input id="senderName" name="senderName" placeholder="e.g., Jane Doe" required disabled={isGenerating} />
                    </div>
                    <Button type="submit" disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Generate Email
                    </Button>
                </form>

                {isGenerating && (
                    <div className="pt-4 space-y-4">
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                )}
                
                {result.data && (
                    <div className="pt-4 space-y-4 border-t">
                        <h3 className="text-lg font-semibold">Generated Email Draft</h3>
                        <div className="space-y-2">
                            <Label>Subject Line</Label>
                            <Input value={result.data.subjectLine} readOnly className="bg-muted/50 font-medium" />
                        </div>
                        <div className="space-y-2">
                            <Label>Email Body</Label>
                            <Textarea value={result.data.emailBody} readOnly rows={10} className="bg-muted/50" />
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export function ProspectsListClient() {
    const { toast } = useToast();
    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const prospectsRef = collection(db, 'prospects');
        const q = query(prospectsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prospect));
            setProspects(data);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching prospects:", error);
            toast({ variant: "destructive", title: "Could not load prospects list" });
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-primary h-7 w-7" />
            Extracted Prospects
          </CardTitle>
          <CardDescription>
            This is a real-time list of all prospects extracted from the URLs you've submitted.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[15%]">Company</TableHead>
                        <TableHead className="w-[20%]">People</TableHead>
                        <TableHead className="w-[15%]">Emails</TableHead>
                        <TableHead>Links</TableHead>
                        <TableHead>Keywords</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : prospects.length > 0 ? (
                        prospects.map(prospect => (
                            <TableRow key={prospect.id}>
                                <TableCell className="font-semibold text-foreground">{prospect.companyName || 'N/A'}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        {prospect.people?.map(p => (
                                            <div key={p.name}>
                                                <p className="font-medium text-sm">{p.name}</p>
                                                {p.role && <p className="text-xs text-muted-foreground">{p.role}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        {prospect.emails?.map(email => <span key={email} className="text-sm">{email}</span>)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        {prospect.links?.map(link => (
                                            <Link href={link} key={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline text-sm truncate">
                                                <LinkIcon className="h-3 w-3" />
                                                {link.replace(/^(https?:\/\/)?(www\.)?/, '')}
                                            </Link>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {prospect.industryKeywords?.map(kw => <Badge key={kw} variant="secondary">{kw}</Badge>)}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <EmailOutreachDialog prospect={prospect} />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center">
                                No prospects found yet. Go to the "Autonomous Prospecting" page to start a job.
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
