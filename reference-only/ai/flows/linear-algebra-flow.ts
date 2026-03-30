'use server';

/**
 * @fileOverview Solves linear algebra problems like matrix operations and systems of equations.
 *
 * - solveLinearAlgebra - A function that solves linear algebra problems.
 * - SolveLinearAlgebraInput - The input type for the solveLinearAlgebra function.
 * - SolveLinearAlgebraOutput - The return type for the solveLinearAlgebra function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SolveLinearAlgebraInputSchema = z.object({
  problem: z.string().describe('The linear algebra problem to solve. e.g., "inv([[1, 2], [3, 4]])" or "2x + 3y = 8, 5x - y = 3"'),
});
export type SolveLinearAlgebraInput = z.infer<typeof SolveLinearAlgebraInputSchema>;

const SolveLinearAlgebraOutputSchema = z.object({
  solution: z.string().describe('The result of the operation, formatted as a string. For matrices, use JSON-like array notation. For systems of equations, provide the variable values.'),
  explanation: z.string().describe('A step-by-step explanation of how the solution was reached.'),
});
export type SolveLinearAlgebraOutput = z.infer<typeof SolveLinearAlgebraOutputSchema>;

export async function solveLinearAlgebra(input: SolveLinearAlgebraInput): Promise<SolveLinearAlgebraOutput> {
  return solveLinearAlgebraFlow(input);
}

const prompt = ai.definePrompt({
  name: 'solveLinearAlgebraPrompt',
  input: {schema: SolveLinearAlgebraInputSchema},
  output: {schema: SolveLinearAlgebraOutputSchema},
  prompt: `You are a linear algebra expert. Solve the given problem.

The problem could be an advanced matrix operation (like inverse, transpose, determinant) or a system of linear equations.

- For matrix operations, the result should be the resulting matrix in a clear, string-based format. For example, for an inverse, you might return a string like '[[-2, 1], [1.5, -0.5]]'.
- For a system of linear equations, the result should be the values of the variables, like "x = 1, y = 2".
- Provide a clear, step-by-step explanation for how you arrived at the solution.

Problem: {{{problem}}}
`,
});

const solveLinearAlgebraFlow = ai.defineFlow(
  {
    name: 'solveLinearAlgebraFlow',
    inputSchema: SolveLinearAlgebraInputSchema,
    outputSchema: SolveLinearAlgebraOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
