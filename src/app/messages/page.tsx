import { AppLayout } from "@/components/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { mockConversations } from "@/lib/data";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";


export default function MessagesPage() {
    return (
        <AppLayout>
            <div className="grid gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Messages</CardTitle>
                        <CardDescription>Your conversations with your connections.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                         <div className="border-t">
                            {mockConversations.map(convo => (
                                <Link key={convo.id} href={`/messages/${convo.id}`} className="block hover:bg-muted/50">
                                    <div className="flex items-center gap-4 p-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={convo.participant.imageUrl} alt={convo.participant.name} />
                                            <AvatarFallback>{convo.participant.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="grid gap-1 flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-semibold">{convo.participant.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(convo.lastMessage.timestamp, { addSuffix: true })}
                                                </p>
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">{convo.lastMessage.text}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                         </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
