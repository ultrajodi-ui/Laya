
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

function PaymentForm() {
    const searchParams = useSearchParams();
    const plan = searchParams.get('plan');
    const price = searchParams.get('price');
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate payment processing
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Payment Successful!",
                description: `You have successfully subscribed to the ${plan} plan.`,
            });
        }, 2000);
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="font-headline">Complete Your Purchase</CardTitle>
                <CardDescription>You are subscribing to the <span className="font-bold text-primary">{plan}</span> plan for <span className="font-bold text-primary">{price}</span>.</CardDescription>
            </CardHeader>
            <form onSubmit={handlePayment}>
                <CardContent className="space-y-4">
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
            <div className="flex justify-center items-center h-full">
                <Suspense fallback={<div>Loading...</div>}>
                    <PaymentForm />
                </Suspense>
            </div>
        </AppLayout>
    );
}

