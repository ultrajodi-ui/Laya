

'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { add } from 'date-fns';


function PaymentForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const plan = searchParams.get('plan') as UserProfile['usertype'];
    const price = searchParams.get('price');
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('credit-card');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
            } else {
                router.push('/login');
            }
        });
        return () => unsubscribe();
    }, [auth, router]);
    

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !plan) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not process payment. User or plan not found.' });
            return;
        }

        setIsLoading(true);

        let photoViewLimits: UserProfile['photoViewLimits'] = { basic: 0, silver: 0, gold: 0, diamond: 0 };
        let contactLimit: UserProfile['contactLimit'] = { basic: 0, silver: 0, gold: 0, diamond: 0 };
        let planDuration: Duration = {};

        switch (plan) {
            case 'Silver':
                photoViewLimits = { basic: 20, silver: 15, gold: 10, diamond: 0 };
                contactLimit = { basic: 20, silver: 15, gold: 10, diamond: 0 };
                planDuration = { months: 3 };
                break;
            case 'Gold':
                photoViewLimits = { basic: 40, silver: 20, gold: 15, diamond: 5 };
                contactLimit = { basic: 40, silver: 20, gold: 15, diamond: 5 };
                planDuration = { months: 6 };
                break;
            case 'Diamond':
                 photoViewLimits = { basic: 80, silver: 50, gold: 35, diamond: 25 };
                contactLimit = { basic: 80, silver: 50, gold: 35, diamond: 25 };
                planDuration = { months: 12 };
                break;
        }

        const planStartDate = new Date();
        const planEndDate = add(planStartDate, planDuration);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, {
                usertype: plan,
                photoViewLimits: photoViewLimits,
                contactLimit: contactLimit,
                planStartDate: planStartDate,
                planEndDate: planEndDate,
            });
            
            setIsLoading(false);
            toast({
                title: "Payment Successful!",
                description: `You have successfully subscribed to the ${plan} plan.`,
            });
            router.push('/browse');
        } catch (error) {
            console.error("Failed to update user plan:", error);
             toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'Your payment was successful, but we failed to update your plan. Please contact support.',
            });
            setIsLoading(false);
        }
    }

    const UpiIcon = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.3398 21.9998L8.98977 13.8898L6.48977 15.3198L6.01977 12.4898L12.3898 9.1798L13.5198 9.7798L16.2798 3.9698L19.2798 4.7798L14.7198 16.3298L17.2098 17.7598L16.7498 20.5898L10.3398 21.9998Z" fill="#5F6368"/>
            <path d="M4.36365 10.3638L3.18188 7.95471L8.45456 5.31836L9.63633 7.72745L4.36365 10.3638Z" fill="#5F6368"/>
        </svg>
    )

    return (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle className="font-headline">Complete Your Purchase</CardTitle>
                <CardDescription>You are subscribing to the <span className="font-bold text-primary">{plan}</span> plan for <span className="font-bold text-primary">{price}</span>.</CardDescription>
            </CardHeader>
            <form onSubmit={handlePayment}>
                <CardContent className="space-y-6">
                    <div className="grid gap-4">
                        <Label>Payment Method</Label>
                        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-3 gap-4">
                            <div>
                                <RadioGroupItem value="credit-card" id="credit-card" className="peer sr-only" />
                                <Label htmlFor="credit-card" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                    <CreditCard className="mb-3 h-6 w-6" />
                                    Credit Card
                                </Label>
                            </div>
                             <div>
                                <RadioGroupItem value="debit-card" id="debit-card" className="peer sr-only" />
                                <Label htmlFor="debit-card" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                    <CreditCard className="mb-3 h-6 w-6" />
                                    Debit Card
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="upi" id="upi" className="peer sr-only" />
                                <Label htmlFor="upi" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                   <UpiIcon />
                                    UPI
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {paymentMethod === 'credit-card' || paymentMethod === 'debit-card' ? (
                        <div className="space-y-4 animate-in fade-in-20">
                            <div className="grid gap-2">
                                <Label htmlFor="card-name">Name on Card</Label>
                                <Input id="card-name" placeholder="John Doe" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="card-number">Card Number</Label>
                                <Input id="card-number" placeholder="•••• •••• •••• ••••" required />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="grid gap-2 col-span-2">
                                    <Label htmlFor="expiry-date">Expiry Date</Label>
                                    <Input id="expiry-date" placeholder="MM/YY" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="cvc">CVC</Label>
                                    <Input id="cvc" placeholder="123" required />
                                </div>
                            </div>
                        </div>
                    ) : (
                         <div className="space-y-4 animate-in fade-in-20">
                            <div className="grid gap-2">
                                <Label htmlFor="upi-id">UPI ID</Label>
                                <Input id="upi-id" placeholder="yourname@bank" required />
                            </div>
                             <p className="text-sm text-muted-foreground">You will receive a payment request on your UPI app.</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button className="w-full" type="submit" disabled={isLoading}>
                         {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? 'Processing...' : `Pay ${price}`}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}

export default function PaymentPage() {
    return (
        <AppLayout>
            <div className="flex justify-center items-start pt-8">
                <Suspense fallback={<div>Loading...</div>}>
                    <PaymentForm />
                </Suspense>
            </div>
        </AppLayout>
    );
}
