

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
  Shield,
  Star,
  Zap,
  Info,
  LifeBuoy,
  ThumbsUp,
} from 'lucide-react';
import { getAuth, onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot, Unsubscribe, updateDoc } from 'firebase/firestore';
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
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { app } from '@/lib/firebase';
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from './ui/dropdown-menu';
import { PageTitleProvider, usePageTitle } from '@/hooks/use-page-title';
import type { UserProfile } from '@/lib/types';


const auth = getAuth(app);

const navItems = [
  { href: '/browse', icon: Home, label: 'Browse' },
  { href: '/matches', icon: Search, label: 'AI Matches' },
  { href: '/your-likes', icon: ThumbsUp, label: 'Your Likes' },
  { href: '/likes-received', icon: Star, label: 'Likes Received' },
  { href: '/upgrade', icon: Zap, label: 'Premium Member Benefits' },
  { href: '/help-support', icon: LifeBuoy, label: 'Help & Support' },
  { href: '/about-us', icon: Info, label: 'About Us' },
];

const settingsNavItems = [
    { href: '/profile', icon: User, label: 'My Profile' },
    { href: '/settings', icon: Settings, label: 'Settings' },
]

function AppLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { pageTitle, setPageTitle } = usePageTitle();

  useEffect(() => {
    let unsubscribeSnapshot: Unsubscribe | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      setLoading(false);
      
      // If there's an existing snapshot listener, unsubscribe from it first
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }

      if (authUser) {
        setUser(authUser);
        const userDocRef = doc(db, 'users', authUser.uid);
        
        unsubscribeSnapshot = onSnapshot(userDocRef, async (doc) => {
          if (doc.exists()) {
            const profile = doc.data() as UserProfile;
            setUserProfile(profile);

             // Check for plan expiration
            if (profile.usertype !== 'Basic' && profile.planEndDate) {
                const endDate = profile.planEndDate.toDate();
                if (new Date() > endDate) {
                    await updateDoc(userDocRef, {
                        usertype: 'Basic',
                        photoViewLimits: { basic: 0, silver: 0, gold: 0, diamond: 0 },
                        contactLimit: 3,
                    });
                    toast({
                        title: 'Subscription Expired',
                        description: 'Your premium plan has expired. You are now on the Basic plan.',
                    });
                    // The onSnapshot listener will update the userProfile state automatically
                }
            }


            // Profile completion check
            const profileIsMinimal = Object.keys(profile).length < 5;
            if (profileIsMinimal && pathname !== '/profile/edit') {
                toast({
                    title: "Profile Incomplete",
                    description: "Please complete your profile to continue.",
                });
                router.push('/profile/edit');
            }
          } else {
             setUserProfile(null);
             // If user exists in auth but not DB, redirect to edit profile
             if (pathname !== '/profile/edit') {
                 router.push('/profile/edit');
             }
          }
        }, (error) => {
            console.error("Snapshot listener error:", error);
            // This is where permission errors might be caught if they still occur
        });

      } else {
        setUser(null);
        setUserProfile(null);
        // If no user and not on a public page, redirect to login
        if (!['/login', '/signup', '/', '/forgot-password'].includes(pathname)) {
          router.push('/login');
        }
      }
    });

    // Cleanup both auth and snapshot listeners on component unmount
    return () => {
        unsubscribeAuth();
        if (unsubscribeSnapshot) {
            unsubscribeSnapshot();
        }
    };
  }, [pathname, router, toast]);
  

  useEffect(() => {
    if (pathname.startsWith('/profile/edit')) {
      setPageTitle('Edit Profile');
    } else if (pathname.startsWith('/profile/view')) {
      setPageTitle('My Profile');
    } else if (pathname.startsWith('/admin')) {
      setPageTitle('Admin Dashboard');
    } else if (!pathname.startsWith('/profile/')) {
       const title = pathname.split('/').pop()?.replace('-', ' ') || '';
       setPageTitle(title);
    }
  }, [pathname, setPageTitle]);


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

  // Render children without layout for auth pages
  if (['/login', '/signup', '/', '/forgot-password'].includes(pathname)) {
    return <>{children}</>;
  }

  // Show a full-page skeleton loader while we wait for auth.
  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Skeleton className='h-screen w-full' />
        </div>
    )
  }

  // If auth is done and there's no user, it means they need to log in.
  // The onAuthStateChanged listener above will have already initiated a redirect.
  // We can return null here to avoid a flash of unstyled content.
  if (!user) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={true}>
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
                    className="h-6 w-6 text-white"
                >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
                <span className="font-headline text-lg font-semibold text-white">Ultra Jodi Matrimony</span>
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
               <SidebarSeparator />
                {userProfile?.role === 'admin' && (
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname.startsWith('/admin')} tooltip={{children: "Admin"}}>
                            <Link href="/admin">
                                <Shield />
                                <span>Admin</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                )}
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
                            <AvatarImage src={user?.photoURL || userProfile?.imageUrl || "https://picsum.photos/seed/user-avatar/100/100"} alt={user?.displayName || "User"} />
                            <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <header className="flex h-14 items-center border-b sticky top-0 z-30" style={{ backgroundColor: '#3B2F2F' }}>
                <div className="flex h-14 items-center gap-4 px-4 lg:h-[60px] lg:px-6 w-full">
                    <SidebarTrigger className="md:hidden text-white"/>
                    <div className="flex-1">
                        <h1 className="font-headline text-lg font-semibold md:text-2xl capitalize text-white">{pageTitle}</h1>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/20 hover:text-white" asChild>
                        <Link href="/browse">
                            <Home className="h-5 w-5" />
                            <span className="sr-only">Home</span>
                        </Link>
                    </Button>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.photoURL || userProfile?.imageUrl || "https://picsum.photos/seed/user-avatar/100/100"} alt={user?.displayName || "User"} />
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
                        <DropdownMenuItem asChild disabled={userProfile?.usertype === 'Diamond'}>
                        <Link href="/upgrade">
                            <Star className="mr-2 h-4 w-4" />
                            <span>Upgrade Plan</span>
                        </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}


export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <PageTitleProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </PageTitleProvider>
  )
}
