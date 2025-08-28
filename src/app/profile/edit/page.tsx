import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function ProfileEditPage() {
    return (
        <AppLayout>
            <div className="mx-auto grid max-w-4xl gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">My Profile</CardTitle>
                        <CardDescription>Update your personal information and preferences.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="flex items-center gap-4">
                            <span className="relative flex h-24 w-24 shrink-0 overflow-hidden rounded-full">
                                <img className="aspect-square h-full w-full" alt="User" src="https://picsum.photos/seed/user-avatar/100/100" />
                            </span>
                            <div className="grid gap-1.5">
                                <Button>Change Photo</Button>
                                <p className="text-sm text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" defaultValue="Anika Sharma" />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="age">Age</Label>
                                <Input id="age" type="number" defaultValue="28" />
                            </div>
                        </div>

                         <div className="grid gap-2">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" defaultValue="Mumbai, India" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea id="bio" rows={4} defaultValue="Software engineer by day, aspiring chef by night. I love exploring new cafes, hiking, and reading historical fiction." />
                        </div>
                        
                        <div className="grid gap-2">
                            <Label htmlFor="interests">Interests</Label>
                            <Input id="interests" placeholder="e.g. Cooking, Hiking, Reading" defaultValue="Cooking, Hiking, Reading, Technology" />
                             <p className="text-sm text-muted-foreground">Separate interests with a comma.</p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="looking-for">What are you looking for?</Label>
                            <Textarea id="looking-for" rows={3} defaultValue="A meaningful, long-term relationship." />
                        </div>

                         <Button className="w-full sm:w-auto justify-self-start bg-primary hover:bg-primary/90">Save Changes</Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
