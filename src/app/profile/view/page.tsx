

'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Pencil } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

export default function ProfileViewPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [profileData, setProfileData] = useState<any | null>(null);
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
                    const data = docSnap.data();
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
                 <div className="mx-auto grid max-w-4xl gap-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-1/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent className="grid gap-6">
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
    
    const ProfileDetail = ({ label, value }: { label: string, value: string | undefined }) => (
        <div className="grid gap-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-base">{value || '-'}</p>
        </div>
    );

    return (
        <AppLayout>
            <div className="mx-auto grid max-w-4xl gap-6">
                 <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="font-headline">My Profile</CardTitle>
                             <Button variant="outline" onClick={() => router.push('/profile/edit')}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Profile
                            </Button>
                        </div>
                        <CardDescription>This is how your profile appears to others. Keep it updated!</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                         <div className="flex items-center gap-4">
                            <span className="relative flex h-24 w-24 shrink-0 overflow-hidden rounded-full">
                                <img className="aspect-square h-full w-full" alt={profileData.fullName || 'User'} src={profileData.imageUrl || `https://picsum.photos/seed/${user?.uid}/100/100`} />
                            </span>
                             <div className="grid gap-1.5">
                                 <h2 className="text-2xl font-bold">{profileData.fullName}</h2>
                                 <p className="text-sm text-muted-foreground">{profileData.email}</p>
                                 {profileData.usertype && (
                                     <Badge variant="secondary" className="w-fit">{profileData.usertype}</Badge>
                                 )}
                             </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <ProfileDetail label="Member ID" value={profileData.memberid} />
                            <ProfileDetail label="Full Name" value={profileData.fullName} />
                            <ProfileDetail label="Date of Birth" value={profileData.dob ? format(profileData.dob, 'PPP') : '-'} />
                            <ProfileDetail label="Father Name" value={profileData.fatherName} />
                            <ProfileDetail label="Mother Name" value={profileData.motherName} />
                            <ProfileDetail label="Occupation" value={profileData.occupation} />
                            <ProfileDetail label="Working Place" value={profileData.workingPlace} />
                            <ProfileDetail label="Address" value={profileData.homeAddress} />
                            <ProfileDetail label="City" value={profileData.city} />
                            <ProfileDetail label="Mobile No" value={profileData.mobileNo} />
                            <ProfileDetail label="Religion" value={profileData.religion} />
                            <ProfileDetail label="Community" value={profileData.community} />
                            <ProfileDetail label="Sub Caste" value={profileData.subCaste} />
                            <ProfileDetail label="Zodiac Sign" value={profileData.zodiacSign} />
                            <ProfileDetail label="Star Sign (Nakshatra)" value={profileData.starSign} />
                             <ProfileDetail label="Salary" value={profileData.salary} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
