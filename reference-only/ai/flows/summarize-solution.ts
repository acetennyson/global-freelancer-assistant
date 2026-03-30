'use server';

/**
 * @fileOverview Summarizes the solution for complex calculations.
 *
 * - summarizeSolution - A function that summarizes the solution.
 * - SummarizeSolutionInput - The input type for the summarizeSolution function.
 * - SummarizeSolutionOutput - The return type for the summarizeSolution function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSolutionInputSchema = z.object({
  calculation: z.string().describe('The calculation performed.'),
  solution: z.string().describe('The detailed solution of the calculation.'),
});
export type SummarizeSolutionInput = z.infer<typeof SummarizeSolutionInputSchema>;

const SummarizeSolutionOutputSchema = z.object({
  summary: z.string().describe('A short summary of the solution.'),
});
export type SummarizeSolutionOutput = z.infer<typeof SummarizeSolutionOutputSchema>;

export async function summarizeSolution(input: SummarizeSolutionInput): Promise<SummarizeSolutionOutput> {
  return summarizeSolutionFlow(input);
}

const summarizeSolutionPrompt = ai.definePrompt({
  name: 'summarizeSolutionPrompt',
  input: {schema: SummarizeSolutionInputSchema},
  output: {schema: SummarizeSolutionOutputSchema},
  prompt: `You are an expert in simplifying complex calculations and providing easy-to-understand summaries.

  Calculation: {{{calculation}}}
  Solution: {{{solution}}}

  Please provide a concise summary of the solution.`,
});

const summarizeSolutionFlow = ai.defineFlow(
  {
    name: 'summarizeSolutionFlow',
    inputSchema: SummarizeSolutionInputSchema,
    outputSchema: SummarizeSolutionOutputSchema,
  },
  async input => {
    const {output} = await summarizeSolutionPrompt(input);
    return output!;
  }
);
