'use client';

import { useState, useRef, useEffect } from 'react';
import Link from "next/link"
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { doc, setDoc, collection, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
  const genderRef = useRef<HTMLButtonElement>(null);

  // Additional form fields state
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('female');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [zodiacSign, setZodiacSign] = useState('');
  const [starSign, setStarSign] = useState('');
  const [employed, setEmployed] = useState('yes');
  const [occupation, setOccupation] = useState('');
  const [salary, setSalary] = useState('');
  const [workingPlace, setWorkingPlace] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [userUid, setUserUid] = useState<string | null>(null);
  const [age, setAge] = useState<number | undefined>();

  useEffect(() => {
    if (dob) {
      const today = new Date();
      let calculatedAge = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge);
    }
  }, [dob]);

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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUserUid(userCredential.user.uid);
      toast({
        title: "Account Created",
        description: "Welcome! Please complete your profile.",
      });
      setStep(2); 
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

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userUid) {
        toast({
            variant: "destructive",
            title: "Registration Failed",
            description: "User ID not found. Please try signing up again.",
        });
        setStep(1);
        return;
    }
    setIsLoading(true);
    
    try {
      // Generate memberid
      const usersRef = collection(db, "users");
      const genderQuery = query(usersRef, where("gender", "==", gender));
      const snapshot = await getCountFromServer(genderQuery);
      const userCount = snapshot.data().count;

      const memberIdPrefix = gender === 'male' ? 'UJM' : 'UJF';
      const memberid = `${memberIdPrefix}${userCount + 1}`;

      const userProfileData = {
        fullName,
        dob,
        gender,
        age,
        fatherName,
        motherName,
        mobileNo,
        zodiacSign,
        starSign,
        employed,
        occupation,
        salary,
        workingPlace,
        homeAddress,
        city,
        state,
        email,
        usertype: 'Basic',
        memberid,
      };
      
      // Update Firebase Auth profile
      if(auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: fullName,
        });
      }

      // Save to Firestore
      await setDoc(doc(db, "users", userUid), userProfileData);

      toast({
          title: "Registration Complete!",
          description: "Your profile has been created."
      });
      router.push('/browse');
    } catch (error: any) {
         toast({
            variant: "destructive",
            title: "Registration Failed",
            description: error.message,
        });
    } finally {
        setIsLoading(false);
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setDob(date);
    if (date) {
        setTimeout(() => {
            genderRef.current?.focus();
        }, 100);
    }
  };

  const nakshatras = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
  ];
  
  const zodiacSigns = [
    "Mesha (Aries)",
    "Vrishabha (Taurus)",
    "Mithuna (Gemini)",
    "Karka (Cancer)",
    "Simha (Leo)",
    "Kanya (Virgo)",
    "Tula (Libra)",
    "Vrishchika (Scorpio)",
    "Dhanu (Sagittarius)",
    "Makara (Capricorn)",
    "Kumbha (Aquarius)",
    "Meena (Pisces)"
  ];

  return (
    <div 
        className="flex min-h-screen items-center justify-center p-4"
        style={{ backgroundImage: "linear-gradient( 100.1deg,  rgba(217,157,38,1) 16.8%, rgba(247,213,110,1) 77.3% )" }}
    >
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
                            <Input id="full-name" placeholder="Anika Sharma" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
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
                                        onSelect={handleDateSelect}
                                        captionLayout="dropdown-buttons"
                                        fromYear={1950}
                                        toYear={new Date().getFullYear()}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                         <div className="grid gap-2 md:col-span-2">
                            <Label>Gender</Label>
                            <RadioGroup value={gender} onValueChange={setGender} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="female" id="female" ref={genderRef} />
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
                            <Input id="father-name" required value={fatherName} onChange={(e) => setFatherName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="mother-name">Mother's Name</Label>
                            <Input id="mother-name" required value={motherName} onChange={(e) => setMotherName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="mobile-no">Mobile No</Label>
                            <Input id="mobile-no" type="tel" required value={mobileNo} onChange={(e) => setMobileNo(e.target.value)} />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="zodiac-sign">Zodiac Sign (Rashi)</Label>
                            <Select value={zodiacSign} onValueChange={setZodiacSign}>
                                <SelectTrigger id="zodiac-sign">
                                    <SelectValue placeholder="Select zodiac sign" />
                                </SelectTrigger>
                                <SelectContent>
                                    {zodiacSigns.map(sign => (
                                        <SelectItem key={sign} value={sign}>{sign}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="star-sign">Star Sign (Nakshatra)</Label>
                             <Select value={starSign} onValueChange={setStarSign}>
                                <SelectTrigger id="star-sign">
                                    <SelectValue placeholder="Select star sign" />
                                </SelectTrigger>
                                <SelectContent>
                                    {nakshatras.map(nakshatra => (
                                        <SelectItem key={nakshatra} value={nakshatra}>{nakshatra}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                            <Label>Are you Employed?</Label>
                            <RadioGroup value={employed} onValueChange={setEmployed} className="flex gap-4">
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
                            <Input id="occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                             <Label htmlFor="salary">Salary (per annum)</Label>
                             <Select value={salary} onValueChange={setSalary}>
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
                            <Input id="working-place" value={workingPlace} onChange={(e) => setWorkingPlace(e.target.value)} />
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="home-address">Home Address</Label>
                            <Input id="home-address" value={homeAddress} onChange={(e) => setHomeAddress(e.target.value)} />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="state">State</Label>
                            <Input id="state" value={state} onChange={(e) => setState(e.target.value)} />
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
