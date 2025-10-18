
'use client';

import { AppLayout } from "@/components/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockConversations, mockUsers } from "@/lib/data";
import { cn } from "@/lib/utils";
import { ArrowLeft, Phone, Send, Video } from "lucide-react";
import Link from "next/link";


export default function MessageDetailPage({ params }: { params: { id: string } }) {
    const conversation = mockConversations.find(c => c.id === params.id);
    const participant = conversation?.participant;

    if (!conversation || !participant) {
        return (
            <AppLayout>
                <div>Conversation not found.</div>
            </AppLayout>
        );
    }
    
    return (
        <AppLayout>
            <div className="flex flex-col h-[calc(100vh-120px)] bg-card rounded-lg border">
                <header className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-3">
                        <Link href="/messages" className="md:hidden">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                         <Avatar>
                            <AvatarImage src={participant.imageUrl} />
                            <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h2 className="text-lg font-semibold font-headline">{participant.name}</h2>
                    </div>
                     <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                            <Phone className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Video className="w-5 h-5" />
                        </Button>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {conversation.messages.map(message => (
                        <div key={message.id} className={cn("flex items-end gap-2", message.senderId === 'user' ? 'justify-end' : 'justify-start')}>
                             {message.senderId !== 'user' && <Avatar className="w-8 h-8"><AvatarImage src={participant.imageUrl}/><AvatarFallback>{participant.name.charAt(0)}</AvatarFallback></Avatar>}
                            <div className={cn("max-w-xs md:max-w-md p-3 rounded-lg", message.senderId === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                               <p>{message.text}</p>
                               <p className={cn("text-xs mt-1", message.senderId === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground/70')}>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <footer className="p-4 border-t">
                    <div className="relative">
                        <Input placeholder="Type a message..." className="pr-12" />
                        <Button size="icon" className="absolute top-1/2 right-1 -translate-y-1/2 h-8 w-8 bg-accent hover:bg-accent/90">
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </footer>
            </div>
        </AppLayout>
    );
}
