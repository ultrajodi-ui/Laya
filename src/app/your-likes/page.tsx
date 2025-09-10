
'use client';

import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Briefcase, Heart, IndianRupee, MapPin, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, getDocs, query, where, arrayRemove, writeBatch, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from '@/hooks/use-toast';
import { usePageTitle } from "@/hooks/use-page-title";

function YourLikesContent() {
    const [likedUsers, setLikedUsers] = useState<UserProfile[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const auth = getAuth();
    const { toast } = useToast();
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Your Likes');
    }, [setPageTitle]);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
                const userDocRef = doc(db, 'users', user.uid);
                const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const userProfile = { id: docSnap.id, ...docSnap.data() } as UserProfile;
                        setCurrentUserProfile(userProfile);
                        fetchLikedUsers(userProfile);
                    } else {
                        setLoading(false);
                    }
                });
                return () => unsubscribeSnapshot();
            } else {
                setCurrentUser(null);
                setCurrentUserProfile(null);
                setLikedUsers([]);
                setLoading(false);
            }
        });

        const fetchLikedUsers = async (currentUserProfile: UserProfile) => {
            if (!currentUserProfile.likes || currentUserProfile.likes.length === 0) {
                setLikedUsers([]);
                setLoading(false);
                return;
            }

            try {
                const usersQuery = query(collection(db, "users"), where("memberid", "in", currentUserProfile.likes));
                const usersSnapshot = await getDocs(usersQuery);
                const fetchedUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
                setLikedUsers(fetchedUsers);
            } catch (error) {
                console.error("Error fetching liked users:", error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Could not fetch your liked profiles.',
                });
            } finally {
                setLoading(false);
            }
        };

        return () => unsubscribeAuth();
    }, [auth, toast]);

    const calculateAge = (dob: any) => {
        if (!dob) return 0;
        const birthDate = dob.toDate();
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
    
    const handleUnlikeClick = async (targetUser: UserProfile) => {
        if (!currentUser || !currentUserProfile?.memberid || !targetUser.memberid) {
            toast({
                variant: 'destructive',
                title: 'Not logged in',
                description: 'You must be logged in to unlike profiles.',
            });
            return;
        }

        const currentUserId = currentUser.uid;
        const currentUserMemberId = currentUserProfile.memberid;
        const targetUserMemberId = targetUser.memberid;
        
        const userDocRef = doc(db, 'users', currentUserId);

        try {
            const batch = writeBatch(db);

            // Remove like from current user's profile
            batch.update(userDocRef, {
                likes: arrayRemove(targetUserMemberId)
            });

            // Delete from likesReceived collection
            const likeReceivedDocId = `${currentUserMemberId}_likes_${targetUserMemberId}`;
            const likeReceivedDocRef = doc(db, 'likesReceived', likeReceivedDocId);
            batch.delete(likeReceivedDocRef);

            await batch.commit();

            // Remove from local state to update UI instantly
            setLikedUsers(prev => prev.filter(u => u.id !== targetUser.id));

            toast({
                title: 'Like Removed',
                description: 'You have unliked this profile.',
            });
        } catch (error) {
            console.error("Failed to update like:", error);
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'Could not remove your like. Please try again.',
            });
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-headline font-bold">Profiles You've Liked</h1>
            {loading ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                         <Card key={i} className="overflow-hidden">
                             <Skeleton className="w-full h-64" />
                            <CardContent className="p-4 space-y-2">
                                 <Skeleton className="h-6 w-3/4" />
                                 <Skeleton className="h-4 w-1/2" />
                                 <Skeleton className="h-10 w-full" />
                            </CardContent>
                            <CardFooter className="p-4 pt-0">
                                <Skeleton className="h-10 w-full" />
                            </CardFooter>
                         </Card>
                    ))}
                 </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {likedUsers.map(user => {
                        const profileImageUrl = user.photoVisibility === 'Protected' 
                            ? `https://picsum.photos/seed/default-avatar/400/400`
                            : user.imageUrl || `https://picsum.photos/seed/${user.id}/400/400`;
                        return (
                        <Card key={user.id} className="overflow-hidden transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
                             <CardHeader className="p-0">
                                <Link href={`/profile/${user.id}`}>
                                    <Image
                                        src={profileImageUrl}
                                        alt={user.fullName || 'User'}
                                        width={400}
                                        height={400}
                                        data-ai-hint="person portrait"
                                        className="w-full h-64 object-cover"
                                    />
                                </Link>
                            </CardHeader>
                            <CardContent className="p-4 space-y-2">
                                <div>
                                    <Link href={`/profile/${user.id}`}>
                                        <h3 className="text-xl font-headline font-semibold">{user.fullName}, {calculateAge(user.dob)}</h3>
                                    </Link>
                                    <p className="text-sm text-muted-foreground">ID: {user.memberid}</p>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    <span>{user.city}</span>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Briefcase className="w-4 h-4 mr-1" />
                                    <span>{user.occupation}</span>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Badge variant="secondary">{user.subCaste}</Badge>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <IndianRupee className="w-4 h-4 mr-1" />
                                    <span>{user.salary}</span>
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-0">
                                 <Button variant="outline" className="w-full" onClick={() => handleUnlikeClick(user)}>
                                    <X className="mr-2 h-4 w-4" /> Unlike
                                </Button>
                            </CardFooter>
                        </Card>
                    )})}
                </div>
            )}

            {!loading && likedUsers.length === 0 && (
                <div className="text-center col-span-full py-16">
                    <p className="text-muted-foreground">You haven't liked any profiles yet. Start browsing!</p>
                </div>
            )}
        </div>
    );
}

export default function YourLikesPage() {
    return (
        <AppLayout>
            <YourLikesContent />
        </AppLayout>
    );
}
