
'use client';

import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/lib/types";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { Users, Heart, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";


export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalLikes: 0,
        premiumUsers: 0,
    });
    const [recentUsers, setRecentUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Users
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

                // Fetch Recent Users
                const recentUsersQuery = query(usersCollection, orderBy("createdAt", "desc"), limit(5));
                const recentUsersSnapshot = await getDocs(recentUsersQuery);
                const fetchedRecentUsers = recentUsersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
                setRecentUsers(fetchedRecentUsers);

            } catch (error) {
                console.error("Error fetching admin data:", error);
                // Handle error, e.g., show a toast message
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <AppLayout>
            <div className="space-y-8">
                <div className="flex flex-col gap-4">
                     <h1 className="text-3xl font-headline font-bold">Admin Dashboard</h1>
                     <p className="text-muted-foreground">An overview of your application's activity.</p>
                </div>

                {loading ? (
                     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                         <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /></CardContent></Card>
                         <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /></CardContent></Card>
                         <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /></CardContent></Card>
                     </div>
                ) : (
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
                )}
                
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Registrations</CardTitle>
                        <CardDescription>The last 5 users who signed up.</CardDescription>
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
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    recentUsers.map(user => (
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
