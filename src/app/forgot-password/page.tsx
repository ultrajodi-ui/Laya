
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password Reset Link Sent",
        description: "Please check your email to reset your password.",
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center" style={{ backgroundColor: '#3B2F2F' }}>
        <Link href="/" className="flex items-center justify-center text-primary">
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
           <Button asChild variant="ghost" className="text-white hover:bg-white/20 hover:text-white">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild style={{ backgroundColor: 'hsl(var(--background))', color: '#3B2F2F' }} className="hover:bg-slate-200">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>
      <main 
          className="flex-1 flex items-center justify-center p-4"
          style={{ backgroundImage: "linear-gradient( 100.1deg,  rgba(217,157,38,1) 16.8%, rgba(247,213,110,1) 77.3% )" }}
      >
        <Card className="mx-auto max-w-sm w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordReset} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Remember your password?{" "}
              <Link href="/login" className="underline">
                Log in
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
