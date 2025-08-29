

'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Heart,
  Home,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  User,
} from 'lucide-react';
import { getAuth, onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { app } from '@/lib/firebase';
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from './ui/dropdown-menu';

const auth = getAuth(app);

const navItems = [
  { href: '/browse', icon: Home, label: 'Browse' },
  { href: '/matches', icon: Search, label: 'AI Matches' },
  { href: '/connections', icon: Heart, label: 'Connections' },
  { href: '/messages', icon: MessageSquare, label: 'Messages' },
];

const settingsNavItems = [
    { href: '/profile', icon: User, label: 'My Profile' },
    { href: '/settings', icon: Settings, label: 'Settings' },
]

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [loading, setLoading] = React.useState(true);


  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Check for profile completeness
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists() && !['/signup', '/profile/edit'].includes(pathname)) {
            toast({
                title: "Profile Incomplete",
                description: "Please complete your profile to continue.",
            });
            router.push('/profile/edit');
        }
      } else {
        setUser(null);
        if(!['/login', '/signup', '/'].includes(pathname)) {
            router.push('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname, toast]);

  const handleLogout = async () => {
    try {
        await signOut(auth);
        toast({
            title: "Logged Out",
            description: "You have been successfully logged out.",
        });
        router.push('/login');
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Logout Failed",
            description: "Something went wrong. Please try again."
        })
    }
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Skeleton className='h-screen w-full' />
        </div>
    )
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
                 <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
                <span className="font-headline text-lg font-semibold">Ultra Jodi Matrimony</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={{ children: item.label }}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
                 {settingsNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={{ children: item.label }}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout} tooltip={{children: "Logout"}}>
                         <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.photoURL || "https://picsum.photos/seed/user-avatar/100/100"} alt={user?.displayName || "User"} />
                            <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
                <SidebarTrigger className="md:hidden"/>
                <div className="flex-1">
                    <h1 className="font-headline text-lg font-semibold md:text-2xl capitalize">{pathname.split('/').pop()?.replace('-', ' ')}</h1>
                </div>
                 <Button variant="ghost" size="icon" className="rounded-full" asChild>
                    <Link href="/browse">
                        <Home className="h-5 w-5" />
                        <span className="sr-only">Home</span>
                    </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                       <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.photoURL || "https://picsum.photos/seed/user-avatar/100/100"} alt={user?.displayName || "User"} />
                          <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <span className="sr-only">Toggle user menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                       <Link href="/profile">
                          <User className="mr-2 h-4 w-4" />
                          <span>My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </header>
            <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
