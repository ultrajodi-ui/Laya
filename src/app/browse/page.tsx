
'use client';

import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Heart, ListFilter, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function BrowsePage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const currentUserData = userDoc.data();
                    const genderToFetch = currentUserData.gender === 'male' ? 'female' : 'male';
                    
                    const usersRef = collection(db, "users");
                    const q = query(usersRef, where("gender", "==", genderToFetch));
                    const querySnapshot = await getDocs(q);
                    
                    const fetchedUsers: UserProfile[] = [];
                    querySnapshot.forEach((doc) => {
                        fetchedUsers.push({ id: doc.id, ...doc.data() } as UserProfile);
                    });
                    setUsers(fetchedUsers);
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
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

    return (
        <AppLayout>
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Input placeholder="Search by name or interest..." className="pl-8" />
                        <span className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">
                            <Heart className="h-4 w-4" />
                        </span>
                    </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1">
                                <ListFilter className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem checked>
                                Age Range
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem>Location</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem>
                                Interests
                            </DropdownMenuCheckboxItem>
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
                        {users.map(user => (
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
                                     <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                        <Heart className="mr-2 h-4 w-4" /> Connect
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}

                {!loading && users.length === 0 && (
                    <div className="text-center col-span-full py-16">
                        <p className="text-muted-foreground">No profiles found. Check back later!</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
