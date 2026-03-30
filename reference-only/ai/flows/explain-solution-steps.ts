'use server';

/**
 * @fileOverview Explains the steps required to solve a math problem.
 *
 * - explainSolutionSteps - A function that explains the steps to solve a math problem.
 * - ExplainSolutionStepsInput - The input type for the explainSolutionSteps function.
 * - ExplainSolutionStepsOutput - The return type for the explainSolutionSteps function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainSolutionStepsInputSchema = z.object({
  problem: z.string().describe('The mathematical problem to solve.'),
  solution: z.string().describe('The solution to the mathematical problem.'),
});
export type ExplainSolutionStepsInput = z.infer<typeof ExplainSolutionStepsInputSchema>;

const ExplainSolutionStepsOutputSchema = z.object({
  explanation: z.string().describe('The step-by-step explanation of the solution.'),
});
export type ExplainSolutionStepsOutput = z.infer<typeof ExplainSolutionStepsOutputSchema>;

export async function explainSolutionSteps(input: ExplainSolutionStepsInput): Promise<ExplainSolutionStepsOutput> {
  return explainSolutionStepsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainSolutionStepsPrompt',
  input: {schema: ExplainSolutionStepsInputSchema},
  output: {schema: ExplainSolutionStepsOutputSchema},
  prompt: `You are an expert math teacher. A student has solved the following problem, and you need to provide a step-by-step explanation of the solution.

Problem: {{{problem}}}
Solution: {{{solution}}}

Explanation:`,
});

const explainSolutionStepsFlow = ai.defineFlow(
  {
    name: 'explainSolutionStepsFlow',
    inputSchema: ExplainSolutionStepsInputSchema,
    outputSchema: ExplainSolutionStepsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
