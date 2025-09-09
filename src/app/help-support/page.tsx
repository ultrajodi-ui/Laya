
'use client';

import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LifeBuoy } from "lucide-react";
import { useState } from "react";


export default function HelpSupportPage() {
    const { toast } = useToast();
    const [query, setQuery] = useState('');

    const handleSubmit = () => {
        if (query.trim() === '') {
            toast({
                variant: 'destructive',
                title: 'Empty Query',
                description: 'Please enter your question before submitting.',
            });
            return;
        }
        // Here you would typically send the query to a support service or backend.
        // For now, we'll just show a success message.
        console.log('User Query:', query);
        toast({
            title: 'Query Submitted',
            description: 'Thank you! Our support team will get back to you shortly.',
        });
        setQuery('');
    }

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <LifeBuoy className="text-primary" />
                            Help & Support
                        </CardTitle>
                        <CardDescription>
                            Have a question or need assistance? Fill out the form below and our support team will get back to you as soon as possible.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea 
                            placeholder="Type your question or issue here..."
                            rows={8}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSubmit}>Submit Your Queries</Button>
                    </CardFooter>
                </Card>
            </div>
        </AppLayout>
    );
}
