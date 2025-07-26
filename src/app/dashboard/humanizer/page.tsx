
// This page is now deprecated. The functionality has been merged into the 
// Content Creation Hub for a more integrated user experience.

import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit } from 'lucide-react';

export default function DeprecatedHumanizerPage() {
  return (
    <AppLayout>
        <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <CardTitle>Page Moved</CardTitle>
                    <CardDescription>
                        The AI Humanizer has been merged into the main Content Creation Hub for a better workflow.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">You can now rewrite and humanize your articles directly from the editor.</p>
                    <Button asChild>
                        <Link href="/dashboard/content-creation">
                            <Edit className="mr-2 h-4 w-4" />
                            Go to Content Hub
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    </AppLayout>
  );
}
