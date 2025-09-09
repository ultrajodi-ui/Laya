'use server';

/**
 * @fileOverview AI-driven matchmaking flow that suggests compatible matches based on user profile information and preferences.
 *
 * - smartMatchmaking - A function that handles the matchmaking process.
 * - SmartMatchmakingInput - The input type for the smartMatchmaking function.
 * - SmartMatchmakingOutput - The return type for the smartMatchmaking function.
 */

import {ai} from '@/ai/genkit';
import { UserProfile } from '@/lib/types';
import {z} from 'genkit';

const UserProfileSchema = z.object({
  id: z.string(),
  fullName: z.string().optional(),
  age: z.number().optional(),
  gender: z.enum(['male', 'female']).optional(),
  occupation: z.string().optional(),
  education: z.string().optional(),
  religion: z.string().optional(),
  subCaste: z.string().optional(),
  location: z.string().optional(),
  interests: z.array(z.string()).optional(),
  lookingFor: z.string().optional(),
  bio: z.string().optional(),
});

const SmartMatchmakingInputSchema = z.object({
  currentUser: UserProfileSchema.describe("The profile of the user seeking matches."),
  candidates: z.array(UserProfileSchema).describe("A list of potential candidates to match against."),
   matchingCriteria: z
    .string()
    .describe('Specific criteria or preferences the user has for a partner.'),
});
export type SmartMatchmakingInput = z.infer<typeof SmartMatchmakingInputSchema>;

const SmartMatchmakingOutputSchema = z.object({
  suggestedMatches: z
    .array(UserProfileSchema.extend({
        compatibilityScore: z.number().describe("A score from 0 to 100 indicating the compatibility between the user and the suggested match."),
        compatibilityReason: z.string().describe("A brief explanation of why this match is considered compatible."),
    }))
    .describe('A list of suggested user matches with a compatibility score and reason for each match.'),
});
export type SmartMatchmakingOutput = z.infer<typeof SmartMatchmakingOutputSchema>;

export async function smartMatchmaking(input: SmartMatchmakingInput): Promise<SmartMatchmakingOutput> {
  return smartMatchmakingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartMatchmakingPrompt',
  input: {schema: SmartMatchmakingInputSchema},
  output: {schema: SmartMatchmakingOutputSchema},
  prompt: `You are an expert AI matchmaker for a matrimonial service. Your task is to find the most suitable partners for a user from a list of candidates.

Analyze the user's profile and their stated preferences. Then, for each candidate, evaluate their compatibility based on all available profile information (age, location, occupation, interests, religion, sub-caste, what they are looking for, etc.).

Return a list of the top 3-5 most compatible matches. For each match, you MUST provide a compatibility score (from 0 to 100) and a concise, one-sentence reason for why they are a good match.

Current User's Profile:
\`\`\`json
{{{json currentUser}}}
\`\`\`

User's Specific Criteria:
"{{{matchingCriteria}}}"

List of Potential Candidates:
\`\`\`json
{{{json candidates}}}
\`\`\`
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
