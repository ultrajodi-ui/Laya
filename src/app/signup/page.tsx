'use client';

import { useState } from 'react';
import Link from "next/link"
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
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
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [dob, setDob] = useState<Date>();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: "Passwords do not match.",
      });
      return;
    }
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: "Account Created",
        description: "Welcome! Please complete your profile.",
      });
      setStep(2); // Move to the next step
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save the data to your database
    toast({
        title: "Registration Complete!",
        description: "Your profile has been created."
    });
    router.push('/browse');
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-[#feefdb] p-4">
      <Card className="mx-auto max-w-lg w-full">
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle className="text-xl font-headline">Create your Account</CardTitle>
              <CardDescription>
                Enter your information to start your journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup} className="grid gap-4">
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
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password"
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password"
                    required 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     Create an account
                </Button>
              </form>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline">
                  Log in
                </Link>
              </div>
            </CardContent>
          </>
        )}
        {step === 2 && (
            <>
                <CardHeader>
                    <CardTitle className="text-xl font-headline">Complete Your Profile</CardTitle>
                    <CardDescription>
                        Tell us a bit more about yourself.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegistration} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="full-name">Full Name</Label>
                            <Input id="full-name" placeholder="Anika Sharma" required />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="dob">Date of Birth</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "justify-start text-left font-normal",
                                        !dob && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dob ? format(dob, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                    mode="single"
                                    selected={dob}
                                    onSelect={setDob}
                                    initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                         <div className="grid gap-2 md:col-span-2">
                            <Label>Gender</Label>
                            <RadioGroup defaultValue="female" className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="female" id="female" />
                                    <Label htmlFor="female">Female</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="male" id="male" />
                                    <Label htmlFor="male">Male</Label>
                                </div>
                                 <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="other" id="other" />
                                    <Label htmlFor="other">Other</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="father-name">Father's Name</Label>
                            <Input id="father-name" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="mother-name">Mother's Name</Label>
                            <Input id="mother-name" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="mobile-no">Mobile No</Label>
                            <Input id="mobile-no" type="tel" required />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="zodiac-sign">Zodiac Sign (Rashi)</Label>
                            <Input id="zodiac-sign" />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="star-sign">Star Sign (Nakshatra)</Label>
                            <Input id="star-sign" />
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                            <Label>Are you Employed?</Label>
                            <RadioGroup defaultValue="yes" className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="yes" id="employed-yes" />
                                    <Label htmlFor="employed-yes">Yes</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="no" id="employed-no" />
                                    <Label htmlFor="employed-no">No</Label>
                                </div>
                            </RadioGroup>
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="occupation">Occupation</Label>
                            <Input id="occupation" />
                        </div>
                        <div className="grid gap-2">
                             <Label htmlFor="salary">Salary (per annum)</Label>
                             <Select>
                                <SelectTrigger id="salary">
                                    <SelectValue placeholder="Select range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="<3LPA">Less than 3 LPA</SelectItem>
                                    <SelectItem value="3-5LPA">3-5 LPA</SelectItem>
                                    <SelectItem value="5-10LPA">5-10 LPA</SelectItem>
                                    <SelectItem value="10-20LPA">10-20 LPA</SelectItem>
                                    <SelectItem value=">20LPA">More than 20 LPA</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="working-place">Working Place</Label>
                            <Input id="working-place" />
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="home-address">Home Address</Label>
                            <Input id="home-address" />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="state">State</Label>
                            <Input id="state" />
                        </div>
                        <div className="md:col-span-2">
                             <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Complete Registration
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </>
        )}
      </Card>
    </div>
  )
}
