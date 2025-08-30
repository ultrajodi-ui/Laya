
'use client';

import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Heart, ListFilter, MapPin, Search as SearchIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, getDocs, query, where, arrayUnion, arrayRemove, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';

// Mock data for filters
const allInterests = ["Cooking", "Hiking", "Reading", "Technology", "Art", "Music", "Films", "Cycling", "Fitness", "Business", "Nutrition", "Dogs", "Brunch", "Mysteries", "Philosophy", "Concerts"];
const allLocations = ["Mumbai, India", "Delhi, India", "Bangalore, India", "Pune, India", "Hyderabad, India", "Chennai, India"];


export default function BrowsePage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const auth = getAuth();
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                const userDocRef = doc(db, 'users', user.uid);
                
                const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists()) {
                        const userData = doc.data() as UserProfile;
                        setCurrentUserProfile(userData);
                        fetchUsers(userData.gender, user.uid);
                    } else {
                         setLoading(false);
                    }
                });

                return () => unsubscribeSnapshot();
            } else {
                setCurrentUser(null);
                setCurrentUserProfile(null);
                setUsers([]);
                setLoading(false);
            }
        });

        const fetchUsers = async (gender: string | undefined, currentUserId: string) => {
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
                setUsers(fetchedUsers);
             }
             setLoading(false);
        };


        return () => unsubscribeAuth();
    }, [auth]);

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

    const handleLikeClick = async (targetUser: UserProfile) => {
        if (!currentUser || !targetUser.memberid) {
            toast({
                variant: 'destructive',
                title: 'Not logged in',
                description: 'You must be logged in to like profiles.',
            });
            return;
        }

        const currentUserId = currentUser.uid;
        const userDocRef = doc(db, 'users', currentUserId);

        const isLiked = currentUserProfile?.likes?.includes(targetUser.memberid);

        try {
            if (isLiked) {
                await updateDoc(userDocRef, {
                    likes: arrayRemove(targetUser.memberid)
                });
                 toast({
                    title: 'Like Removed',
                    description: 'You have unliked this profile.',
                });
            } else {
                await updateDoc(userDocRef, {
                    likes: arrayUnion(targetUser.memberid)
                });
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
    
    const handleFilterChange = (filterType: 'interest' | 'location', value: string, checked: boolean) => {
        if (filterType === 'interest') {
            setSelectedInterests(prev => checked ? [...prev, value] : prev.filter(i => i !== value));
        } else if (filterType === 'location') {
            setSelectedLocations(prev => checked ? [...prev, value] : prev.filter(l => l !== value));
        }
    };

    const filteredUsers = useMemo(() => {
        return users
            .filter(user => {
                // Search query filter
                const searchLower = searchQuery.toLowerCase();
                const nameMatch = user.fullName?.toLowerCase().includes(searchLower);
                const interestMatch = user.interests?.some(interest => interest.toLowerCase().includes(searchLower));
                return nameMatch || interestMatch;
            })
            .filter(user => {
                // Interest filter
                if (selectedInterests.length === 0) return true;
                return selectedInterests.every(interest => user.interests?.includes(interest));
            })
            .filter(user => {
                // Location filter
                if (selectedLocations.length === 0) return true;
                return user.city && selectedLocations.includes(user.city);
            });
    }, [users, searchQuery, selectedInterests, selectedLocations]);


    return (
        <AppLayout>
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Input 
                            placeholder="Search by name or interest..." 
                            className="pl-8" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <span className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">
                            <SearchIcon className="h-4 w-4" />
                        </span>
                    </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1">
                                <ListFilter className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Filter by Location</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                             {allLocations.slice(0, 5).map(location => (
                                <DropdownMenuCheckboxItem 
                                    key={location}
                                    checked={selectedLocations.includes(location)}
                                    onCheckedChange={(checked) => handleFilterChange('location', location, !!checked)}
                                >
                                    {location}
                                </DropdownMenuCheckboxItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Filter by Interest</DropdownMenuLabel>
                             <DropdownMenuSeparator />
                            {allInterests.slice(0, 5).map(interest => (
                                <DropdownMenuCheckboxItem 
                                    key={interest}
                                    checked={selectedInterests.includes(interest)}
                                    onCheckedChange={(checked) => handleFilterChange('interest', interest, !!checked)}
                                >
                                    {interest}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                {loading ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
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
                        {filteredUsers.map(user => {
                            const isLiked = currentUserProfile?.likes?.includes(user.memberid!);
                            return (
                            <Card key={user.id} className="overflow-hidden transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
                                 <CardHeader className="p-0">
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
                                    <p className="text-sm text-muted-foreground line-clamp-2 h-10">{user.occupation}</p>
                                    <div className="flex flex-wrap gap-1 pt-1">
                                        {user.interests?.slice(0, 3).map(interest => (
                                            <Badge key={interest} variant="secondary">{interest}</Badge>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter className="p-4 pt-0">
                                     <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => handleLikeClick(user)}>
                                        <Heart className={cn("mr-2 h-4 w-4", isLiked && "fill-red-500 text-red-500")} /> Like
                                    </Button>
                                </CardFooter>
                            </Card>
                        )})}
                    </div>
                )}

                {!loading && filteredUsers.length === 0 && (
                    <div className="text-center col-span-full py-16">
                        <p className="text-muted-foreground">No profiles found. Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
