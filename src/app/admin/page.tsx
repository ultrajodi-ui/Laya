

'use client';

import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase";
import { UserProfile, SupportQuery } from "@/lib/types";
import { collection, getDocs, query, doc, getDoc, orderBy, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
import { Users, Star, Shield, Gem, User as UserIcon, Loader2, MessageSquare, Trash2, Search } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuth, onAuthStateChanged, User, deleteUser } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


const statusOptions = ["Active", "Engaged", "Married", "Inactive"];
const userTypeOptions = ["Basic", "Silver", "Gold", "Diamond"];
const queryStatusOptions = ["Pending", "Process", "Finished"];

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
    const [genderFilter, setGenderFilter] = useState('all');
    const [userTypeFilter, setUserTypeFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const auth = getAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

     const fetchAdminStats = useCallback(async () => {
        try {
            const usersCollection = collection(db, "users");
            const userSnapshot = await getDocs(usersCollection);
            const usersData = userSnapshot.docs.map(doc => doc.data() as UserProfile).filter(user => user.usertype !== 'admin');
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
            const usersTableSnapshot = await getDocs(query(usersCollection));
            const fetchedUsers = usersTableSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
            setUsers(fetchedUsers.filter(user => user.usertype !== 'admin'));
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
                } as SupportQuery;
            });
            setQueries(fetchedQueries);
        } catch (error) {
            console.error("Error fetching support queries:", error);
        } finally {
            setLoadingQueries(false);
        }
    }, []);
    
    const handleStatusChange = async (userId: string, newStatus: string) => {
        const userDocRef = doc(db, 'users', userId);
        try {
            await updateDoc(userDocRef, { currentStatus: newStatus });
            setUsers(prevUsers => prevUsers.map(user => user.id === userId ? { ...user, currentStatus: newStatus as any } : user));
            toast({
                title: 'Status Updated',
                description: `User status has been changed to ${newStatus}.`,
            });
        } catch (error) {
            console.error("Error updating status:", error);
             toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'Could not update user status.',
            });
        }
    };
    
    const handleQueryStatusChange = async (queryId: string, newStatus: string) => {
        const queryDocRef = doc(db, 'supportQueries', queryId);
        try {
            await updateDoc(queryDocRef, { status: newStatus });
            setQueries(prevQueries => prevQueries.map(q => q.id === queryId ? { ...q, status: newStatus } : q));
            toast({
                title: 'Query Status Updated',
                description: `Query status has been changed to ${newStatus}.`,
            });
        } catch (error) {
            console.error("Error updating query status:", error);
             toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'Could not update query status.',
            });
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        try {
            // Archive user data
            const deletedUsersCollection = collection(db, "deletedUsers");
            await addDoc(deletedUsersCollection, {
                memberid: userToDelete.memberid || 'N/A',
                fullName: userToDelete.fullName,
                email: userToDelete.email,
                mobileNo: userToDelete.mobileNo || 'N/A',
                currentStatus: userToDelete.currentStatus || 'Active',
                deletedAt: new Date(),
            });

            // Delete from users collection
            await deleteDoc(doc(db, "users", userToDelete.id));

            // Note: Deleting a user from Firebase Auth cannot be done securely from the client-side
            // for other users. This requires a Cloud Function with admin privileges.

            setUsers(prevUsers => prevUsers.filter(u => u.id !== userToDelete.id));

            toast({
                title: "User Archived and Deleted",
                description: `User ${userToDelete.fullName} has been archived and removed from the active user list.`,
            });
        } catch (error) {
            console.error("Error deleting user:", error);
            toast({
                variant: "destructive",
                title: "Deletion Failed",
                description: "Could not delete user. See console for details.",
            });
        } finally {
            setIsDeleting(false);
            setUserToDelete(null);
        }
    };

    const filteredUsers = useMemo(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        return users
            .filter(user => genderFilter === 'all' || user.gender === genderFilter)
            .filter(user => userTypeFilter === 'all' || (user.usertype || 'Basic') === userTypeFilter)
            .filter(user => {
                if (!lowercasedQuery) return true;
                return (
                    user.fullName?.toLowerCase().includes(lowercasedQuery) ||
                    user.memberid?.toLowerCase().includes(lowercasedQuery) ||
                    user.mobileNo?.toLowerCase().includes(lowercasedQuery) ||
                    user.email?.toLowerCase().includes(lowercasedQuery)
                );
            });
    }, [users, genderFilter, userTypeFilter, searchQuery]);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists() && userDoc.data().usertype === 'admin') {
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
             <AlertDialog onOpenChange={(open) => !open && setUserToDelete(null)}>
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
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <CardTitle>All Users</CardTitle>
                                    <CardDescription>A list of all registered users in the system.</CardDescription>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                    <div className="relative flex-1 md:flex-initial">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Search..."
                                            className="pl-8 w-full"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <div className="w-full md:w-48">
                                        <Select value={genderFilter} onValueChange={setGenderFilter}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Filter by gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Genders</SelectItem>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-full md:w-48">
                                        <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Filter by user type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All User Types</SelectItem>
                                                {userTypeOptions.map(type => (
                                                     <SelectItem key={type} value={type}>{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
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
                                            <TableHead>Gender</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Mobile No</TableHead>
                                            <TableHead>User Type</TableHead>
                                            <TableHead>Current Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loadingData ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center">
                                                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredUsers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center">No users found.</TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredUsers.map(user => (
                                                <TableRow key={user.id}>
                                                    <TableCell>{user.memberid || 'N/A'}</TableCell>
                                                    <TableCell className="font-medium">{user.fullName}</TableCell>
                                                    <TableCell className="capitalize">{user.gender || 'N/A'}</TableCell>
                                                    <TableCell>{user.email}</TableCell>
                                                    <TableCell>{user.mobileNo || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={user.usertype !== 'Basic' ? 'default' : 'secondary'}>
                                                            {user.usertype || 'Basic'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                    <Select
                                                            value={user.currentStatus || 'Active'}
                                                            onValueChange={(newStatus) => handleStatusChange(user.id, newStatus)}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {statusOptions.map(status => (
                                                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <AlertDialogTrigger asChild>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                onClick={() => setUserToDelete(user)}
                                                                disabled={(user.currentStatus || 'Active') === 'Active'}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </AlertDialogTrigger>
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
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingQueries ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center">
                                                <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                            </TableCell>
                                        </TableRow>
                                    ) : queries.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center">No queries found.</TableCell>
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
                                                <TableCell>
                                                    <Select
                                                        value={q.status || 'Pending'}
                                                        onValueChange={(newStatus) => handleQueryStatusChange(q.id, newStatus)}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {queryStatusOptions.map(status => (
                                                                <SelectItem key={status} value={status}>{status}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user account for <span className="font-bold">{userToDelete?.fullName}</span> and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUser} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                             {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             {isDeleting ? 'Deleting...' : 'Yes, delete user'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
