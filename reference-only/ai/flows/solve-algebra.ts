'use server';

/**
 * @fileOverview Solves and simplifies algebraic expressions.
 *
 * - solveAlgebra - A function that solves algebraic problems.
 * - SolveAlgebraInput - The input type for the solveAlgebra function.
 * - SolveAlgebraOutput - The return type for the solveAlgebra function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SolveAlgebraInputSchema = z.object({
  problem: z.string().describe('The algebraic problem to solve, e.g., "2x + 3x" or "(a+b)^2"'),
});
export type SolveAlgebraInput = z.infer<typeof SolveAlgebraInputSchema>;

const SolveAlgebraOutputSchema = z.object({
  solution: z.string().describe('The simplified expression or the solution to the equation.'),
  explanation: z.string().describe('A step-by-step explanation of how the solution was reached.'),
});
export type SolveAlgebraOutput = z.infer<typeof SolveAlgebraOutputSchema>;

export async function solveAlgebra(input: SolveAlgebraInput): Promise<SolveAlgebraOutput> {
  return solveAlgebraFlow(input);
}

const prompt = ai.definePrompt({
  name: 'solveAlgebraPrompt',
  input: {schema: SolveAlgebraInputSchema},
  output: {schema: SolveAlgebraOutputSchema},
  prompt: `You are an algebra expert. Solve or simplify the given algebraic expression.

- Simplify expressions by combining like terms, expanding, or factoring.
- If it's an equation, solve for the variable(s).
- Provide a clear, step-by-step explanation for how you arrived at the solution.

Problem: {{{problem}}}
`,
});

const solveAlgebraFlow = ai.defineFlow(
  {
    name: 'solveAlgebraFlow',
    inputSchema: SolveAlgebraInputSchema,
    outputSchema: SolveAlgebraOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
