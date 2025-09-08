
'use client';

import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePageTitle } from "@/hooks/use-page-title";
import { cn } from "@/lib/utils";
import { Check, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const plans = [
    {
        name: "Basic",
        price: "Free",
        features: [
            "Create profile",
            "Browse matches",
            "Send limited Likes",
            "View 3 Contact Numbers of Basic Profile Only"
        ],
        isCurrent: true,
    },
    {
        name: "Silver",
        price: "₹700",
        duration: "/ 3 months",
        features: [
            "View 10 Contacts Details",
            "Send 50 likes per Month",
            "Chat with matches",
            "Get better visibility",
        ],
    },
    {
        name: "Gold",
        price: "₹1700",
        duration: "/ 6 months",
        features: [
            "All Silver benefits",
            "Profile highlighted to matches",
            "Access to premium matches",
            "See who viewed your profile",
        ],
        isPopular: true,
    },
    {
        name: "Diamond",
        price: "₹3700",
        duration: "/ 12 months",
        features: [
            "All Gold benefits",
            "Personalized matchmaking assistance",
            "Profile boost once a month",
            "Priority customer support",
        ],
    }
]

function PricingCard({ plan }: { plan: typeof plans[0] }) {
    const router = useRouter();

    const handleChoosePlan = () => {
        if (plan.isCurrent) return;
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
                    {plan.features.map(feature => (
                        <li key={feature} className="flex items-start">
                            <Check className="w-4 h-4 mr-2 mt-1 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <div className="p-6 pt-0">
                <Button className="w-full" disabled={plan.isCurrent} onClick={handleChoosePlan}>
                    {plan.isCurrent ? "Current Plan" : "Choose Plan"}
                </Button>
            </div>
        </Card>
    );
}

function UpgradePageContent() {
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle("Upgrade Your Plan");
    }, [setPageTitle]);

    return (
        <>
            <div className="flex flex-col items-center gap-4 text-center">
                <h1 className="text-3xl font-headline font-bold">Find the Perfect Plan</h1>
                <p className="max-w-2xl text-muted-foreground">Unlock premium features to find your perfect match faster. Choose the plan that works best for you.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 max-w-6xl mx-auto">
                {plans.map(plan => (
                    <PricingCard key={plan.name} plan={plan} />
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
