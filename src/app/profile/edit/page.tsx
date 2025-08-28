
'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function ProfileEditPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [profileData, setProfileData] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setProfileData((prevData: any) => ({ ...prevData, [id]: value }));
    };

    const handleSaveChanges = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const userDocRef = doc(db, "users", user.uid);
            // We don't want to save the photo URL or age to the document
            const { imageUrl, age, ...dataToSave } = profileData;
            await setDoc(userDocRef, dataToSave, { merge: true });
            toast({
                title: "Profile Updated",
                description: "Your changes have been saved successfully.",
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: error.message,
            });
        } finally {
            setIsSaving(false);
        }
    };
    
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
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-24 w-24 rounded-full" />
                                <div className="grid gap-1.5">
                                    <Skeleton className="h-10 w-24" />
                                    <Skeleton className="h-4 w-40" />
                                </div>
                            </div>
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
                             <div className="grid gap-2">
                                 <Skeleton className="h-5 w-20" />
                                 <Skeleton className="h-10 w-full" />
                            </div>
                             <div className="grid gap-2">
                                 <Skeleton className="h-5 w-10" />
                                 <Skeleton className="h-20 w-full" />
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


    return (
        <AppLayout>
            <div className="mx-auto grid max-w-4xl gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">My Profile</CardTitle>
                        <CardDescription>Update your personal information and preferences.</CardDescription>
                        <div className="pt-2 space-y-2">
                            {profileData.memberid && (
                                <p className="text-sm text-muted-foreground">
                                    Member ID: <span className="font-semibold text-primary">{profileData.memberid}</span>
                                </p>
                            )}
                            {profileData.usertype && (
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-muted-foreground">
                                        User Type: <span className="font-semibold text-primary">{profileData.usertype}</span>
                                    </p>
                                    {profileData.usertype === 'Basic' && (
                                        <Button size="sm" variant="outline" className="h-7 text-primary border-primary hover:bg-primary hover:text-primary-foreground">Upgrade</Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="flex items-center gap-4">
                            <span className="relative flex h-24 w-24 shrink-0 overflow-hidden rounded-full">
                                <img className="aspect-square h-full w-full" alt={profileData.fullName || 'User'} src={profileData.imageUrl || `https://picsum.photos/seed/${user?.uid}/100/100`} />
                            </span>
                            <div className="grid gap-1.5">
                                <Button>Change Photo</Button>
                                <p className="text-sm text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input id="fullName" value={profileData.fullName || ''} onChange={handleInputChange} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="dob">Date of Birth</Label>
                                <Input id="dob" value={profileData.dob ? format(profileData.dob, 'PPP') : ''} readOnly className="bg-muted" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="fatherName">Father Name</Label>
                                <Input id="fatherName" value={profileData.fatherName || ''} onChange={handleInputChange} />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="motherName">Mother Name</Label>
                                <Input id="motherName" value={profileData.motherName || ''} onChange={handleInputChange} />
                            </div>
                              <div className="grid gap-2">
                                <Label htmlFor="occupation">Occupation</Label>
                                <Input id="occupation" value={profileData.occupation || ''} onChange={handleInputChange} />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="workingPlace">Working Place</Label>
                                <Input id="workingPlace" value={profileData.workingPlace || ''} onChange={handleInputChange} />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="homeAddress">Address</Label>
                                <Input id="homeAddress" value={profileData.homeAddress || ''} onChange={handleInputChange} />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" value={profileData.city || ''} onChange={handleInputChange} />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="mobileNo">Mobile No</Label>
                                <Input id="mobileNo" value={profileData.mobileNo || ''} onChange={handleInputChange} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="religion">Religion</Label>
                                <Input id="religion" value={profileData.religion || ''} onChange={handleInputChange} />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="community">Community</Label>
                                <Input id="community" value={profileData.community || ''} onChange={handleInputChange} />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="subCaste">Sub Caste</Label>
                                <Input id="subCaste" value={profileData.subCaste || ''} onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea id="bio" rows={4} value={profileData.bio || ''} onChange={handleInputChange} />
                        </div>
                        
                        <div className="grid gap-2">
                            <Label htmlFor="interests">Interests</Label>
                            <Input id="interests" placeholder="e.g. Cooking, Hiking, Reading" value={profileData.interests?.join(', ') || ''} onChange={(e) => setProfileData({...profileData, interests: e.target.value.split(',').map(i => i.trim())})} />
                             <p className="text-sm text-muted-foreground">Separate interests with a comma.</p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="lookingFor">What are you looking for?</Label>
                            <Textarea id="lookingFor" rows={3} value={profileData.lookingFor || ''} onChange={handleInputChange}/>
                        </div>

                         <Button onClick={handleSaveChanges} className="w-full sm:w-auto justify-self-start bg-primary hover:bg-primary/90" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                         </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
