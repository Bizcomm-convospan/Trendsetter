
'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap } from 'lucide-react';
import { handleSaveWebhookUrl, type ActionResponse } from '@/app/actions';

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
      </div>
    </div>
  );
}
