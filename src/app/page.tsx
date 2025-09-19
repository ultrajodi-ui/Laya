
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { app } from '@/lib/firebase';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, redirect to browse page.
        router.push('/browse');
      } else {
        // No user is signed in, show the landing page.
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Skeleton className="h-16 w-full" />
        <main className="flex-1">
          <Skeleton className="w-full h-[80vh] min-h-[600px]" />
          <div className="w-full py-12 md:py-24 lg:py-32">
             <div className="container px-4 md:px-6">
                 <div className="grid items-center gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px]">
                    <div className="flex flex-col justify-center space-y-4">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                     <Skeleton className="aspect-video w-full" />
                </div>
            </div>
          </div>
        </main>
         <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm fixed top-0 w-full z-10" style={{ backgroundColor: '#0083B0' }}>
        <Link href="/" className="flex items-center justify-center">
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
          <span className="sr-only">Ultra Jodi Matrimony</span>
          <span className="ml-2 font-headline text-xl font-semibold text-white">Ultra Jodi Matrimony</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button asChild style={{ backgroundColor: 'hsl(var(--background))', color: '#3B2F2F' }} className="hover:bg-slate-200">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild style={{ backgroundColor: 'hsl(var(--background))', color: '#3B2F2F' }} className="hover:bg-slate-200">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center pt-16">
          <div className="absolute inset-0 bg-black/50 z-0">
            <Image
              src="https://images.unsplash.com/photo-1511405889574-b01de1da5441?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyMHx8Y291cGxlfGVufDB8fHx8MTc1NzQxMTIyNnww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Couple holding hands"
              data-ai-hint="couple hands"
              fill
              className="object-cover -z-10 opacity-50"
            />
          </div>
          <div className="container px-4 md:px-6 text-center text-white relative z-10">
            <div className="space-y-4">
              <h1 className="text-4xl font-headline font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl" style={{ color: 'hsl(var(--background))' }}>
                Ultra Jodi Matrimony
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl">
                Ultra Jodi uses cutting-edge AI to help you find a truly compatible partner. <br /> Your journey to a lasting connection starts here.
              </p>
              <div className="space-x-4">
                <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid items-center gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">AI Matchmaking</div>
                  <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">Intelligent Connections</h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Our advanced AI goes beyond surface-level traits. It analyzes deep compatibility in values, personality, and life goals to introduce you to someone you can truly build a future with.
                  </p>
                </div>
              </div>
              <Image
                src="https://firebasestorage.googleapis.com/v0/b/ultra-jodi-wxhoi.appspot.com/o/photos%2FCouple1.jpg?alt=media&token=e29a3a99-27e4-498c-b01b-9f4a56a6de98"
                width="550"
                height="310"
                alt="AI matchmaking illustration"
                data-ai-hint="indian couple"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
              />
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground text-center sm:text-left">Ultra Jodi Matrimony is a trusted matrimonial service designed for those seeking a lifelong marriage. This is not a dating website. All profiles should reflect genuine marriage intentions. Copyright © 2025 Ultra Jodi Matrimony. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
