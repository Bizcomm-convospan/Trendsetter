'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, type Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardList, Users, Building2, Mail, Link as LinkIcon, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import type { ExtractedProspect } from '@/ai/flows/autonomous-prospecting';

// Add the Firestore metadata fields to the prospect type
interface ProspectDocument extends ExtractedProspect {
  id: string;
  sourceUrl: string;
  jobId: string;
  createdAt: Timestamp;
}

function ProspectRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
    </TableRow>
  );
}

export function ProspectsListClient() {
  const [prospects, setProspects] = useState<ProspectDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'prospects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const prospectsData: ProspectDocument[] = [];
      querySnapshot.forEach((doc) => {
        prospectsData.push({ id: doc.id, ...doc.data() } as ProspectDocument);
      });
      setProspects(prospectsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching prospects:", error);
      setIsLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
             <ClipboardList className="h-8 w-8 text-primary" />
             <div>
                <CardTitle className="text-2xl font-bold">All Prospects</CardTitle>
                <CardDescription>
                A real-time list of all prospects extracted by the AI engine.
                </CardDescription>
             </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Building2 className="inline-block mr-2 h-4 w-4" />Company</TableHead>
                  <TableHead><Users className="inline-block mr-2 h-4 w-4" />Contacts</TableHead>
                  <TableHead><Mail className="inline-block mr-2 h-4 w-4" />Emails</TableHead>
                  <TableHead><LinkIcon className="inline-block mr-2 h-4 w-4" />Source</TableHead>
                  <TableHead><Calendar className="inline-block mr-2 h-4 w-4" />Date Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <>
                    <ProspectRowSkeleton />
                    <ProspectRowSkeleton />
                    <ProspectRowSkeleton />
                    <ProspectRowSkeleton />
                    <ProspectRowSkeleton />
                  </>
                ) : prospects.length > 0 ? (
                  prospects.map((prospect) => (
                    <TableRow key={prospect.id}>
                      <TableCell className="font-medium text-foreground">{prospect.companyName || 'N/A'}</TableCell>
                      <TableCell>
                        {prospect.people && prospect.people.length > 0 ? (
                          <div className="flex flex-col gap-1 text-sm">
                            {prospect.people.map(p => <span key={p.name}>{p.name} {p.role && <span className="text-muted-foreground">({p.role})</span>}</span>)}
                          </div>
                        ) : <span className="text-muted-foreground">None</span>}
                      </TableCell>
                      <TableCell>
                        {prospect.emails && prospect.emails.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {prospect.emails.map(e => <a href={`mailto:${e}`} key={e} className="text-primary hover:underline truncate text-sm">{e}</a>)}
                          </div>
                        ) : <span className="text-muted-foreground">None</span>}
                      </TableCell>
                      <TableCell>
                          <a href={prospect.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate block max-w-xs text-sm">{prospect.sourceUrl}</a>
                      </TableCell>
                      <TableCell className="text-sm">
                        {prospect.createdAt ? format(prospect.createdAt.toDate(), 'PP') : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No prospects found yet. Run the prospecting engine to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
