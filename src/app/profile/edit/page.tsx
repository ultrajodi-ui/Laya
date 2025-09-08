

'use client';

import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged, User, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, getCountFromServer, collection, where, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Zap, CalendarIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';
import { UserProfile } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';

export default function ProfileEditPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [profileData, setProfileData] = useState<Partial<UserProfile>>({ gender: 'female', photoVisibility: 'Public', interests: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const fatherNameRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const dob = data.dob?.toDate();
                    setProfileData({
                        ...data,
                        dob: dob,
                        photoVisibility: data.photoVisibility || 'Public',
                        interests: data.interests || [],
                    });
                } else {
                    // New user, pre-fill email
                    setProfileData((prev: any) => ({ ...prev, email: currentUser.email, interests: [] }));
                }
            } else {
                setUser(null);
                setProfileData({});
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [auth]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setProfileData((prevData: any) => ({ ...prevData, [id]: value }));
    };
    
    const handleSelectChange = (id: string, value: string) => {
        setProfileData((prevData: any) => ({ ...prevData, [id]: value }));
    }
     const handleDateSelect = (date: Date | undefined) => {
        setProfileData((prevData: any) => ({ ...prevData, dob: date }));
        setIsCalendarOpen(false);
        fatherNameRef.current?.focus();
    };
    
    const handlePhotoChangeClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Here you would typically upload the file to a storage service (like Firebase Storage)
            // and then update the profileData with the new imageUrl.
            // For now, we can just log it.
            console.log('Selected file:', file);
            toast({
                title: 'File Selected',
                description: 'In a real app, this would be uploaded.',
            });
        }
    };
    
    const handleInterestChange = (interest: string) => {
        setProfileData((prev) => {
            const interests = prev.interests ? [...prev.interests] : [];
            const index = interests.indexOf(interest);
            if (index > -1) {
                interests.splice(index, 1);
            } else {
                interests.push(interest);
            }
            return { ...prev, interests };
        });
    };


    const handleSaveChanges = async () => {
        if (!user) return;
        
        if (!profileData.maritalStatus) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please select your Marital Status.",
            });
            return;
        }

        setIsSaving(true);
        try {
            const dataToSave = { ...profileData };

            // Generate memberid and set contact limit if it's a new user
            if (!dataToSave.memberid) {
                const memberIdPrefix = dataToSave.gender === 'male' ? 'UJM' : 'UJF';
                const uniqueId = Date.now().toString().slice(-6);
                dataToSave.memberid = `${memberIdPrefix}${uniqueId}`;
                dataToSave.contactLimit = 3; // Set default contact limit
            }

            if (auth.currentUser && auth.currentUser.displayName !== dataToSave.fullName) {
                await updateProfile(auth.currentUser, {
                    displayName: dataToSave.fullName,
                });
            }

            const userDocRef = doc(db, "users", user.uid);
            const { imageUrl, ...finalData } = dataToSave;
            await setDoc(userDocRef, { ...finalData, usertype: finalData.usertype || 'Basic' }, { merge: true });
            
            toast({
                title: "Profile Updated",
                description: "Your changes have been saved successfully.",
            });
            router.push('/profile/view');
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: error.message,
            });
        } finally {
            setIsSaving(false);
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

  const motherTongues = ["Assamese", "Bengali", "Bodo", "Dogri", "English", "Gujarati", "Hindi", "Kannada", "Kashmiri", "Konkani", "Maithili", "Malayalam", "Manipuri", "Marathi", "Nepali", "Odia", "Punjabi", "Sanskrit", "Santali", "Sindhi", "Tamil", "Telugu", "Urdu", "Other"];
    
    const educationLevels = ["SSLC", "HSC", "ITI", "Diploma", "Bachelors", "PG", "Engineering", "MBBS"];
    const religions = ["Hindu", "Christian", "Muslim - Shia", "Muslim - Sunni", "Muslim - Other", "Sikh", "Jain - Digambar", "Jain - Shwetamber", "Jain - Others", "Parsi", "Buddhist", "Jewish", "Inter - Religion", "No Religious Belief"];
    const communities = ["OC", "FC", "MBC", "BC", "SC", "ST", "Other"];
    const states = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];
    const interests = ["Reading", "Traveling", "Cooking", "Foodie", "Music", "Movies", "Hiking", "Fitness", "Yoga", "Sports", "Dancing", "Singing", "Acting", "Photography", "Painting", "Writing", "Pets", "Fashion", "Meditation", "Shopping", "cycling", "Swimming", "Gaming", "Volunteering", "Family Time", "Temple Visit", "Prayers", "Gardening", "Storytelling", "Helping Others", "Celebrations"];
    const profileByOptions = ["Self", "Parents", "Sibling", "Guardian", "Friends", "Relatives"];


    if (isLoading) {
        return (
            <AppLayout>
                 <div className="mx-auto grid max-w-4xl gap-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-1/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-24 w-24 rounded-full" />
                                <div className="grid gap-1.5">
                                    <Skeleton className="h-10 w-24" />
                                    <Skeleton className="h-4 w-40" />
                                </div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                     <Skeleton className="h-5 w-16" />
                                     <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="grid gap-2">
                                     <Skeleton className="h-5 w-10" />
                                     <Skeleton className="h-10 w-full" />
                                </div>
                            </div>
                             <div className="grid gap-2">
                                 <Skeleton className="h-5 w-20" />
                                 <Skeleton className="h-10 w-full" />
                            </div>
                             <div className="grid gap-2">
                                 <Skeleton className="h-5 w-10" />
                                 <Skeleton className="h-20 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                 </div>
            </AppLayout>
        )
    }

    if (!profileData) {
        return (
            <AppLayout>
                <div className="text-center">Loading profile... If this takes too long, please try logging in again.</div>
            </AppLayout>
        );
    }


    return (
        <AppLayout>
            <div className="mx-auto grid max-w-4xl gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Edit Your Profile</CardTitle>
                        <CardDescription>Update your personal information and preferences.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="flex items-center gap-4">
                            <span className="relative flex h-24 w-24 shrink-0 overflow-hidden rounded-full">
                                <img className="aspect-square h-full w-full" alt={profileData.fullName || 'User'} src={profileData.imageUrl || `https://picsum.photos/seed/${user?.uid}/100/100`} />
                            </span>
                            <div className="grid gap-1.5">
                                <Button onClick={handlePhotoChangeClick}>Change Photo</Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/gif"
                                />
                                <p className="text-sm text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                            </div>
                        </div>
                        
                         <div className="grid gap-2">
                            <Label htmlFor="photo-visibility">Profile Photo is</Label>
                            <Select value={profileData.photoVisibility} onValueChange={(value) => handleSelectChange('photoVisibility', value)}>
                                <SelectTrigger id="photo-visibility">
                                    <SelectValue placeholder="Select visibility" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Public">Public</SelectItem>
                                    <SelectItem value="Private">Private</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>


                         <div className="grid gap-2 p-4 border rounded-lg">
                            <Label>Account Type</Label>
                            <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="text-base">{profileData.usertype || 'Basic'}</Badge>
                                <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                                    <Link href="/upgrade">
                                        <Zap className="mr-2 h-4 w-4" />
                                        Upgrade to Premium
                                    </Link>
                                </Button>
                            </div>
                        </div>

                         <div className="grid gap-2">
                            <Label htmlFor="profileBy">Profile By</Label>
                            <Select value={profileData.profileBy} onValueChange={(value) => handleSelectChange('profileBy', value)}>
                                <SelectTrigger id="profileBy">
                                    <SelectValue placeholder="Select who created this profile" />
                                </SelectTrigger>
                                <SelectContent>
                                    {profileByOptions.map(option => (
                                        <SelectItem key={option} value={option}>{option}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input id="fullName" value={profileData.fullName || ''} onChange={handleInputChange} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="dob">Date of Birth</Label>
                                 <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                  <PopoverTrigger asChild>
                                      <Button
                                      variant={"outline"}
                                      className={cn(
                                          "justify-start text-left font-normal",
                                          !profileData.dob && "text-muted-foreground"
                                      )}
                                      >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {profileData.dob ? format(profileData.dob, "PPP") : <span>Pick a date</span>}
                                      </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                      <Calendar
                                          mode="single"
                                          selected={profileData.dob}
                                          onSelect={handleDateSelect}
                                          captionLayout="dropdown-buttons"
                                          fromYear={1950}
                                          toYear={new Date().getFullYear()}
                                          initialFocus
                                      />
                                  </PopoverContent>
                              </Popover>
                            </div>
                              <div className="grid gap-2">
                              <Label>Gender</Label>
                              <RadioGroup value={profileData.gender} onValueChange={(value) => handleSelectChange('gender', value)} className="flex gap-4">
                                  <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="female" id="female" />
                                      <Label htmlFor="female">Female</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="male" id="male" />
                                      <Label htmlFor="male">Male</Label>
                                  </div>
                              </RadioGroup>
                          </div>
                            <div className="grid gap-2">
                                <Label htmlFor="motherTongue">Mother Tongue</Label>
                                <Select value={profileData.motherTongue || ''} onValueChange={(value) => handleSelectChange('motherTongue', value)}>
                                    <SelectTrigger id="motherTongue">
                                        <SelectValue placeholder="Select mother tongue" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {motherTongues.map(lang => (
                                            <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="fatherName">Father Name</Label>
                                <Input id="fatherName" ref={fatherNameRef} value={profileData.fatherName || ''} onChange={handleInputChange} />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="motherName">Mother Name</Label>
                                <Input id="motherName" value={profileData.motherName || ''} onChange={handleInputChange} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="bodyType">Body Type</Label>
                                <Select value={profileData.bodyType || ''} onValueChange={(value) => handleSelectChange('bodyType', value)}>
                                    <SelectTrigger id="bodyType">
                                        <SelectValue placeholder="Select body type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Slim">Slim</SelectItem>
                                        <SelectItem value="Normal">Normal</SelectItem>
                                        <SelectItem value="Little Fat">Little Fat</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="complexion">Complexion</Label>
                                <Select value={profileData.complexion || ''} onValueChange={(value) => handleSelectChange('complexion', value)}>
                                    <SelectTrigger id="complexion">
                                        <SelectValue placeholder="Select complexion" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Fair">Fair</SelectItem>
                                        <SelectItem value="Medium Fair">Medium Fair</SelectItem>
                                        <SelectItem value="Medium Brown">Medium Brown</SelectItem>
                                        <SelectItem value="Brown">Brown</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4 col-span-1">
                                <div className="grid gap-2">
                                    <Label htmlFor="heightFeet">Height (Feet)</Label>
                                    <Select value={profileData.heightFeet || ''} onValueChange={(value) => handleSelectChange('heightFeet', value)}>
                                        <SelectTrigger id="heightFeet">
                                            <SelectValue placeholder="Feet" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['3', '4', '5', '6', '7', '8'].map(ft => (
                                                <SelectItem key={ft} value={ft}>{ft} ft</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="heightInches">Height (Inches)</Label>
                                    <Select value={profileData.heightInches || ''} onValueChange={(value) => handleSelectChange('heightInches', value)}>
                                        <SelectTrigger id="heightInches">
                                            <SelectValue placeholder="Inches" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['0','1','2','3','4','5','6','7','8','9','10','11'].map(inch => (
                                                <SelectItem key={inch} value={inch}>{inch} in</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="maritalStatus">Marital Status<span className="text-red-500">*</span></Label>
                                <Select value={profileData.maritalStatus || ''} onValueChange={(value) => handleSelectChange('maritalStatus', value)}>
                                    <SelectTrigger id="maritalStatus">
                                        <SelectValue placeholder="Select marital status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Never Married">Never Married</SelectItem>
                                        <SelectItem value="Divorced">Divorced</SelectItem>
                                        <SelectItem value="Widow">Widow</SelectItem>
                                        <SelectItem value="Widower">Widower</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="education">Education</Label>
                                <Select value={profileData.education || ''} onValueChange={(value) => handleSelectChange('education', value)}>
                                    <SelectTrigger id="education">
                                        <SelectValue placeholder="Select education level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {educationLevels.map(level => (
                                            <SelectItem key={level} value={level}>{level}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="educationDetails">Education Details</Label>
                                <Input id="educationDetails" value={profileData.educationDetails || ''} onChange={handleInputChange} />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="employed">Employed</Label>
                                <Select value={profileData.employed || ''} onValueChange={(value) => handleSelectChange('employed', value)}>
                                    <SelectTrigger id="employed">
                                        <SelectValue placeholder="Select employment status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Government">Government</SelectItem>
                                        <SelectItem value="Private">Private</SelectItem>
                                        <SelectItem value="Business">Business</SelectItem>
                                        <SelectItem value="Self Employed">Self Employed</SelectItem>
                                        <SelectItem value="Un Employed">Un Employed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="occupation">Occupation</Label>
                                <Input id="occupation" value={profileData.occupation || ''} onChange={handleInputChange} />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="salary">Salary (per annum)</Label>
                                <Select value={profileData.salary || ''} onValueChange={(value) => handleSelectChange('salary', value)}>
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
                                <Label htmlFor="workingPlace">Working Place</Label>
                                <Input id="workingPlace" value={profileData.workingPlace || ''} onChange={handleInputChange} />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="homeState">Home State</Label>
                                <Select value={profileData.homeState || ''} onValueChange={(value) => handleSelectChange('homeState', value)}>
                                    <SelectTrigger id="homeState">
                                        <SelectValue placeholder="Select your state" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {states.map(state => (
                                            <SelectItem key={state} value={state}>{state}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="city">Home Town/City</Label>
                                <Input id="city" value={profileData.city || ''} onChange={handleInputChange} />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="mobileNo">Mobile No</Label>
                                <Input id="mobileNo" value={profileData.mobileNo || ''} onChange={handleInputChange} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="religion">Religion</Label>
                                <Select value={profileData.religion || ''} onValueChange={(value) => handleSelectChange('religion', value)}>
                                    <SelectTrigger id="religion">
                                        <SelectValue placeholder="Select religion" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {religions.map(item => (
                                            <SelectItem key={item} value={item}>{item}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="community">Community</Label>
                                <Select value={profileData.community || ''} onValueChange={(value) => handleSelectChange('community', value)}>
                                    <SelectTrigger id="community">
                                        <SelectValue placeholder="Select community" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {communities.map(item => (
                                            <SelectItem key={item} value={item}>{item}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="subCaste">Sub Caste</Label>
                                <Input id="subCaste" value={profileData.subCaste || ''} onChange={handleInputChange} />
                            </div>
                             <div className="grid gap-2">
                              <Label htmlFor="zodiac-sign">Zodiac Sign (Rashi)</Label>
                              <Select value={profileData.zodiacSign} onValueChange={(value) => handleSelectChange('zodiacSign', value)}>
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
                              <Select value={profileData.starSign} onValueChange={(value) => handleSelectChange('starSign', value)}>
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
                          <div className="grid gap-2">
                            <Label htmlFor="diet">Diet</Label>
                            <Select value={profileData.diet || ''} onValueChange={(value) => handleSelectChange('diet', value)}>
                                <SelectTrigger id="diet">
                                    <SelectValue placeholder="Select diet" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                                    <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                                    <SelectItem value="Eggetarian">Eggetarian</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="drinkingHabit">Drinking Habit</Label>
                            <Select value={profileData.drinkingHabit || ''} onValueChange={(value) => handleSelectChange('drinkingHabit', value)}>
                                <SelectTrigger id="drinkingHabit">
                                    <SelectValue placeholder="Select drinking habit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Non-Drinker">Non-Drinker</SelectItem>
                                    <SelectItem value="Social Drinker">Social Drinker</SelectItem>
                                    <SelectItem value="Moderate drinker">Moderate drinker</SelectItem>
                                    <SelectItem value="Heavy drinkers">Heavy drinkers</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="smokingHabit">Smoking Habit</Label>
                            <Select value={profileData.smokingHabit || ''} onValueChange={(value) => handleSelectChange('smokingHabit', value)}>
                                <SelectTrigger id="smokingHabit">
                                    <SelectValue placeholder="Select smoking habit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Non-Smoker">Non-Smoker</SelectItem>
                                    <SelectItem value="Light Smoker">Light Smoker</SelectItem>
                                    <SelectItem value="Moderate Smoker">Moderate Smoker</SelectItem>
                                    <SelectItem value="Heavy Smoker">Heavy Smoker</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        </div>
                        
                        <div className="grid gap-4">
                            <Label>Interests</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {interests.map((interest) => (
                                    <div key={interest} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={interest}
                                            checked={profileData.interests?.includes(interest)}
                                            onCheckedChange={() => handleInterestChange(interest)}
                                        />
                                        <label
                                            htmlFor={interest}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {interest}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="lookingFor">What are you looking for?</Label>
                            <Textarea id="lookingFor" rows={3} value={profileData.lookingFor || ''} onChange={handleInputChange}/>
                        </div>

                         <div className="flex gap-2 justify-self-start">
                            <Button onClick={handleSaveChanges} className="bg-primary hover:bg-primary/90" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button variant="outline" onClick={() => router.push('/profile/view')} disabled={isSaving}>
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
