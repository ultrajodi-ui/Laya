
'use client';

import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LifeBuoy, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import type { UserProfile } from "@/lib/types";

export default function HelpSupportPage() {
    const { toast } = useToast();
    const [query, setQuery] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUserProfile(docSnap.data() as UserProfile);
                }
            } else {
                setUser(null);
                setUserProfile(null);
            }
            setIsLoadingUser(false);
        });

        return () => unsubscribe();
    }, [auth]);

    const handleSubmit = async () => {
        if (query.trim() === '') {
            toast({
                variant: 'destructive',
                title: 'Empty Query',
                description: 'Please enter your question before submitting.',
            });
            return;
        }

        if (!user || !userProfile) {
             toast({
                variant: 'destructive',
                title: 'Not Logged In',
                description: 'You must be logged in to submit a query.',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "supportQueries"), {
                userId: user.uid,
                name: userProfile.fullName,
                memberId: userProfile.memberid,
                email: userProfile.email,
                contactNo: userProfile.mobileNo,
                query: query,
                submittedAt: serverTimestamp(),
                status: 'new'
            });

            toast({
                title: 'Query Submitted',
                description: 'Thank you! Our support team will get back to you shortly.',
            });
            setQuery('');
        } catch (error) {
            console.error("Error submitting query: ", error);
            toast({
                variant: 'destructive',
                title: 'Submission Failed',
                description: 'There was an error submitting your query. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <AppLayout>
            <div className="flex flex-col gap-4">
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
                            disabled={isSubmitting || isLoadingUser}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSubmit} disabled={isSubmitting || isLoadingUser}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? 'Submitting...' : 'Submit Your Queries'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </AppLayout>
    );
}
