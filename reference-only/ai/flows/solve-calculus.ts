'use server';

/**
 * @fileOverview Solves calculus problems like derivatives, integrals, and limits.
 *
 * - solveCalculus - A function that solves calculus problems.
 * - SolveCalculusInput - The input type for the solveCalculus function.
 * - SolveCalculusOutput - The return type for the solveCalculus function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SolveCalculusInputSchema = z.object({
  problem: z.string().describe('The calculus problem to solve. e.g., "d/dx(x^3)" or "∫x^2 dx"'),
});
export type SolveCalculusInput = z.infer<typeof SolveCalculusInputSchema>;

const SolveCalculusOutputSchema = z.object({
  solution: z.string().describe('The result of the calculus operation.'),
  explanation: z.string().describe('A step-by-step explanation of how the solution was reached.'),
});
export type SolveCalculusOutput = z.infer<typeof SolveCalculusOutputSchema>;

export async function solveCalculus(input: SolveCalculusInput): Promise<SolveCalculusOutput> {
  return solveCalculusFlow(input);
}

const prompt = ai.definePrompt({
  name: 'solveCalculusPrompt',
  input: {schema: SolveCalculusInputSchema},
  output: {schema: SolveCalculusOutputSchema},
  prompt: `You are a calculus expert. Solve the given problem, which could be a derivative, an integral, or a limit.
- For derivatives (d/dx, ∂), find the derivative of the expression.
- For indefinite integrals (∫), find the integral and include the constant of integration "+ C".
- For limits (lim), evaluate the limit.
- Provide a clear, step-by-step explanation for how you arrived at the solution.

Problem: {{{problem}}}
`,
});

const solveCalculusFlow = ai.defineFlow(
  {
    name: 'solveCalculusFlow',
    inputSchema: SolveCalculusInputSchema,
    outputSchema: SolveCalculusOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
