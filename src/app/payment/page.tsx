
'use client';

import { Suspense, useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { add } from 'date-fns';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function PaymentForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const plan = searchParams.get('plan') as UserProfile['usertype'];
    const price = searchParams.get('price');
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    setCurrentUserProfile(userDoc.data() as UserProfile);
                }
            } else {
                router.push('/login');
            }
        });
        return () => unsubscribe();
    }, [auth, router]);
    
    const makePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !plan || !price || !currentUserProfile) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not process payment. User or plan not found.' });
            return;
        }

        setIsLoading(true);

        const numericPrice = parseInt(price.replace(/[^0-9]/g, ''), 10);

        try {
            // 1. Create Order
            const res = await fetch('/api/razorpay', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount: numericPrice }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to create Razorpay order.');
            }

            const { order } = await res.json();

            // 2. Open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                name: "Ultra Jodi Matrimony",
                description: `Subscription for ${plan} plan`,
                order_id: order.id,
                handler: async function (response: any) {
                    try {
                        // 3. Verify Payment
                        const verificationRes = await fetch('/api/razorpay', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        if (!verificationRes.ok) {
                            throw new Error('Payment verification failed.');
                        }

                        // 4. Update Database on successful verification
                        await updateUserPlan();
                        router.push('/browse');

                    } catch (verifyError: any) {
                        toast({ variant: 'destructive', title: 'Payment Verification Failed', description: verifyError.message });
                        setIsLoading(false);
                    }
                },
                prefill: {
                    name: currentUserProfile.fullName,
                    email: currentUserProfile.email,
                    contact: currentUserProfile.mobileNo,
                },
                theme: {
                    color: '#000435',
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                toast({
                    variant: 'destructive',
                    title: 'Payment Failed',
                    description: response.error.description,
                });
                setIsLoading(false);
            });
            rzp.open();

        } catch (error: any) {
            console.error("Payment error:", error);
            toast({ variant: 'destructive', title: 'Payment Error', description: error.message });
            setIsLoading(false);
        }
    };
    
    const updateUserPlan = async () => {
         if (!currentUser || !plan) return;

        let photoViewLimits: UserProfile['photoViewLimits'] = { basic: 0, silver: 0, gold: 0, diamond: 0 };
        let contactLimit: UserProfile['contactLimit'] = { basic: 0, silver: 0, gold: 0, diamond: 0 };
        let planDuration: Duration = {};
        let likesLimits = 0;

        switch (plan) {
            case 'Silver':
                photoViewLimits = { basic: 20, silver: 15, gold: 10, diamond: 0 };
                contactLimit = { basic: 20, silver: 15, gold: 10, diamond: 0 };
                planDuration = { months: 3 };
                likesLimits = 50;
                break;
            case 'Gold':
                photoViewLimits = { basic: 40, silver: 20, gold: 15, diamond: 5 };
                contactLimit = { basic: 40, silver: 20, gold: 15, diamond: 5 };
                planDuration = { months: 6 };
                likesLimits = 100;
                break;
            case 'Diamond':
                 photoViewLimits = { basic: 80, silver: 50, gold: 35, diamond: 25 };
                contactLimit = { basic: 80, silver: 50, gold: 35, diamond: 25 };
                planDuration = { months: 12 };
                likesLimits = 200;
                break;
        }

        const planStartDate = new Date();
        const planEndDate = add(planStartDate, planDuration);
        
        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, {
                usertype: plan,
                photoViewLimits: photoViewLimits,
                contactLimit: contactLimit,
                planStartDate: planStartDate,
                planEndDate: planEndDate,
                likesLimits: likesLimits,
            });
            
            toast({
                title: "Payment Successful!",
                description: `You have successfully subscribed to the ${plan} plan.`,
            });
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


    return (
        <>
            <Script
                id="razorpay-checkout-js"
                src="https://checkout.razorpay.com/v1/checkout.js"
            />
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="font-headline">Complete Your Purchase</CardTitle>
                    <CardDescription>You are subscribing to the <span className="font-bold text-primary">{plan}</span> plan for <span className="font-bold text-primary">{price}</span>.</CardDescription>
                </CardHeader>
                <form onSubmit={makePayment}>
                    <CardContent>
                        <p className='text-sm text-muted-foreground'>You will be redirected to Razorpay's secure payment page to complete your transaction.</p>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoading ? 'Processing...' : `Pay ${price}`}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </>
    )
}

export default function PaymentPage() {
    return (
        <AppLayout>
            <div className="flex justify-center items-start pt-8">
                <Suspense fallback={<div className='w-full max-w-lg'><Card><CardHeader><CardTitle>Loading...</CardTitle></CardHeader></Card></div>}>
                    <PaymentForm />
                </Suspense>
            </div>
        </AppLayout>
    );
}
