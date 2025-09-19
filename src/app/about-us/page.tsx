
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { Heart, Users, Target } from "lucide-react";

export default function AboutUsPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        <section className="text-center">
            <h1 className="text-4xl font-headline font-bold tracking-tight">About Ultra Jodi</h1>
            <p className="mt-4 text-xl text-muted-foreground">More than a Match, a true Connection</p>
        </section>

        <section>
          <Image 
            src="https://picsum.photos/1200/400"
            alt="Happy couple"
            data-ai-hint="happy couple"
            width={1200}
            height={400}
            className="rounded-lg object-cover w-full"
          />
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><Heart className="text-primary" /> Our Story</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                Founded on the principle that everyone deserves a loving and compatible partner, Ultra Jodi was created to revolutionize the search for a life partner. We were tired of the superficial connections and endless swiping that dominate modern dating. We envisioned a platform where technology could serve a deeper purpose: to understand the nuances of personality, values, and life goals to bring people together in meaningful, lasting relationships.
              </p>
              <p>
                Our journey began with a simple idea—to blend the rich traditions of Indian matchmaking with the power of artificial intelligence. We believe that a successful marriage is built on a foundation of genuine compatibility, and our mission is to help you build that foundation.
              </p>
            </CardContent>
          </Card>
        </section>
        
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Target className="text-primary" /> Our Mission</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    Our mission is to foster genuine connections by providing a safe, trusted, and innovative platform. We are committed to helping our members find not just a match, but a soulmate. We strive to offer a personalized and supportive experience throughout your journey to finding 'the one'.
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Users className="text-primary" /> Our Approach</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    We combine cutting-edge AI with a deep understanding of cultural and personal preferences. Our smart matchmaking algorithm goes beyond basic filters to analyze compatibility on a deeper level, ensuring that the matches you receive are not just possibilities, but potential life partners.
                </CardContent>
            </Card>
        </div>

      </div>
    </AppLayout>
  )
}
