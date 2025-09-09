


'use client';

import { useState, useEffect, use } from 'react';
import { collection, doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot, writeBatch, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AppLayout } from "@/components/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Calendar, Sparkles, MapPin, Eye, Star, Shield, Gem } from "lucide-react";
import Image from "next/image";
import { Skeleton } from '@/components/ui/skeleton';
import type { UserProfile } from '@/lib/types';
import { format, differenceInYears } from 'date-fns';
import { usePageTitle } from '@/hooks/use-page-title';
import { cn } from '@/lib/utils';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';

const calculateAge = (dob: any) => {
    if (!dob) return 0;
    const birthDate = dob.toDate ? dob.toDate() : new Date(dob);
    return differenceInYears(new Date(), birthDate);
}

const UserTypeIcon = ({ usertype }: { usertype?: string }) => {
    switch (usertype) {
        case 'Silver': return <Star className="w-5 h-5 ml-2 text-slate-500" />;
        case 'Gold': return <Shield className="w-5 h-5 ml-2 text-yellow-500" />;
        case 'Diamond': return <Gem className="w-5 h-5 ml-2 text-blue-500" />;
        default: return null;
    }
};

function ProfileContent({ id }: { id: string }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const { setPageTitle } = usePageTitle();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
    const auth = getAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [isContactVisible, setIsContactVisible] = useState(false);
    const [showUpgradeAlert, setShowUpgradeAlert] = useState(false);


    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if(user) {
                setCurrentUser(user);
                const userDocRef = doc(db, 'users', user.uid);
                const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists()) {
                        const profile = { id: doc.id, ...doc.data() } as UserProfile;
                        setCurrentUserProfile(profile);
                    }
                });
                return () => unsubscribeSnapshot();
            } else {
                setCurrentUser(null);
                setCurrentUserProfile(null);
            }
        });
        return () => unsubscribeAuth();
    }, [auth]);

    useEffect(() => {
        if (currentUserProfile && user) {
             if (currentUserProfile.role === 'admin') {
                setIsContactVisible(true);
                return;
            }
            const hasViewed = currentUserProfile.viewedContacts?.includes(user.memberid!);
            if (hasViewed) {
                setIsContactVisible(true);
            }
        }
    }, [currentUserProfile, user]);


    const handleLikeClick = async () => {
        if (!currentUser || !currentUserProfile?.memberid || !user?.memberid) {
            toast({
                variant: 'destructive',
                title: 'Not logged in',
                description: 'You must be logged in to like profiles.',
            });
            return;
        }

        const currentUserId = currentUser.uid;
        const currentUserMemberId = currentUserProfile.memberid;
        const targetUserMemberId = user.memberid;

        const userDocRef = doc(db, 'users', currentUserId);
        const isLiked = currentUserProfile?.likes?.includes(targetUserMemberId);

        try {
            const batch = writeBatch(db);

            if (isLiked) {
                // Remove like from current user's profile
                batch.update(userDocRef, {
                    likes: arrayRemove(targetUserMemberId)
                });

                // Delete from likesReceived collection
                const likeReceivedDocId = `${currentUserMemberId}_likes_${targetUserMemberId}`;
                const likeReceivedDocRef = doc(db, 'likesReceived', likeReceivedDocId);
                batch.delete(likeReceivedDocRef);

                await batch.commit();
                toast({
                    title: 'Like Removed',
                    description: 'You have unliked this profile.',
                });
            } else {
                // Add like to current user's profile
                batch.update(userDocRef, {
                    likes: arrayUnion(targetUserMemberId)
                });

                 // Add to likesReceived collection
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
        } catch (error) {
            console.error("Failed to update like:", error);
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'Could not update your like. Please try again.',
            });
        }
    };
    
    const handleViewContact = async () => {
        if (!currentUser || !currentUserProfile || !user?.memberid) {
            toast({ variant: 'destructive', title: 'Please log in to view contact details.' });
            return;
        }

        // Admin check
        if (currentUserProfile.role === 'admin') {
            setIsContactVisible(true);
            return;
        }

        // Rule: Basic users cannot see premium users' contact details
        const isCurrentUserBasic = !currentUserProfile.usertype || currentUserProfile.usertype === 'Basic';
        const isTargetUserPremium = user.usertype && user.usertype !== 'Basic';

        if (isCurrentUserBasic && isTargetUserPremium) {
            setShowUpgradeAlert(true);
            return;
        }

        const hasViewed = currentUserProfile.viewedContacts?.includes(user.memberid);
        if (hasViewed) {
             setIsContactVisible(true);
             return;
        }

        const contactLimit = currentUserProfile.contactLimit ?? 0;

        if (contactLimit > 0) {
            const userDocRef = doc(db, 'users', currentUser.uid);
            try {
                await updateDoc(userDocRef, {
                    contactLimit: increment(-1),
                    viewedContacts: arrayUnion(user.memberid)
                });
                setIsContactVisible(true);
                toast({ title: 'Contact revealed', description: `You have ${contactLimit - 1} views remaining.` });
            } catch (error) {
                console.error("Error updating contact limit:", error);
                toast({ variant: 'destructive', title: 'Could not update contact limit.' });
            }
        } else {
             setShowUpgradeAlert(true);
        }
    };


    useEffect(() => {
        const fetchUser = async () => {
            if (id) {
                const userDocRef = doc(db, 'users', id as string);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = { id: userDoc.id, ...userDoc.data() } as UserProfile
                    setUser(userData);
                    if (userData.gender === 'male') {
                        setPageTitle('Groom Profile');
                    } else {
                        setPageTitle('Bride Profile');
                    }
                }
            }
            setLoading(false);
        };

        fetchUser();
    }, [id, setPageTitle]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <Card className="overflow-hidden">
                    <Skeleton className="h-48 md:h-64 w-full" />
                    <CardHeader className="pt-20 md:pt-24 relative">
                        <Skeleton className="absolute bottom-4 left-6 w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-background" />
                         <Skeleton className="h-8 w-1/2" />
                         <Skeleton className="h-5 w-1/3" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-1/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-1/4" />
                            <div className="flex flex-wrap gap-2">
                                <Skeleton className="h-8 w-20" />
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-8 w-16" />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="text-center">
                <h2 className="text-2xl font-bold">User not found</h2>
                <p>The profile you are looking for does not exist.</p>
            </div>
        );
    }
    
    const isLiked = user.memberid ? currentUserProfile?.likes?.includes(user.memberid) : false;
    const profileImageUrl = user.photoVisibility === 'Protected' 
        ? `https://picsum.photos/seed/default-avatar/100/100`
        : user.imageUrl || `https://picsum.photos/seed/${user.id}/100/100`;
    const heightValue = user.heightFeet && user.heightInches 
        ? `${user.heightFeet}' ${user.heightInches}"` 
        : '-';

    return (
         <AlertDialog open={showUpgradeAlert} onOpenChange={setShowUpgradeAlert}>
            <div className="max-w-4xl mx-auto space-y-6">
                <Card className="overflow-hidden">
                    <div className="relative h-48 md:h-64 bg-muted">
                        <Image src={user.coverUrl || `https://picsum.photos/seed/${user.id}-cover/1200/400`} alt={`${user.fullName}'s cover photo`} fill style={{objectFit: "cover"}} data-ai-hint="romantic landscape" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-6">
                            <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background">
                                <AvatarImage src={profileImageUrl} alt={user.fullName} />
                                <AvatarFallback>{user.fullName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                    <CardHeader className="pt-20 md:pt-24 relative">
                        <div className="absolute top-4 right-4">
                            <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleLikeClick}>
                                <Heart className={cn("mr-2 h-4 w-4", isLiked && "fill-red-500 text-red-500")} /> Like
                            </Button>
                        </div>
                        <CardTitle className="text-3xl font-headline flex items-center">
                            <span>{user.fullName}, {calculateAge(user.dob)}</span>
                            <UserTypeIcon usertype={user.usertype} />
                        </CardTitle>
                        <CardDescription className="!mt-1 text-base text-muted-foreground">
                            ID: {user.memberid}
                        </CardDescription>
                        <CardDescription className="flex items-center gap-4 text-base">
                             <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {user.city}</span>
                             {user.createdAt && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined {format(user.createdAt.toDate(), "MMMM yyyy")}</span>}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold font-headline mb-2">About Me</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-muted-foreground">
                                <p><span className="font-semibold text-foreground">Father:</span> {user.fatherName}</p>
                                <p><span className="font-semibold text-foreground">Mother:</span> {user.motherName}</p>
                                <p><span className="font-semibold text-foreground">Date of Birth:</span> {user.dob ? format(user.dob.toDate(), 'PPP') : '-'}</p>
                                <p><span className="font-semibold text-foreground">Marital Status:</span> {user.maritalStatus}</p>
                                <p><span className="font-semibold text-foreground">Mother Tongue:</span> {user.motherTongue}</p>
                                <p><span className="font-semibold text-foreground">Home State:</span> {user.homeState}</p>
                                <p><span className="font-semibold text-foreground">Occupation:</span> {user.occupation}</p>
                                <p><span className="font-semibold text-foreground">Salary:</span> {user.salary}</p>
                                <p><span className="font-semibold text-foreground">Location:</span> {user.workingPlace}</p>
                                <p><span className="font-semibold text-foreground">Religion:</span> {user.religion}</p>
                                <p><span className="font-semibold text-foreground">Community:</span> {user.community}</p>
                                <p><span className="font-semibold text-foreground">Sub-caste:</span> {user.subCaste}</p>
                                <p><span className="font-semibold text-foreground">Zodiac Sign:</span> {user.zodiacSign}</p>
                                <p><span className="font-semibold text-foreground">Star Sign:</span> {user.starSign}</p>
                                <p><span className="font-semibold text-foreground">Complexion:</span> {user.complexion}</p>
                                <p><span className="font-semibold text-foreground">Body Type:</span> {user.bodyType}</p>
                                <p><span className="font-semibold text-foreground">Diet:</span> {user.diet}</p>
                                <p><span className="font-semibold text-foreground">Height:</span> {heightValue}</p>
                                <p><span className="font-semibold text-foreground">Drinking Habit:</span> {user.drinkingHabit}</p>
                                <p><span className="font-semibold text-foreground">Smoking Habit:</span> {user.smokingHabit}</p>
                            </div>
                        </div>

                        {user.mobileNo && (
                            <div>
                                <h3 className="text-lg font-semibold font-headline mb-2">Contact Details</h3>
                                <div className="flex items-center gap-2 p-4 border rounded-lg bg-secondary/50">
                                    <span className="text-muted-foreground">Contact Number:</span>
                                    <span className={cn("font-mono", !isContactVisible && "filter blur-sm select-none")}>
                                        {user.mobileNo}
                                    </span>
                                    {!isContactVisible && (
                                        <Button variant="outline" size="sm" className="ml-auto bg-background" onClick={handleViewContact}>
                                            <Eye className="mr-2 h-4 w-4" /> View
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}


                         {user.interests && user.interests.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold font-headline mb-2">Interests</h3>
                                <div className="flex flex-wrap gap-2">
                                    {user.interests.map(interest => (
                                        <Badge key={interest} variant="secondary" className="text-sm px-3 py-1">{interest}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                         {user.lookingFor && (
                             <div>
                                <h3 className="text-lg font-semibold font-headline mb-2 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                    What I'm Looking For
                                </h3>
                                <p className="text-muted-foreground italic">"{user.lookingFor}"</p>
                            </div>
                         )}
                    </CardContent>
                </Card>
            </div>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Upgrade Required</AlertDialogTitle>
                    <AlertDialogDescription>
                        You need to upgrade your plan to view this user's contact details. Please upgrade your plan to view more contacts and enjoy other premium benefits.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                     <Button variant="outline" onClick={() => setShowUpgradeAlert(false)}>Cancel</Button>
                     <Button onClick={() => router.push('/upgrade')}>Upgrade Now</Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default function ProfileDetailPage({ params }: { params: { id: string } }) {
    const { id } = use(params);

    if (!id) {
        return (
            <AppLayout>
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Invalid Profile</h2>
                    <p>The profile ID is missing.</p>
                </div>
            </AppLayout>
        );
    }
    
    return (
        <AppLayout>
            <ProfileContent id={id} />
        </AppLayout>
    );
}

    