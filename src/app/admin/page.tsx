
'use client';

import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/lib/types";
import { collection, getDocs, orderBy, query, doc, getDoc } from "firebase/firestore";
import { Users, Star, Shield, Gem, User as UserIcon, Loader2, MessageSquare } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';

type SupportQuery = {
    id: string;
    memberId?: string;
    name?: string;
    email?: string;
    contactNo?: string;
    query?: string;
    submittedAt?: Date;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        basicUsers: 0,
        silverUsers: 0,
        goldUsers: 0,
        diamondUsers: 0,
    });
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [queries, setQueries] = useState<SupportQuery[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingData, setLoadingData] = useState(false);
    const [loadingQueries, setLoadingQueries] = useState(true);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [showUsers, setShowUsers] = useState(false);
    const auth = getAuth();
    const router = useRouter();

     const fetchAdminStats = useCallback(async () => {
        try {
            const usersCollection = collection(db, "users");
            const userSnapshot = await getDocs(usersCollection);
            const usersData = userSnapshot.docs.map(doc => doc.data() as UserProfile).filter(user => user.role !== 'admin');
            const totalUsers = usersData.length;

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

    const fetchUsersData = useCallback(async () => {
        setLoadingData(true);
        setShowUsers(true);
        try {
            const usersCollection = collection(db, "users");
            const usersQuery = query(usersCollection, orderBy("createdAt", "desc"));
            const usersTableSnapshot = await getDocs(usersQuery);
            const fetchedUsers = usersTableSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
            setUsers(fetchedUsers.filter(user => user.role !== 'admin'));
        } catch (error) {
            console.error("Error fetching users data:", error);
        } finally {
            setLoadingData(false);
        }
    }, []);

    const fetchSupportQueries = useCallback(async () => {
        setLoadingQueries(true);
        try {
            const queriesCollection = collection(db, "supportQueries");
            const queriesQuery = query(queriesCollection, orderBy("submittedAt", "desc"));
            const queriesSnapshot = await getDocs(queriesQuery);
            const fetchedQueries = queriesSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    submittedAt: data.submittedAt?.toDate()
                };
            });
            setQueries(fetchedQueries);
        } catch (error) {
            console.error("Error fetching support queries:", error);
        } finally {
            setLoadingQueries(false);
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
            Promise.all([fetchAdminStats(), fetchSupportQueries()])
                .finally(() => setLoading(false));
        }
        if (isAdmin === false) {
            setLoading(false);
        }
    }, [isAdmin, fetchAdminStats, fetchSupportQueries]);

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
                        {!showUsers && (
                            <Button onClick={fetchUsersData}>Show Data</Button>
                        )}
                        {showUsers && (
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

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><MessageSquare /> Queries</CardTitle>
                        <CardDescription>User-submitted support queries.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Member ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Contact No</TableHead>
                                    <TableHead>Query</TableHead>
                                    <TableHead>Submitted At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingQueries ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                        </TableCell>
                                    </TableRow>
                                ) : queries.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">No queries found.</TableCell>
                                    </TableRow>
                                ) : (
                                    queries.map(q => (
                                        <TableRow key={q.id}>
                                            <TableCell>{q.memberId || 'N/A'}</TableCell>
                                            <TableCell className="font-medium">{q.name}</TableCell>
                                            <TableCell>{q.email}</TableCell>
                                            <TableCell>{q.contactNo}</TableCell>
                                            <TableCell className="max-w-xs truncate">{q.query}</TableCell>
                                            <TableCell>{q.submittedAt ? format(q.submittedAt, 'PPp') : 'N/A'}</TableCell>
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
    

    

    