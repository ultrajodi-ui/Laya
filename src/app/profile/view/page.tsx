

'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Pencil, Camera } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { UserProfile } from '@/lib/types';

export default function ProfileViewPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [profileData, setProfileData] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [age, setAge] = useState<number | undefined>();
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data() as UserProfile;
                    const dob = data.dob?.toDate();
                    if (dob) {
                        const today = new Date();
                        let calculatedAge = today.getFullYear() - dob.getFullYear();
                        const m = today.getMonth() - dob.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                            calculatedAge--;
                        }
                        setAge(calculatedAge);
                    }
                    setProfileData({
                        ...data,
                        dob: dob
                    });
                } else {
                    console.log("No such document!");
                }
            } else {
                setUser(null);
                setProfileData(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [auth]);
    
    if (isLoading) {
        return (
            <AppLayout>
                 <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-1/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent className="grid gap-6 p-6">
                             <div className="grid sm:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                     <Skeleton className="h-5 w-16" />
                                     <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="grid gap-2">
                                     <Skeleton className="h-5 w-10" />
                                     <Skeleton className="h-10 w-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                 </div>
            </AppLayout>
        )
    }

    if (!profileData) {
        return (
            <AppLayout>
                <div className="text-center">No profile data found. Please complete your profile.</div>
            </AppLayout>
        );
    }
    
    const ProfileDetail = ({ label, value }: { label: string, value: string | undefined | string[] }) => (
        <div className="grid gap-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            {Array.isArray(value) && value.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {value.map((item) => (
                        <Badge key={item} variant="secondary">{item}</Badge>
                    ))}
                </div>
            ) : (
                <p className="text-base">{value && !Array.isArray(value) ? value : '-'}</p>
            )}
        </div>
    );

    const heightValue = profileData.heightFeet && profileData.heightInches 
        ? `${profileData.heightFeet}' ${profileData.heightInches}"` 
        : '-';

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                 <Card>
                    <CardHeader className="items-center text-center">
                        <CardTitle className="font-headline">My Profile</CardTitle>
                        <CardDescription>This is how your profile appears to others. Keep it updated!</CardDescription>
                         <Button variant="outline" onClick={() => router.push('/profile/edit')}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Profile
                        </Button>
                    </CardHeader>
                    <CardContent className="grid gap-6 p-6">
                         <div className="flex flex-col items-center gap-4">
                            <span className="relative flex h-24 w-24 shrink-0 overflow-hidden rounded-full">
                                <Image 
                                    className="aspect-square h-full w-full object-cover" 
                                    alt={profileData.fullName || 'User'} 
                                    src={profileData.imageUrl || `https://picsum.photos/seed/${user?.uid}/100/100`} 
                                    width={96}
                                    height={96}
                                />
                            </span>
                             <div className="grid gap-1.5 text-center">
                                 <h2 className="text-2xl font-bold">{profileData.fullName}</h2>
                                 {profileData.memberid && <p className="text-sm text-muted-foreground">Member ID: {profileData.memberid}</p>}
                                 <p className="text-sm text-muted-foreground">{profileData.email}</p>
                                 {profileData.usertype && (
                                     <Badge variant="secondary" className="w-fit justify-self-center">{profileData.usertype}</Badge>
                                 )}
                             </div>
                        </div>

                         {profileData.additionalPhotoUrls && profileData.additionalPhotoUrls.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold font-headline mb-4 flex items-center justify-center gap-2">
                                    <Camera className="w-5 h-5 text-primary" />
                                    Photo Gallery
                                </h3>
                                <Carousel className="w-full max-w-xs sm:max-w-sm md:max-w-xl mx-auto">
                                    <CarouselContent>
                                        {profileData.additionalPhotoUrls.map((url: string, index: number) => (
                                        <CarouselItem key={index}>
                                            <div className="p-1">
                                            <Card>
                                                <CardContent className="flex aspect-square items-center justify-center p-0 rounded-lg overflow-hidden">
                                                    <Image 
                                                        src={url} 
                                                        alt={`Gallery photo ${index + 1}`} 
                                                        width={500}
                                                        height={500}
                                                        className="object-cover w-full h-full"
                                                    />
                                                </CardContent>
                                            </Card>
                                            </div>
                                        </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </Carousel>
                            </div>
                        )}

                        <div className="grid sm:grid-cols-2 gap-6">
                            <ProfileDetail label="Profile By" value={profileData.profileBy} />
                            <ProfileDetail label="Full Name" value={profileData.fullName} />
                            <ProfileDetail label="Gender" value={profileData.gender} />
                            <ProfileDetail label="Father Name" value={profileData.fatherName} />
                            <ProfileDetail label="Mother Name" value={profileData.motherName} />
                            <ProfileDetail label="Date of Birth" value={profileData.dob ? format(profileData.dob, 'PPP') : '-'} />
                            <ProfileDetail label="Mother Tongue" value={profileData.motherTongue} />
                            <ProfileDetail label="Marital Status" value={profileData.maritalStatus} />
                            <ProfileDetail label="Religion" value={profileData.religion} />
                            <ProfileDetail label="Community" value={profileData.community} />
                            <ProfileDetail label="Sub Caste" value={profileData.subCaste} />
                            <ProfileDetail label="Zodiac Sign" value={profileData.zodiacSign} />
                            <ProfileDetail label="Star Sign (Nakshatra)" value={profileData.starSign} />
                            <ProfileDetail label="Complexion" value={profileData.complexion} />
                            <ProfileDetail label="Body Type" value={profileData.bodyType} />
                            <ProfileDetail label="Diet" value={profileData.diet} />
                            <ProfileDetail label="Height" value={heightValue} />
                            <ProfileDetail label="Drinking Habit" value={profileData.drinkingHabit} />
                            <ProfileDetail label="Smoking Habit" value={profileData.smokingHabit} />
                            <ProfileDetail label="Any Disability" value={profileData.anyDisability} />
                            <ProfileDetail label="Ready for Inter-Caste Marriage" value={profileData.interCasteMarriage} />
                            <ProfileDetail label="Education" value={profileData.education} />
                            <ProfileDetail label="Education Details" value={profileData.educationDetails} />
                            <ProfileDetail label="Employed In" value={profileData.employed} />
                            <ProfileDetail label="Occupation" value={profileData.occupation} />
                            <ProfileDetail label="Salary" value={profileData.salary} />
                            <ProfileDetail label="Working Place" value={profileData.workingPlace} />
                            <ProfileDetail label="Home State" value={profileData.homeState} />
                            <ProfileDetail label="Home Town/City" value={profileData.city} />
                            <ProfileDetail label="Mobile No" value={profileData.mobileNo} />
                        </div>
                        <div className="grid gap-2">
                             <ProfileDetail label="Interests" value={profileData.interests} />
                        </div>
                         <div className="grid gap-2">
                            <p className="text-sm font-medium text-muted-foreground">What I'm Looking For</p>
                             <p className="text-base italic text-muted-foreground">"{profileData.lookingFor || '-'}"</p>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

    




    
