'use client';

import { useState } from 'react';
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2 } from "lucide-react";
import { smartMatchmaking, SmartMatchmakingInput } from '@/ai/flows/smart-matchmaking';
import type { UserProfile } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

// Mock current user profile
const currentUserProfile = {
  profileDetails: "32 year old male from New York. I'm a software developer who loves hiking, trying new food, and playing guitar. I'm looking for someone who is adventurous, kind, and has a good sense of humor.",
};

const parseMatches = (text: string): Partial<UserProfile>[] => {
  if (!text) return [];
  // This is a simple parser. A more robust implementation would be needed for production.
  const matches = text.split('\n').filter(line => line.trim() !== '');
  return matches.map((match, index) => {
    const nameMatch = match.match(/^(.*?)\s\(/);
    const scoreMatch = match.match(/\((\d+)\/100\)/);
    return {
      id: `match-${index}`,
      name: nameMatch ? nameMatch[1] : `Match ${index + 1}`,
      compatibilityScore: scoreMatch ? parseInt(scoreMatch[1], 10) : 0,
      bio: match,
      imageUrl: `https://picsum.photos/seed/match${index}/400/400`
    };
  });
};


export default function MatchesPage() {
    const [matchingCriteria, setMatchingCriteria] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestedMatches, setSuggestedMatches] = useState<Partial<UserProfile>[]>([]);
    
    const handleFindMatches = async () => {
        setIsLoading(true);
        setSuggestedMatches([]);
        
        const input: SmartMatchmakingInput = {
            profileDetails: currentUserProfile.profileDetails,
            matchingCriteria: matchingCriteria || "Someone who is adventurous, funny, and enjoys the outdoors.",
        };

        try {
            const result = await smartMatchmaking(input);
            if (result.suggestedMatches) {
              setSuggestedMatches(parseMatches(result.suggestedMatches));
            }
        } catch (error) {
            console.error("Error finding matches:", error);
            // Here you could use a toast to show an error to the user
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Wand2 className="text-primary"/> AI Smart Matchmaking</CardTitle>
                        <CardDescription>Describe your ideal partner, and our AI will find the most compatible matches for you.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea 
                            placeholder="e.g., 'I'm looking for someone who is passionate about art, loves to travel, and has a quiet confidence...'"
                            value={matchingCriteria}
                            onChange={(e) => setMatchingCriteria(e.target.value)}
                            rows={4}
                        />
                        <Button onClick={handleFindMatches} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            {isLoading ? 'Finding Matches...' : 'Find My Matches'}
                        </Button>
                    </CardContent>
                </Card>

                {isLoading && (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                             <Card key={i} className="animate-pulse">
                                <div className="w-full h-64 bg-muted rounded-t-lg"></div>
                                <CardContent className="p-4 space-y-2">
                                     <div className="h-6 w-1/2 bg-muted rounded"></div>
                                     <div className="h-4 w-full bg-muted rounded"></div>
                                     <div className="h-4 w-3/4 bg-muted rounded"></div>
                                </CardContent>
                             </Card>
                        ))}
                     </div>
                )}

                {suggestedMatches.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-headline mb-4">Your Top Matches</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {suggestedMatches.map((match) => (
                                <Card key={match.id} className="overflow-hidden">
                                     <Image
                                        src={match.imageUrl!}
                                        alt={match.name!}
                                        width={400}
                                        height={400}
                                        data-ai-hint="person portrait"
                                        className="w-full h-64 object-cover"
                                    />
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-xl font-headline font-semibold">{match.name}</h3>
                                            <Badge variant="default" className="bg-primary/80">{match.compatibilityScore}%</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-3 mt-2">{match.bio}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
