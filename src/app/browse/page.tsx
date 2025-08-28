import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { mockUsers } from "@/lib/data";
import { Heart, ListFilter, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BrowsePage() {
    return (
        <AppLayout>
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Input placeholder="Search by name or interest..." className="pl-8" />
                        <span className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">
                            <Heart className="h-4 w-4" />
                        </span>
                    </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1">
                                <ListFilter className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem checked>
                                Age Range
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem>Location</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem>
                                Interests
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {mockUsers.map(user => (
                        <Card key={user.id} className="overflow-hidden transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
                             <CardHeader className="p-0">
                                <Link href={`/profile/${user.id}`}>
                                    <Image
                                        src={user.imageUrl}
                                        alt={user.name}
                                        width={400}
                                        height={400}
                                        data-ai-hint="person portrait"
                                        className="w-full h-64 object-cover"
                                    />
                                </Link>
                            </CardHeader>
                            <CardContent className="p-4 space-y-2">
                                <div className="flex items-baseline justify-between">
                                    <Link href={`/profile/${user.id}`}>
                                        <h3 className="text-xl font-headline font-semibold">{user.name}, {user.age}</h3>
                                    </Link>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    <span>{user.location}</span>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 h-10">{user.bio}</p>
                                <div className="flex flex-wrap gap-1 pt-1">
                                    {user.interests.slice(0, 3).map(interest => (
                                        <Badge key={interest} variant="secondary">{interest}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-0">
                                 <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                    <Heart className="mr-2 h-4 w-4" /> Connect
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}