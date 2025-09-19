
'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2, Star, Shield, Gem, MapPin, Briefcase, IndianRupee, Heart } from "lucide-react";
import { smartMatchmaking, SmartMatchmakingInput } from '@/ai/flows/smart-matchmaking';
import type { UserProfile } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type MatchProfile = UserProfile & {
    compatibilityScore?: number;
    compatibilityReason?: string;
};

const UserTypeIcon = ({ usertype }: { usertype?: string }) => {
    switch (usertype) {
        case 'Silver': return <Star className="w-4 h-4 ml-2 text-slate-500" />;
        case 'Gold': return <Shield className="w-4 h-4 ml-2 text-yellow-500" />;
        case 'Diamond': return <Gem className="w-4 h-4 ml-2 text-blue-500" />;
        default: return null;
    }
};

const calculateAge = (dob: any) => {
    if (!dob) return 0;
    const birthDate = dob.toDate ? dob.toDate() : new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

export default function MatchesPage() {
    const [matchingCriteria, setMatchingCriteria] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestedMatches, setSuggestedMatches] = useState<MatchProfile[]>([]);
    const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
    const [candidateProfiles, setCandidateProfiles] = useState<UserProfile[]>([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const auth = getAuth();
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const profile = { id: userDocSnap.id, ...userDocSnap.data() } as UserProfile;
                    setCurrentUserProfile(profile);
                    fetchCandidates(profile.gender, user.uid);
                }
            }
            setLoadingProfile(false);
        });

        const fetchCandidates = async (gender: string | undefined, currentUserId: string) => {
            if (gender) {
                const genderToFetch = gender === 'male' ? 'female' : 'male';
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("gender", "==", genderToFetch));
                const querySnapshot = await getDocs(q);
                
                const fetchedUsers: UserProfile[] = [];
                querySnapshot.forEach((doc) => {
                    if (doc.id !== currentUserId) {
                       fetchedUsers.push({ id: doc.id, ...doc.data() } as UserProfile);
                    }
                });
                setCandidateProfiles(fetchedUsers);
            }
        };

        return () => unsubscribe();
    }, [auth]);

    const handleFindMatches = async () => {
        if (!currentUserProfile) {
            toast({
                variant: 'destructive',
                title: 'Profile not found',
                description: 'Could not find your profile. Please try again.',
            });
            return;
        }
        setIsLoading(true);
        setSuggestedMatches([]);
        
        const input: SmartMatchmakingInput = {
            currentUser: {
                id: currentUserProfile.id,
                fullName: currentUserProfile.fullName,
                age: calculateAge(currentUserProfile.dob),
                bio: currentUserProfile.bio,
                gender: currentUserProfile.gender,
                interests: currentUserProfile.interests,
                location: currentUserProfile.city,
                lookingFor: currentUserProfile.lookingFor,
                occupation: currentUserProfile.occupation,
                religion: currentUserProfile.religion,
                caste: currentUserProfile.caste,
                subCaste: currentUserProfile.subCaste,
            },
            candidates: candidateProfiles.map(p => ({
                id: p.id,
                fullName: p.fullName,
                age: calculateAge(p.dob),
                bio: p.bio,
                gender: p.gender,
                interests: p.interests,
                location: p.city,
                lookingFor: p.lookingFor,
                occupation: p.occupation,
                religion: p.religion,
                caste: p.caste,
                subCaste: p.subCaste,
            })),
            matchingCriteria: matchingCriteria || "Find the best matches based on my profile.",
        };

        try {
            const result = await smartMatchmaking(input);
            if (result.suggestedMatches) {
              // The AI returns a subset of profile data. We need to find the *full* profile
              // from our candidate list to get all details, like the image URL.
              const fullProfiles = result.suggestedMatches.map(match => {
                  const originalCandidate = candidateProfiles.find(c => c.id === match.id);
                  return { 
                      ...originalCandidate, // The full original profile
                      ...match              // Override with AI's scores and reason
                  } as MatchProfile;
              });
              setSuggestedMatches(fullProfiles);
            }
        } catch (error) {
            console.error("Error finding matches:", error);
            toast({
                variant: 'destructive',
                title: 'Matchmaking Failed',
                description: 'Could not fetch AI matches. Please try again later.',
            })
        } finally {
            setIsLoading(false);
        }
    };

    if (loadingProfile) {
        return (
            <AppLayout>
                <div className="flex flex-col gap-8">
                     <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-1/2" />
                            <Skeleton className="h-4 w-3/4" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <Skeleton className="h-20 w-full" />
                             <Skeleton className="h-10 w-40" />
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        )
    }

    return (
        <AppLayout>
            <div className="flex flex-col gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Wand2 className="text-primary"/> AI Smart Matchmaking</CardTitle>
                        <CardDescription>Our AI will analyze your profile against potential candidates to find your best matches. You can also add specific preferences below.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea 
                            placeholder="e.g., 'I'm looking for someone who is family-oriented and lives in the same city...'"
                            value={matchingCriteria}
                            onChange={(e) => setMatchingCriteria(e.target.value)}
                            rows={3}
                        />
                        <Button onClick={handleFindMatches} disabled={isLoading || loadingProfile || candidateProfiles.length === 0}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            {isLoading ? 'Finding Matches...' : 'Find My Matches'}
                        </Button>
                        {candidateProfiles.length === 0 && !loadingProfile && (
                            <p className="text-sm text-muted-foreground">There are currently no candidates to match with. Please check back later.</p>
                        )}
                    </CardContent>
                </Card>

                {isLoading && (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                             <Card key={i} className="animate-pulse">
                                 <Skeleton className="w-full h-64 bg-muted rounded-t-lg" />
                                <CardContent className="p-4 space-y-2">
                                     <Skeleton className="h-6 w-1/2 bg-muted rounded" />
                                     <Skeleton className="h-4 w-full bg-muted rounded" />
                                     <Skeleton className="h-4 w-3/4 bg-muted rounded" />
                                </CardContent>
                                <CardFooter>
                                    <Skeleton className="h-10 w-full bg-muted rounded" />
                                </CardFooter>
                             </Card>
                        ))}
                     </div>
                )}

                {suggestedMatches.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-headline mb-4">Your Top AI-Powered Matches</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {suggestedMatches.map((user) => (
                                <Card key={user.id} className="overflow-hidden transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
                                    <CardHeader className="p-0 relative">
                                        <Link href={`/profile/${user.id}`}>
                                            <Image
                                                src={user.imageUrl || `https://picsum.photos/seed/${user.id}/400/400`}
                                                alt={user.fullName || 'User'}
                                                width={400}
                                                height={400}
                                                data-ai-hint="person portrait"
                                                className="w-full h-64 object-cover"
                                            />
                                        </Link>
                                        <Badge variant="default" className="absolute top-2 right-2 bg-primary/80 backdrop-blur-sm">
                                            {user.compatibilityScore}% Match
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="p-4 space-y-2">
                                        <div>
                                            <Link href={`/profile/${user.id}`}>
                                                <h3 className="text-xl font-headline font-semibold flex items-center">
                                                    <span>{user.fullName}, {calculateAge(user.dob)}</span>
                                                    <UserTypeIcon usertype={user.usertype} />
                                                </h3>
                                            </Link>
                                            <p className="text-sm text-muted-foreground italic">"{user.compatibilityReason}"</p>
                                        </div>
                                         <div className="border-t pt-2 space-y-1 text-sm text-muted-foreground">
                                            <div className="flex items-center">
                                                <MapPin className="w-4 h-4 mr-1" />
                                                <span>{user.city}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Briefcase className="w-4 h-4 mr-1" />
                                                <span>{user.occupation}</span>
                                            </div>
                                            <div className="flex items-center">
                                                 <Badge variant="secondary">{user.subCaste}</Badge>
                                            </div>
                                        </div>

                                    </CardContent>
                                    <CardFooter className="p-4 pt-0">
                                         <Button asChild className="w-full">
                                            <Link href={`/profile/${user.id}`}>
                                                <Heart className="mr-2 h-4 w-4" /> View Profile
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
