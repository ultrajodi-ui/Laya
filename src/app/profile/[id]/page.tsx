

'use client';

import { useState, useEffect, use } from 'react';
import { collection, doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot, writeBatch, increment, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AppLayout } from "@/components/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Calendar, Sparkles, MapPin, Eye, Star, Shield, Gem, Users, Camera, X, Lock } from "lucide-react";
import Image from "next/image";
import { Skeleton } from '@/components/ui/skeleton';
import type { UserProfile } from '@/lib/types';
import { format, differenceInYears } from 'date-fns';
import { usePageTitle } from '@/hooks/use-page-title';
import { cn } from '@/lib/utils';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

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
    const [arePhotosVisible, setArePhotosVisible] = useState(false);
    const [showUpgradeAlert, setShowUpgradeAlert] = useState(false);
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);


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
                setArePhotosVisible(true);
                return;
            }
            if (currentUserProfile.viewedContacts && currentUserProfile.viewedContacts.includes(user.memberid!)) {
                setIsContactVisible(true);
            }
             if (currentUserProfile.viewedPhotos && currentUserProfile.viewedPhotos.includes(user.memberid!)) {
                setArePhotosVisible(true);
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

        if (currentUserProfile.role === 'admin' || isContactVisible) {
            setIsContactVisible(true);
            return;
        }
        
        if (currentUserProfile.viewedContacts && currentUserProfile.viewedContacts.includes(user.memberid)) {
            setIsContactVisible(true);
            return;
        }

        const currentUserType = currentUserProfile.usertype || 'Basic';
        if (currentUserType === 'Basic') {
            setShowUpgradeAlert(true);
            return;
        }

        const targetUserType = (user.usertype || 'basic').toLowerCase() as keyof NonNullable<UserProfile['contactLimit']>;
        const userDocRef = doc(db, 'users', currentUser.uid);

        const limits = currentUserProfile.contactLimit;
        
        if (limits && limits[targetUserType] > 0) {
            try {
                await updateDoc(userDocRef, {
                    [`contactLimit.${targetUserType}`]: increment(-1),
                    viewedContacts: arrayUnion(user.memberid)
                });
                setIsContactVisible(true);
                toast({ title: 'Contact Revealed', description: `You have ${limits[targetUserType] - 1} views remaining for ${user.usertype} members.` });
            } catch (e) {
                console.error("Error updating contact limit:", e);
                toast({ variant: 'destructive', title: 'Could not reveal contact.' });
            }
        } else {
            toast({
                variant: 'destructive',
                title: 'Limit Reached',
                description: `Your contact view limit for ${user.usertype || 'Basic'} members is over. Please upgrade your plan for more contacts.`,
            });
        }
    };

    const handleShowPhotos = async () => {
        if (!currentUser || !currentUserProfile || !user?.memberid) {
            toast({ variant: 'destructive', title: 'Please log in.' });
            return;
        }
    
        if (currentUserProfile.role === 'admin' || arePhotosVisible) {
            setArePhotosVisible(true);
            return;
        }
    
        if (currentUserProfile.viewedPhotos && currentUserProfile.viewedPhotos.includes(user.memberid)) {
            setArePhotosVisible(true);
            return;
        }
    
        const currentUserType = currentUserProfile.usertype || 'Basic';
    
        if (currentUserType === 'Basic') {
            setShowUpgradeAlert(true);
            return;
        }
    
        const targetUserType = (user.usertype || 'basic').toLowerCase() as keyof NonNullable<UserProfile['photoViewLimits']>;
        const userDocRef = doc(db, 'users', currentUser.uid);
    
        // This handles Silver, Gold, and Diamond
        const limits = currentUserProfile.photoViewLimits;
        
        if (limits && limits[targetUserType] > 0) {
            try {
                await updateDoc(userDocRef, {
                    [`photoViewLimits.${targetUserType}`]: increment(-1),
                    viewedPhotos: arrayUnion(user.memberid)
                });
                setArePhotosVisible(true);
                toast({ title: 'Photos Unlocked', description: `You can now view this user's photos. ${limits[targetUserType] - 1} views remaining for ${user.usertype} members.` });
            } catch (e) {
                console.error("Error updating photo view limit:", e);
                toast({ variant: 'destructive', title: 'Could not unlock photos.' });
            }
        } else {
            toast({
                variant: 'destructive',
                title: 'Limit Reached',
                description: `Your photo view limit for ${user.usertype || 'Basic'} members is over.`,
            });
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
            <AppLayout>
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
            </AppLayout>
        )
    }

    if (!user) {
        return (
            <AppLayout>
                <div className="text-center">
                    <h2 className="text-2xl font-bold">User not found</h2>
                    <p>The profile you are looking for does not exist.</p>
                </div>
            </AppLayout>
        );
    }
    
    const isLiked = user.memberid ? currentUserProfile?.likes?.includes(user.memberid) : false;
    
    const showProtectedView = user.photoVisibility === 'Protected' && !arePhotosVisible;

    const profileImageUrl = showProtectedView
        ? `https://picsum.photos/seed/default-avatar/100/100`
        : user.imageUrl || `https://picsum.photos/seed/${user.id}/100/100`;

    const heightValue = user.heightFeet && user.heightInches 
        ? `${user.heightFeet}' ${user.heightInches}"` 
        : '-';
    
    const galleryImages = (user.additionalPhotoUrls || []).filter(Boolean) as string[];


    return (
         <>
            <AlertDialog open={showUpgradeAlert} onOpenChange={setShowUpgradeAlert}>
                <div className="max-w-4xl mx-auto space-y-6">
                    <Card className="overflow-hidden">
                        <div className="relative h-64 md:h-80 bg-muted">
                             {(showProtectedView || galleryImages.length === 0) ? (
                                <Image 
                                    src={user.coverUrl || `https://picsum.photos/seed/${user.id}-cover/1200/400`} 
                                    alt={`${user.fullName}'s cover photo`} 
                                    fill 
                                    className="object-cover" 
                                    data-ai-hint="romantic landscape" 
                                />
                            ) : (
                                <Carousel className="w-full h-full">
                                    <CarouselContent>
                                        {galleryImages.map((url, index) => (
                                            <CarouselItem key={index}>
                                                <div className="relative w-full h-64 md:h-80">
                                                    <Image 
                                                        src={url} 
                                                        alt={`Photo ${index + 1}`} 
                                                        fill 
                                                        className="object-cover cursor-pointer"
                                                        onClick={() => setFullscreenImage(url)}
                                                    />
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    {galleryImages.length > 1 && (
                                        <>
                                            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white border-none hover:bg-black/70" />
                                            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white border-none hover:bg-black/70" />
                                        </>
                                    )}
                                </Carousel>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-4 left-6">
                                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background">
                                    <AvatarImage src={profileImageUrl} alt={user.fullName} />
                                    <AvatarFallback>{user.fullName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </div>
                        </div>

                         {user.photoVisibility === 'Protected' && (
                            <div className="flex items-center justify-between gap-2 p-3 border-t bg-secondary/50 text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    <p className="font-medium">Photos are Protected</p>
                                </div>
                                <Button variant="outline" size="sm" className="bg-background" onClick={handleShowPhotos}>Show</Button>
                            </div>
                        )}
                        
                        <CardHeader className="pt-8 md:pt-8 relative">
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
                            <CardDescription className="flex items-center gap-4 text-base flex-wrap">
                                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {user.city}</span>
                                {user.profileBy && <span className="flex items-center gap-1"><Users className="w-4 h-4" /> Profile by {user.profileBy}</span>}
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
                            You need to upgrade your plan to view this user's details. Please upgrade your plan to view more contacts and enjoy other premium benefits.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button variant="outline" onClick={() => setShowUpgradeAlert(false)}>Cancel</Button>
                        <Button onClick={() => router.push('/upgrade')}>Upgrade Now</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {fullscreenImage && (
                <div 
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center animate-in fade-in-50"
                    onClick={() => setFullscreenImage(null)}
                >
                    <div className="relative w-full h-full max-w-4xl max-h-[90vh] p-4">
                        <Image 
                            src={fullscreenImage} 
                            alt="Fullscreen" 
                            fill
                            className="object-contain"
                        />
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-4 right-4 text-white hover:text-white bg-black/50 hover:bg-black/70 rounded-full"
                            onClick={(e) => {
                                e.stopPropagation();
                                setFullscreenImage(null);
                            }}
                        >
                            <X className="w-6 h-6" />
                        </Button>
                    </div>
                </div>
            )}
        </>
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
