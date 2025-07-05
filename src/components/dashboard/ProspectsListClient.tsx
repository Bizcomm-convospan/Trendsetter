
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Users, Link as LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';

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
                        <TableHead className="w-[20%]">Company</TableHead>
                        <TableHead className="w-[25%]">People</TableHead>
                        <TableHead>Emails</TableHead>
                        <TableHead>Links</TableHead>
                        <TableHead>Keywords</TableHead>
                        <TableHead className="text-right">Date Found</TableHead>
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
                                <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
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
                                <TableCell className="text-right text-sm text-muted-foreground">
                                    {prospect.createdAt ? format(prospect.createdAt.toDate(), 'PP') : 'N/A'}
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
