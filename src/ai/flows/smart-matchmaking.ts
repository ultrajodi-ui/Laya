'use server';

/**
 * @fileOverview AI-driven matchmaking flow that suggests compatible matches based on user profile information and preferences.
 *
 * - smartMatchmaking - A function that handles the matchmaking process.
 * - SmartMatchmakingInput - The input type for the smartMatchmaking function.
 * - SmartMatchmakingOutput - The return type for the smartMatchmaking function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartMatchmakingInputSchema = z.object({
  profileDetails: z
    .string()
    .describe("User's profile details including interests, preferences, and personal information."),
  matchingCriteria: z
    .string()
    .describe('Criteria for matching users, such as age range, location, and shared interests.'),
});
export type SmartMatchmakingInput = z.infer<typeof SmartMatchmakingInputSchema>;

const SmartMatchmakingOutputSchema = z.object({
  suggestedMatches: z
    .string()
    .describe('A list of suggested user matches with a compatibility score for each match.'),
});
export type SmartMatchmakingOutput = z.infer<typeof SmartMatchmakingOutputSchema>;

export async function smartMatchmaking(input: SmartMatchmakingInput): Promise<SmartMatchmakingOutput> {
  return smartMatchmakingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartMatchmakingPrompt',
  input: {schema: SmartMatchmakingInputSchema},
  output: {schema: SmartMatchmakingOutputSchema},
  prompt: `You are an AI matchmaker. Analyze the user's profile details and matching criteria to suggest compatible matches.

User Profile Details: {{{profileDetails}}}
Matching Criteria: {{{matchingCriteria}}}

Based on this information, suggest a list of user matches along with a compatibility score (out of 100) for each match. Return the results as a single string.
`,
});

const smartMatchmakingFlow = ai.defineFlow(
  {
    name: 'smartMatchmakingFlow',
    inputSchema: SmartMatchmakingInputSchema,
    outputSchema: SmartMatchmakingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
