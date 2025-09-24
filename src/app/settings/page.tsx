

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
import { doc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2, Zap } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';

const LimitDetail = ({ label, value }: { label: string, value: number | undefined }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value !== undefined ? value : 0}</span>
    </div>
);

export default function SettingsPage() {
    const auth = getAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUserProfile({ id: userDoc.id, ...userDoc.data() } as UserProfile);
                }
            } else {
                router.push('/login');
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [auth, router]);
    
    const handleVisibilityChange = async (isVisible: boolean) => {
        if (!user) return;

        const userDocRef = doc(db, "users", user.uid);
        const newStatus = isVisible ? 'Active' : 'Inactive';

        try {
            await updateDoc(userDocRef, {
                profileVisible: isVisible,
                currentStatus: newStatus
            });
            setUserProfile(prev => prev ? { ...prev, profileVisible: isVisible, currentStatus: newStatus as any } : null);
            toast({
                title: "Settings Updated",
                description: `Your profile is now ${isVisible ? 'visible' : 'hidden'} and your status is ${newStatus}.`,
            });
        } catch (error) {
            console.error("Error updating visibility:", error);
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'Could not update your visibility settings.',
            });
        }
    };


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
    
    if (isLoading) {
        return (
            <AppLayout>
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">My Account</CardTitle>
                            <CardDescription>Manage your account settings, subscription, and preferences.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="h-20 w-full animate-pulse rounded-lg border bg-muted" />
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="grid gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">My Account</CardTitle>
                        <CardDescription>Manage your account settings, subscription, and preferences.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="profile-visibility" className="text-base">Profile Visibility</Label>
                                <p className="text-sm text-muted-foreground">
                                    Control whether your profile is visible to others. Turning this off will also set your status to "Inactive".
                                </p>
                            </div>
                            <Switch 
                                id="profile-visibility" 
                                checked={userProfile?.profileVisible ?? true}
                                onCheckedChange={handleVisibilityChange}
                             />
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
                        <CardTitle className="font-headline">My Subscription</CardTitle>
                        <CardDescription>View your current plan details and limits.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <Label className="text-base">Current Plan</Label>
                                <p className="text-2xl font-bold">{userProfile?.usertype || 'Basic'}</p>
                            </div>
                            {userProfile?.usertype === 'admin' ? (
                                <Button disabled>
                                     <Zap className="mr-2 h-4 w-4" /> Admin
                                </Button>
                            ) : (
                                <Button asChild={userProfile?.usertype !== 'Diamond'} disabled={userProfile?.usertype === 'Diamond'} style={{ backgroundColor: '#4ca626', color: 'white' }}>
                                    <Link href="/upgrade" onClick={(e) => {if (userProfile?.usertype === 'Diamond') e.preventDefault();}}>
                                        <Zap className="mr-2 h-4 w-4" /> {userProfile?.usertype === 'Diamond' ? 'Highest Plan' : 'Upgrade Plan'}
                                    </Link>
                                </Button>
                            )}
                        </div>
                        
                        {userProfile?.usertype !== 'Basic' && userProfile?.usertype !== 'admin' && userProfile?.planStartDate && userProfile?.planEndDate && (
                            <div className="rounded-lg border p-4 text-center">
                                <Label className="text-sm text-muted-foreground">Plan Validity</Label>
                                <p className="font-semibold">{format(userProfile.planStartDate.toDate(), 'PP')} &mdash; {format(userProfile.planEndDate.toDate(), 'PP')}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 rounded-lg border p-4">
                                <Label>Contact View Limits</Label>
                                {userProfile?.contactLimit ? (
                                    <div className="space-y-1">
                                        <LimitDetail label="Diamond Profiles" value={userProfile.contactLimit.diamond} />
                                        <LimitDetail label="Gold Profiles" value={userProfile.contactLimit.gold} />
                                        <LimitDetail label="Silver Profiles" value={userProfile.contactLimit.silver} />
                                        <LimitDetail label="Basic Profiles" value={userProfile.contactLimit.basic} />
                                    </div>
                                ) : <p className="text-sm text-muted-foreground">No limits set.</p>}
                            </div>
                            <div className="space-y-2 rounded-lg border p-4">
                                <Label>Photo View Limits</Label>
                                 {userProfile?.photoViewLimits ? (
                                    <div className="space-y-1">
                                        <LimitDetail label="Diamond Profiles" value={userProfile.photoViewLimits.diamond} />
                                        <LimitDetail label="Gold Profiles" value={userProfile.photoViewLimits.gold} />
                                        <LimitDetail label="Silver Profiles" value={userProfile.photoViewLimits.silver} />
                                        <LimitDetail label="Basic Profiles" value={userProfile.photoViewLimits.basic} />
                                    </div>
                                ) : <p className="text-sm text-muted-foreground">No limits set.</p>}
                            </div>
                        </div>
                         <div className="space-y-2 rounded-lg border p-4">
                            <Label>Likes Limit</Label>
                             {userProfile?.likesLimits !== undefined ? (
                                <div className="space-y-1">
                                     <LimitDetail label="Likes Remaining" value={userProfile.likesLimits} />
                                </div>
                            ) : <p className="text-sm text-muted-foreground">No limit set.</p>}
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
