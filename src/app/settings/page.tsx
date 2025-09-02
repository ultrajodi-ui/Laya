
'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getAuth, onAuthStateChanged, User, deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';


export default function SettingsPage() {
    const auth = getAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, [auth]);

    const handleDeleteAccount = async () => {
        if (!user) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "You must be logged in to delete an account.",
            });
            return;
        }

        setIsDeleting(true);
        try {
            // First, delete the user's document from Firestore.
            const userDocRef = doc(db, "users", user.uid);
            await deleteDoc(userDocRef);

            // Then, delete the user from Firebase Authentication.
            await deleteUser(user);

            toast({
                title: "Account Deleted",
                description: "Your account has been permanently deleted.",
            });
            router.push('/login');

        } catch (error: any) {
            console.error("Error deleting account:", error);
            // This can fail if the user needs to re-authenticate for security reasons.
            toast({
                variant: "destructive",
                title: "Deletion Failed",
                description: error.message || "An error occurred. You may need to log out and log back in before deleting your account.",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AppLayout>
            <div className="mx-auto grid max-w-4xl gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Settings</CardTitle>
                        <CardDescription>Manage your account settings and preferences.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="profile-visibility" className="text-base">Profile Visibility</Label>
                                <p className="text-sm text-muted-foreground">
                                    Control whether your profile is visible to others in search results.
                                </p>
                            </div>
                            <Switch id="profile-visibility" defaultChecked />
                        </div>

                        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="match-notifications" className="text-base">New Match Alerts</Label>
                                <p className="text-sm text-muted-foreground">
                                   Get notified when you have new AI-suggested matches.
                                </p>
                            </div>
                            <Switch id="match-notifications" />
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-destructive">Danger Zone</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">Delete Account</h3>
                                <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data. This action cannot be undone.</p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">Delete Account</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure you want to Delete your Account permanently?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your
                                        account and remove your data from our servers.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDeleteAccount}
                                        disabled={isDeleting}
                                        className="bg-destructive hover:bg-destructive/90"
                                    >
                                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {isDeleting ? 'Deleting...' : 'Yes, Delete Account'}
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
