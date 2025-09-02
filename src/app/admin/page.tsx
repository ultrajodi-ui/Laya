
'use client';

import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/lib/types";
import { collection, getDocs, limit, orderBy, query, doc, getDoc } from "firebase/firestore";
import { Users, Star, Shield, Gem, User as UserIcon } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";


export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        basicUsers: 0,
        silverUsers: 0,
        goldUsers: 0,
        diamondUsers: 0,
    });
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [showAll, setShowAll] = useState(false);
    const auth = getAuth();
    const router = useRouter();

    const fetchAdminData = useCallback(async () => {
        setLoading(true);
        try {
            const usersCollection = collection(db, "users");
            const userSnapshot = await getDocs(usersCollection);
            const totalUsers = userSnapshot.size;
            const usersData = userSnapshot.docs.map(doc => doc.data() as UserProfile);

            let basicUsers = 0;
            let silverUsers = 0;
            let goldUsers = 0;
            let diamondUsers = 0;

            usersData.forEach(user => {
                switch (user.usertype) {
                    case 'Silver': silverUsers++; break;
                    case 'Gold': goldUsers++; break;
                    case 'Diamond': diamondUsers++; break;
                    default: basicUsers++; break;
                }
            });
            setStats({ totalUsers, basicUsers, silverUsers, goldUsers, diamondUsers });

            const usersQuery = showAll
                ? query(usersCollection, orderBy("createdAt", "desc"))
                : query(usersCollection, orderBy("createdAt", "desc"), limit(5));
            const usersTableSnapshot = await getDocs(usersQuery);
            const fetchedUsers = usersTableSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
            setUsers(fetchedUsers);

        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    }, [showAll]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists() && userDoc.data().role === 'admin') {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                    setLoading(false);
                }
            } else {
                router.push('/login');
            }
        });
        return () => unsubscribe();
    }, [auth, router]);
    
    useEffect(() => {
        if (isAdmin === true) {
            fetchAdminData();
        }
    }, [isAdmin, fetchAdminData]);

    if (loading && isAdmin === null) {
         return (
             <AppLayout>
                 <div className="flex flex-col gap-4">
                     <h1 className="text-3xl font-headline font-bold"><Skeleton className="h-8 w-1/4" /></h1>
                     <div className="text-muted-foreground"><Skeleton className="h-4 w-1/2" /></div>
                </div>
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mt-4">
                     <Skeleton className="h-24 w-full" />
                     <Skeleton className="h-24 w-full" />
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

    if (isAdmin === false) {
         return (
            <AppLayout>
                <Card className="mt-10">
                    <CardHeader className="items-center text-center">
                        <Shield className="w-16 h-16 text-destructive" />
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

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
                            <CardTitle className="text-sm font-medium">Basic Members</CardTitle>
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.basicUsers}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Silver Members</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.silverUsers}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Gold Members</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.goldUsers}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Diamond Members</CardTitle>
                            <Gem className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.diamondUsers}</div>
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
                         {loading ? (
                             <div className="space-y-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                             </div>
                         ) : (
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
                                    {users.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center">No users found.</TableCell>
                                        </TableRow>
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
                         )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
    