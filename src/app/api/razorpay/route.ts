
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize razorpay
const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
    try {
        const { amount } = await req.json();

        if (!amount || typeof amount !== 'number') {
            return NextResponse.json({ error: 'Amount is required and must be a number.' }, { status: 400 });
        }

        const options = {
            amount: amount * 100, // amount in the smallest currency unit (paisa for INR)
            currency: "INR",
            receipt: `receipt_order_${new Date().getTime()}`,
        };
        
        const order = await razorpay.orders.create(options);

        return NextResponse.json({ order }, { status: 200 });

    } catch (error: any) {
        console.error('Razorpay order creation error:', error);
        return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
    }
}


export async function PUT(req: NextRequest) {
     try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
             return NextResponse.json({ error: 'Missing payment verification details.' }, { status: 400 });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Here you would typically find the order in your database and update its status.
            // For now, we just confirm verification.
             return NextResponse.json({ success: true, message: "Payment verified successfully" }, { status: 200 });
        } else {
             return NextResponse.json({ error: "Payment verification failed. Signature mismatch." }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Razorpay verification error:', error);
        return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
    }
}
