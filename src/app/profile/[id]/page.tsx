

'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AppLayout } from "@/components/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Calendar, Sparkles, MapPin } from "lucide-react";
import Image from "next/image";
import { Skeleton } from '@/components/ui/skeleton';
import type { UserProfile } from '@/lib/types';
import { format, differenceInYears } from 'date-fns';

const calculateAge = (dob: any) => {
    if (!dob) return 0;
    const birthDate = dob.toDate ? dob.toDate() : new Date(dob);
    return differenceInYears(new Date(), birthDate);
}

export default function ProfileDetailPage({ params }: { params: { id: string } }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const { id } = params;

    useEffect(() => {
        const fetchUser = async () => {
            if (id) {
                const userDocRef = doc(db, 'users', id as string);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUser({ id: userDoc.id, ...userDoc.data() } as UserProfile);
                }
            }
            setLoading(false);
        };

        fetchUser();
    }, [id]);

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
    
    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <Card className="overflow-hidden">
                    <div className="relative h-48 md:h-64 bg-muted">
                        <Image src={user.coverUrl || `https://picsum.photos/seed/${user.id}-cover/1200/400`} alt={`${user.fullName}'s cover photo`} fill style={{objectFit: "cover"}} data-ai-hint="romantic landscape" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-6">
                            <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background">
                                <AvatarImage src={user.imageUrl} alt={user.fullName} />
                                <AvatarFallback>{user.fullName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                    <CardHeader className="pt-20 md:pt-24 relative">
                        <div className="absolute top-4 right-4">
                            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                                <Heart className="mr-2 h-4 w-4" /> Connect
                            </Button>
                        </div>
                        <CardTitle className="text-3xl font-headline">{user.fullName}, {calculateAge(user.dob)}</CardTitle>
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
                                <p><span className="font-semibold text-foreground">Occupation:</span> {user.occupation}</p>
                                <p><span className="font-semibold text-foreground">Salary:</span> {user.salary}</p>
                                <p><span className="font-semibold text-foreground">Location:</span> {user.workingPlace}</p>
                                <p><span className="font-semibold text-foreground">Religion:</span> {user.religion}</p>
                                <p><span className="font-semibold text-foreground">Community:</span> {user.community}</p>
                                <p><span className="font-semibold text-foreground">Sub-caste:</span> {user.subCaste}</p>
                                <p><span className="font-semibold text-foreground">Zodiac Sign:</span> {user.zodiacSign}</p>
                                <p><span className="font-semibold text-foreground">Star Sign:</span> {user.starSign}</p>
                            </div>
                        </div>
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
        </AppLayout>
    );
}
