
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
import { collection, doc, getDocs, query, where, arrayUnion, arrayRemove, updateDoc, writeBatch, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import { usePageTitle } from "@/hooks/use-page-title";

function LikesReceivedContent() {
    const [likedByUsers, setLikedByUsers] = useState<UserProfile[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const auth = getAuth();
    const { toast } = useToast();
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Likes Received');
    }, [setPageTitle]);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userProfile = { id: userDocSnap.id, ...userDocSnap.data() } as UserProfile;
                    setCurrentUserProfile(userProfile);
                    fetchLikedByUsers(userProfile);
                } else {
                    setLoading(false);
                }
            } else {
                setCurrentUser(null);
                setCurrentUserProfile(null);
                setLikedByUsers([]);
                setLoading(false);
            }
        });

        const fetchLikedByUsers = async (currentUserProfile: UserProfile) => {
            if (!currentUserProfile.memberid) {
                setLoading(false);
                return;
            }

            try {
                const likesReceivedQuery = query(collection(db, "likesReceived"), where("likedUser", "==", currentUserProfile.memberid));
                const querySnapshot = await getDocs(likesReceivedQuery);
                const likedByUserMemberIds = querySnapshot.docs.map(doc => doc.data().likedBy);
                const dislikedUserIds = currentUserProfile.dislikes || [];

                const relevantUserIds = likedByUserMemberIds.filter(id => !dislikedUserIds.includes(id));


                if (relevantUserIds.length > 0) {
                    const usersQuery = query(collection(db, "users"), where("memberid", "in", relevantUserIds));
                    const usersSnapshot = await getDocs(usersQuery);
                    const fetchedUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
                    setLikedByUsers(fetchedUsers);
                } else {
                    // It's not an error if nobody has liked the user yet.
                    setLikedByUsers([]);
                }
            } catch (error) {
                console.error("Error fetching liked by users:", error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Could not fetch users who liked you.',
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

    const handleDislikeClick = async (targetUserId: string | undefined) => {
        if (!currentUser || !targetUserId) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not perform action. Please try again.',
            });
            return;
        }

        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, {
                dislikes: arrayUnion(targetUserId)
            });

            // Optimistically remove the user from the UI
            setLikedByUsers(prevUsers => prevUsers.filter(user => user.memberid !== targetUserId));

            toast({
                title: 'Profile Hidden',
                description: "You won't see this profile in your received likes anymore.",
            });
        } catch (error) {
             console.error("Failed to dislike user:", error);
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'Could not hide profile. Please try again.',
            });
        }
    };
    
    const handleLikeClick = async (targetUser: UserProfile) => {
        if (!currentUser || !currentUserProfile?.memberid || !targetUser.memberid) {
            toast({
                variant: 'destructive',
                title: 'Not logged in',
                description: 'You must be logged in to like profiles.',
            });
            return;
        }

        const currentUserId = currentUser.uid;
        const currentUserMemberId = currentUserProfile.memberid;
        const targetUserMemberId = targetUser.memberid;
        
        const userDocRef = doc(db, 'users', currentUserId);
        const isLiked = currentUserProfile?.likes?.includes(targetUserMemberId);

        try {
            const batch = writeBatch(db);

            if (isLiked) {
                batch.update(userDocRef, {
                    likes: arrayRemove(targetUserMemberId)
                });
                const likeReceivedDocId = `${currentUserMemberId}_likes_${targetUserMemberId}`;
                const likeReceivedDocRef = doc(db, 'likesReceived', likeReceivedDocId);
                batch.delete(likeReceivedDocRef);
                await batch.commit();
                toast({
                    title: 'Like Removed',
                    description: 'You have unliked this profile.',
                });
            } else {
                batch.update(userDocRef, {
                    likes: arrayUnion(targetUserMemberId)
                });
                const likeReceivedDocId = `${currentUserMemberId}_likes_${targetUserMemberId}`;
                const likeReceivedDocRef = doc(db, 'likesReceived', likeReceivedDocId);
                batch.set(likeReceivedDocRef, {
                    likedBy: currentUserMemberId,
                    likedUser: targetUserMemberId,
                    timestamp: new Date()
                });
                await batch.commit();
                toast({
                    title: 'Liked!',
                    description: 'Your like has been noted.',
                });
            }
             // Manually update the local state for immediate UI feedback
            setCurrentUserProfile(prev => {
                if (!prev) return null;
                const newLikes = isLiked ? prev.likes?.filter(id => id !== targetUserMemberId) : [...(prev.likes || []), targetUserMemberId];
                return { ...prev, likes: newLikes };
            });

        } catch (error) {
            console.error("Failed to update like:", error);
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'Could not update your like. Please try again.',
            });
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-headline font-bold">Who Liked You</h1>
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
                    {likedByUsers.map(user => {
                        const isLiked = currentUserProfile?.likes?.includes(user.memberid!);
                        const profileImageUrl = user.photoVisibility === 'Private' 
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
                            <CardFooter className="p-4 pt-0 flex gap-2">
                                 <Button variant="outline" size="icon" className="border-destructive text-destructive hover:bg-destructive/10" onClick={() => handleDislikeClick(user.memberid)}>
                                    <X className="h-4 w-4" />
                                 </Button>
                                 <Button style={{ backgroundColor: '#3B2F2F' }} className="w-full text-white hover:bg-slate-800/90" onClick={() => handleLikeClick(user)}>
                                    <Heart className={cn("mr-2 h-4 w-4", isLiked && "fill-red-500 text-red-500")} /> {isLiked ? 'Liked Back' : 'Like'}
                                </Button>
                            </CardFooter>
                        </Card>
                    )})}
                </div>
            )}

            {!loading && likedByUsers.length === 0 && (
                <div className="text-center col-span-full py-16">
                    <p className="text-muted-foreground">No one has liked your profile yet. Keep exploring!</p>
                </div>
            )}
        </div>
    );
}

export default function LikesReceivedPage() {
    return (
        <AppLayout>
            <LikesReceivedContent />
        </AppLayout>
    );
}
