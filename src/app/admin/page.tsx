
'use client';

import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/lib/types";
import { collection, getDocs, limit, orderBy, query, doc, getDoc } from "firebase/firestore";
import { Users, Heart, Star, ShieldAlert } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";


export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalLikes: 0,
        premiumUsers: 0,
    });
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [showAll, setShowAll] = useState(false);
    const auth = getAuth();
    const router = useRouter();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const usersCollection = collection(db, "users");
            const usersQuery = showAll 
                ? query(usersCollection, orderBy("createdAt", "desc"))
                : query(usersCollection, orderBy("createdAt", "desc"), limit(5));
            
            const usersSnapshot = await getDocs(usersQuery);
            const fetchedUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
            setUsers(fetchedUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    }, [showAll]);

    const fetchStats = async () => {
        try {
            // Fetch Users for stats
            const usersCollection = collection(db, "users");
            const userSnapshot = await getDocs(usersCollection);
            const totalUsers = userSnapshot.size;
            const usersData = userSnapshot.docs.map(doc => doc.data() as UserProfile);

            // Fetch Likes
            const likesCollection = collection(db, "likesReceived");
            const likesSnapshot = await getDocs(likesCollection);
            const totalLikes = likesSnapshot.size;

            // Calculate Premium Users
            const premiumUsers = usersData.filter(u => u.usertype && u.usertype !== 'Basic').length;

            setStats({ totalUsers, totalLikes, premiumUsers });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists() && userDoc.data().role === 'admin') {
                    setIsAdmin(true);
                    await Promise.all([fetchStats(), fetchUsers()]);
                } else {
                    setIsAdmin(false);
                }
            } else {
                router.push('/login');
            }
             setLoading(false);
        });
        return () => unsubscribe();
    }, [auth, router, fetchUsers]);

    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin, showAll, fetchUsers]);
    
    if (loading) {
         return (
             <AppLayout>
                 <div className="flex flex-col gap-4">
                     <h1 className="text-3xl font-headline font-bold"><Skeleton className="h-8 w-1/4" /></h1>
                     <div className="text-muted-foreground"><Skeleton className="h-4 w-1/2" /></div>
                </div>
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                     <Skeleton className="h-24 w-full" />
                     <Skeleton className="h-24 w-full" />
                     <Skeleton className="h-24 w-full" />
                 </div>
                 <div className="mt-8">
                     <Skeleton className="h-64 w-full" />
                 </div>
             </AppLayout>
         )
    }
    
    if (!isAdmin) {
         return (
            <AppLayout>
                <Card className="mt-10">
                    <CardHeader className="items-center text-center">
                        <ShieldAlert className="w-16 h-16 text-destructive" />
                        <CardTitle className="text-2xl font-headline">Access Denied</CardTitle>
                        <CardDescription>You do not have permission to view this page.</CardDescription>
                    </CardHeader>
                </Card>
            </AppLayout>
        );
    }


    return (
        <AppLayout>
            <div className="space-y-8">
                <div className="flex flex-col gap-4">
                     <h1 className="text-3xl font-headline font-bold">Admin Dashboard</h1>
                     <p className="text-muted-foreground">An overview of your application's activity.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Likes Given</CardTitle>
                            <Heart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalLikes}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Premium Members</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.premiumUsers}</div>
                        </CardContent>
                    </Card>
                </div>
                
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>{showAll ? 'All Users' : 'Recent Registrations'}</CardTitle>
                                <CardDescription>{showAll ? 'A list of all users.' : 'The last 5 users who signed up.'}</CardDescription>
                            </div>
                            <Button onClick={() => setShowAll(!showAll)} variant="outline">
                                {showAll ? 'Show Recent' : 'Show All Data'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && users.length === 0 ? (
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    users.map(user => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.fullName}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.usertype !== 'Basic' ? 'default' : 'secondary'}>
                                                    {user.usertype || 'Basic'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {user.createdAt ? format(user.createdAt.toDate(), 'PPP') : 'N/A'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
