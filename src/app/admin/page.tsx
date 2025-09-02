
'use client';

import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/lib/types";
import { collection, getDocs, orderBy, query, doc, getDoc } from "firebase/firestore";
import { Users, Star, Shield, Gem, User as UserIcon, Loader2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
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
    const [loadingData, setLoadingData] = useState(false);
    const [dataFetched, setDataFetched] = useState(false);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const auth = getAuth();
    const router = useRouter();

     const fetchAdminStats = useCallback(async () => {
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
                const userType = user.usertype || 'Basic';
                switch (userType) {
                    case 'Silver': silverUsers++; break;
                    case 'Gold': goldUsers++; break;
                    case 'Diamond': diamondUsers++; break;
                    default: basicUsers++; break;
                }
            });
            setStats({ totalUsers, basicUsers, silverUsers, goldUsers, diamondUsers });

        } catch (error) {
            console.error("Error fetching admin stats:", error);
        }
    }, []);

    const handleShowData = useCallback(async () => {
        setLoadingData(true);
        try {
            const usersCollection = collection(db, "users");
            const usersQuery = query(usersCollection, orderBy("createdAt", "desc"));
            const usersTableSnapshot = await getDocs(usersQuery);
            const fetchedUsers = usersTableSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
            setUsers(fetchedUsers.filter(user => user.role !== 'admin'));
            setDataFetched(true);
        } catch (error) {
            console.error("Error fetching users data:", error);
        } finally {
            setLoadingData(false);
        }
    }, []);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists() && userDoc.data().role === 'admin') {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } else {
                router.push('/login');
            }
        });
        return () => unsubscribe();
    }, [auth, router]);
    
    useEffect(() => {
        if (isAdmin === true) {
            fetchAdminStats().finally(() => setLoading(false));
        }
        if (isAdmin === false) {
            setLoading(false);
        }
    }, [isAdmin, fetchAdminStats]);

    if (loading) {
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
                        <CardTitle>All Users</CardTitle>
                        <CardDescription>A list of all registered users in the system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!dataFetched ? (
                            <div className="flex justify-center items-center h-40">
                                <Button onClick={handleShowData} disabled={loadingData}>
                                    {loadingData && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Show data
                                </Button>
                            </div>
                        ) : (
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Member Id</TableHead>
                                        <TableHead>User name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Mobile No</TableHead>
                                        <TableHead>User Type</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingData ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">
                                                <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                            </TableCell>
                                        </TableRow>
                                    ) : users.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">No users found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        users.map(user => (
                                            <TableRow key={user.id}>
                                                <TableCell>{user.memberid || 'N/A'}</TableCell>
                                                <TableCell className="font-medium">{user.fullName}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{user.mobileNo || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <Badge variant={user.usertype !== 'Basic' ? 'default' : 'secondary'}>
                                                        {user.usertype || 'Basic'}
                                                    </Badge>
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
    