

'use client';

import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePageTitle } from "@/hooks/use-page-title";
import { cn } from "@/lib/utils";
import { Check, Star, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';


const planDetails = [
    {
        name: "Basic",
        price: "Free",
        features: [
            "Create profile",
            "Browse matches",
            "Send 10 Likes per Month",
            "View 3 Contact Numbers of Basic Profile Only",
            "x:Cannot watch all Protected Photos"
        ],
    },
    {
        name: "Silver",
        price: "₹700",
        duration: "/ 3 months",
        features: [
            "Watch 5 Gold Profile, 10 Silver Profile and 15 Basic Profile Contact Numbers",
            "Send 50 likes per Month",
            "Watch 10 Gold, 15 Silver, 20 Basic Profile User's Protected Photos",
            "Get better visibility",
        ],
    },
    {
        name: "Gold",
        price: "₹1700",
        duration: "/ 6 months",
        features: [
            "Watch 5 Diamond profile, 15 Gold Profile, 20 Silver Profile and 40 Basic Profile Contact numbers",
            "Send 100 likes per Month",
            "Watch 5 Diamond, 15 Gold, 20 Silver, 40 Basic Profile User’s Protected Photos",
            "Get better visibility",
            "Priority customer support"
        ],
        isPopular: true,
    },
    {
        name: "Diamond",
        price: "₹3700",
        duration: "/ 12 months",
        features: [
            "Watch 25 Diamond profile, 35 Gold Profile, 50 Silver Profile and 80 Basic Profile Contact Numbers",
            "Personalized matchmaking assistance",
            "Send 200 likes per Month",
            "Watch 25 Diamond, 35 Gold, 50 Silver, 80 Basic Profile User’s Protected Photos",
            "Get better visibility",
            "Priority customer support",
        ],
    }
]

function PricingCard({ plan, isCurrent }: { plan: typeof planDetails[0] & { isPopular?: boolean }, isCurrent: boolean }) {
    const router = useRouter();

    const handleChoosePlan = () => {
        if (isCurrent) return;
        router.push(`/payment?plan=${encodeURIComponent(plan.name)}&price=${encodeURIComponent(plan.price)}`);
    }

    return (
        <Card className={cn("flex flex-col", plan.isPopular && "border-primary shadow-lg")}>
            {plan.isPopular && (
                <div className="flex justify-center -mt-4">
                    <div className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                        <Star className="w-3.5 h-3.5" />
                        Most Popular
                    </div>
                </div>
            )}
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-4xl font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground">{plan.duration}</span></CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                <ul className="space-y-2 text-muted-foreground">
                    {plan.features.map(feature => {
                        const isNegative = feature.startsWith('x:');
                        const featureText = isNegative ? feature.substring(2) : feature;
                        return (
                            <li key={feature} className="flex items-start">
                                {isNegative ? (
                                    <X className="w-4 h-4 mr-2 mt-1 text-red-500 flex-shrink-0" />
                                ) : (
                                    <Check className="w-4 h-4 mr-2 mt-1 text-green-500 flex-shrink-0" />
                                )}
                                <span>{featureText}</span>
                            </li>
                        )
                    })}
                </ul>
            </CardContent>
            <div className="p-6 pt-0">
                <Button className="w-full" disabled={isCurrent} onClick={handleChoosePlan}>
                    {isCurrent ? "Current Plan" : "Choose Plan"}
                </Button>
            </div>
        </Card>
    );
}

function UpgradePageContent() {
    const { setPageTitle } = usePageTitle();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const auth = getAuth();
    
    useEffect(() => {
        setPageTitle("Upgrade Your Plan");
         const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUserProfile(docSnap.data() as UserProfile);
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [setPageTitle, auth]);

    const currentUserPlan = userProfile?.usertype || 'Basic';


    return (
        <>
            <div className="flex flex-col items-center gap-4 text-center">
                <h1 className="text-3xl font-headline font-bold" style={{ color: '#000435' }}>Find the Perfect Plan</h1>
                <p className="max-w-2xl text-muted-foreground">Unlock premium features to find your perfect match faster. Choose the plan that works best for you.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 mx-auto">
                {planDetails.map(plan => (
                    <PricingCard 
                        key={plan.name} 
                        plan={plan}
                        isCurrent={currentUserPlan === plan.name}
                    />
                ))}
            </div>
        </>
    );
}


export default function UpgradePage() {
    return (
        <AppLayout>
            <UpgradePageContent />
        </AppLayout>
    );
}
