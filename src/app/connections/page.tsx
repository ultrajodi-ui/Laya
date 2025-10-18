
'use client';

import { AppLayout } from "@/components/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getConnectionsByDirection, getConnectionsByStatus } from "@/lib/data";
import { Check, User, X } from "lucide-react";

function UserConnectionCard({ user, direction, status }: { user: any, direction?: string, status?: string }) {
    return (
        <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
                <Avatar>
                    <AvatarImage src={user.imageUrl} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{user.name}, {user.age}</p>
                    <p className="text-sm text-muted-foreground">{user.location}</p>
                </div>
            </div>
            {direction === 'incoming' && status === 'pending' && (
                 <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white">
                        <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            {direction === 'outgoing' && status === 'pending' && <Button size="sm" variant="outline">Cancel</Button>}
        </div>
    );
}

export default function ConnectionsPage() {
    const incomingRequests = getConnectionsByDirection('incoming').filter(c => c.status === 'pending');
    const outgoingRequests = getConnectionsByDirection('outgoing');
    const acceptedConnections = getConnectionsByStatus('accepted');
    
    return (
        <AppLayout>
            <div className="flex flex-col gap-4">
                <Card>
                     <CardHeader>
                        <CardTitle className="font-headline">Manage Connections</CardTitle>
                        <CardDescription>View your pending requests and established connections.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Tabs defaultValue="accepted">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="accepted">Connected</TabsTrigger>
                                <TabsTrigger value="incoming">Incoming</TabsTrigger>
                                <TabsTrigger value="outgoing">Sent</TabsTrigger>
                            </TabsList>
                            <TabsContent value="accepted" className="mt-4 space-y-4">
                                {acceptedConnections.length > 0 ? acceptedConnections.map(c => c.user && <UserConnectionCard key={c.id} user={c.user} />) : <p className="text-muted-foreground text-sm text-center py-8">No connections yet. Start browsing!</p>}
                            </TabsContent>
                            <TabsContent value="incoming" className="mt-4 space-y-4">
                                {incomingRequests.length > 0 ? incomingRequests.map(c => c.user && <UserConnectionCard key={c.id} user={c.user} direction="incoming" status="pending" />) : <p className="text-muted-foreground text-sm text-center py-8">No new connection requests.</p>}
                            </TabsContent>
                            <TabsContent value="outgoing" className="mt-4 space-y-4">
                                 {outgoingRequests.length > 0 ? outgoingRequests.map(c => c.user && <UserConnectionCard key={c.id} user={c.user} direction="outgoing" status="pending" />) : <p className="text-muted-foreground text-sm text-center py-8">You haven't sent any requests yet.</p>}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
