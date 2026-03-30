'use server';

/**
 * @fileOverview Classifies the type of a mathematical problem.
 *
 * - classifyProblem - A function that classifies a math problem.
 * - ClassifyProblemInput - The input type for the classifyProblem function.
 * - ClassifyProblemOutput - The return type for the classifyProblem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyProblemInputSchema = z.object({
  problem: z.string().describe('The mathematical problem to classify.'),
});
export type ClassifyProblemInput = z.infer<typeof ClassifyProblemInputSchema>;

const ClassifyProblemOutputSchema = z.object({
  type: z
    .enum(['calculus', 'matrix', 'plotting', 'algebra', 'arithmetic', 'numerical-integration', 'linear-algebra', 'unknown'])
    .describe('The classified type of the problem.'),
});
export type ClassifyProblemOutput = z.infer<typeof ClassifyProblemOutputSchema>;

export async function classifyProblem(input: ClassifyProblemInput): Promise<ClassifyProblemOutput> {
  return classifyProblemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classifyProblemPrompt',
  input: {schema: ClassifyProblemInputSchema},
  output: {schema: ClassifyProblemOutputSchema},
  prompt: `You are an expert in mathematics and need to classify the given problem.
The problem can be one of the following types: 'calculus', 'matrix', 'plotting', 'algebra', 'arithmetic', 'numerical-integration', 'linear-algebra', or 'unknown'.

- 'calculus' problems involve symbolic derivatives (d/dx), indefinite integrals (∫), limits (lim), etc.
- 'matrix' problems involve basic operations on grids of numbers (e.g., [[1, 2], [3, 4]] + [[5, 6], [7, 8]]).
- 'plotting' problems are explicit requests to plot a function, like "plot sin(x)".
- 'arithmetic' problems involve only numbers and basic operators (+, -, *, /) for direct calculation. Example: "1 + 1", "2 * (3+4)", "sqrt(16)".
- 'algebra' problems involve expressions with variables that need simplification or solving, like "2x + 3x" or "(a+b)^2". If an expression contains variables but is not calculus or linear algebra, it's algebra.
- 'numerical-integration' problems involve definite integrals that require approximation, often specified with bounds like ∫[0,1] x^2 dx.
- 'linear-algebra' problems involve advanced matrix operations like inverse (inv), transpose (T or transpose), determinants (det), or solving systems of linear equations (e.g., "2x + 3y = 8, 5x - y = 3").

If the problem involves simple matrix addition or multiplication, classify it as 'matrix'.
If the problem involves more advanced matrix operations or systems of equations, classify it as 'linear-algebra'.

If the problem doesn't fit any of these categories, classify it as 'unknown'.

Problem: {{{problem}}}
`,
});

const classifyProblemFlow = ai.defineFlow(
  {
    name: 'classifyProblemFlow',
    inputSchema: ClassifyProblemInputSchema,
    outputSchema: ClassifyProblemOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
