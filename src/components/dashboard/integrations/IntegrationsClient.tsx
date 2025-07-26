
'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap, ExternalLink } from 'lucide-react';
import { handleSaveWebhookUrl, type ActionResponse } from '@/app/actions';
import Link from 'next/link';
import { TrendsetterProLogo } from '@/components/icons';


function SaveWebhookButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Webhook URL
        </Button>
    )
}

export function IntegrationsClient() {
  const { toast } = useToast();
  const [webhookUrlState, setWebhookUrlState] = useState<ActionResponse<{success: boolean}>>({});
  const firebaseProjectUrl = "https://console.firebase.google.com/project/trendsetter-pro/overview";

  const saveWebhookAction = async (formData: FormData) => {
    const result = await handleSaveWebhookUrl(formData);
    if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else {
        toast({ title: 'Success!', description: 'Your Zapier webhook URL has been saved.' });
    }
    setWebhookUrlState(result);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Integrations & Automations</h1>
        <p className="text-lg text-muted-foreground">
          Connect Trendsetter Pro to your favorite tools and build automated workflows.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg">
            <form action={saveWebhookAction}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#FF4A00]">
                            <Zap className="text-white" />
                        </div>
                        Zapier
                    </CardTitle>
                    <CardDescription>
                        Connect Trendsetter Pro to thousands of apps. The primary use case is to automatically publish your generated articles to WordPress, Ghost, or any other CMS.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="webhookUrl">Your Zapier Webhook URL</Label>
                        <Input 
                            id="webhookUrl"
                            name="webhookUrl"
                            type="url"
                            placeholder="https://hooks.zapier.com/hooks/catch/..."
                        />
                        {webhookUrlState.validationErrors?.webhookUrl && (
                            <p className="text-sm text-destructive">{webhookUrlState.validationErrors.webhookUrl}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Create a "Catch Hook" trigger in <a href="https://zapier.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Zapier</a> and paste the URL here to enable publishing automation.
                        </p>
                    </div>
                </CardContent>
                <CardFooter>
                    <SaveWebhookButton />
                </CardFooter>
            </form>
        </Card>

        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#FFCA28]">
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.73 4.26L17.65 3.18C17.04 2.57 16.14 2.5 15.45 2.9L5.3 7.93C4.6 8.32 4.6 9.33 5.3 9.72L12.01 13.33L18.73 4.26Z" fill="#FBC02D"/>
                        <path d="M12.01 13.33L14.28 21.05C14.62 21.75 15.52 21.9 16.27 21.46L18.72 19.86L12.01 13.33Z" fill="#FFA000"/>
                        <path d="M5.3 9.72L10.33 12.33L12.01 13.33L5.3 9.72Z" fill="#FFCA28"/>
                        <path d="M18.72 19.86L18.73 4.26L12.01 13.33L16.27 21.46C16.92 21.9 17.82 21.75 18.16 21.05L18.72 19.86Z" fill="#F57C00"/>
                        </svg>

                    </div>
                    Firebase
                </CardTitle>
                <CardDescription>
                    Your project's backend services, including the database and AI agents, are hosted on Firebase. Access the console to manage your project.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Use the Firebase Console to view application logs, browse your Firestore database, and monitor function performance.
                </p>
            </CardContent>
            <CardFooter>
                <Button asChild variant="outline">
                    <Link href={firebaseProjectUrl} target="_blank" rel="noopener noreferrer">
                        Open Firebase Console
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>

      </div>
    </div>
  );
}
