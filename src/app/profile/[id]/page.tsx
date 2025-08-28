import { AppLayout } from "@/components/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockUsers } from "@/lib/data";
import { Building, Calendar, Heart, MapPin, Sparkles } from "lucide-react";
import Image from "next/image";

export default function ProfileDetailPage({ params }: { params: { id: string } }) {
    const user = mockUsers.find(u => u.id === params.id);

    if (!user) {
        return (
            <AppLayout>
                <div className="text-center">
                    <h2 className="text-2xl font-bold">User not found</h2>
                    <p>The profile you are looking for does not exist.</p>
                </div>
            </AppLayout>
        );
    }
    
    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <Card className="overflow-hidden">
                    <div className="relative h-48 md:h-64 bg-muted">
                        <Image src={`https://picsum.photos/seed/${user.id}-cover/1200/400`} alt={`${user.name}'s cover photo`} layout="fill" objectFit="cover" data-ai-hint="romantic landscape" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-6">
                            <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background">
                                <AvatarImage src={user.imageUrl} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                    <CardHeader className="pt-20 md:pt-24 relative">
                        <div className="absolute top-4 right-4">
                            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                                <Heart className="mr-2 h-4 w-4" /> Connect
                            </Button>
                        </div>
                        <CardTitle className="text-3xl font-headline">{user.name}, {user.age}</CardTitle>
                        <CardDescription className="flex items-center gap-4 text-base">
                             <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {user.location}</span>
                             <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined 2 months ago</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold font-headline mb-2">About Me</h3>
                            <p className="text-muted-foreground">{user.bio}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold font-headline mb-2">Interests</h3>
                            <div className="flex flex-wrap gap-2">
                                {user.interests.map(interest => (
                                    <Badge key={interest} variant="secondary" className="text-sm px-3 py-1">{interest}</Badge>
                                ))}
                            </div>
                        </div>
                         <div>
                            <h3 className="text-lg font-semibold font-headline mb-2 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                What I'm Looking For
                            </h3>
                            <p className="text-muted-foreground italic">"{user.lookingFor}"</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
