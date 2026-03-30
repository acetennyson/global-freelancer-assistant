'use server';

/**
 * @fileOverview Provides a conceptual approximation for definite integrals.
 *
 * - approximateIntegral - A function that approximates a definite integral.
 * - ApproximateIntegralInput - The input type for the approximateIntegral function.
 * - ApproximateIntegralOutput - The return type for the approximateIntegral function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ApproximateIntegralInputSchema = z.object({
  problem: z.string().describe('The definite integral to approximate, e.g., ∫[0,1] x^2 dx'),
});
export type ApproximateIntegralInput = z.infer<typeof ApproximateIntegralInputSchema>;

const ApproximateIntegralOutputSchema = z.object({
  approximation: z.string().describe('The numerical approximation of the integral.'),
  explanation: z.string().describe('An explanation of the approximation method used (e.g., Trapezoidal Rule, Simpson\'s Rule).'),
});
export type ApproximateIntegralOutput = z.infer<typeof ApproximateIntegralOutputSchema>;

export async function approximateIntegral(input: ApproximateIntegralInput): Promise<ApproximateIntegralOutput> {
  return approximateIntegralFlow(input);
}

const prompt = ai.definePrompt({
  name: 'approximateIntegralPrompt',
  input: {schema: ApproximateIntegralInputSchema},
  output: {schema: ApproximateIntegralOutputSchema},
  prompt: `You are a numerical analysis expert. Given a definite integral, provide a numerical approximation and explain the method used.
You can use methods like the Trapezoidal Rule or Simpson's Rule. Choose a reasonable number of intervals (e.g., n=10) for the approximation.

Problem: {{{problem}}}

First, calculate the approximate value of the integral.
Second, explain the steps of the approximation method you chose.
`,
});

const approximateIntegralFlow = ai.defineFlow(
  {
    name: 'approximateIntegralFlow',
    inputSchema: ApproximateIntegralInputSchema,
    outputSchema: ApproximateIntegralOutputSchema,
  },
  async input => {
    // For demonstration, we'll return a mock result for a known integral.
    // A real implementation would parse the function and bounds and perform the calculation.
    const cleanedProblem = input.problem.replace(/\s/g, '');
    if (cleanedProblem.includes('∫[0,1]x^2dx')) {
      const n = 10;
      const a = 0;
      const b = 1;
      const h = (b - a) / n;
      let sum = 0.5 * (a*a + b*b);
      for (let i = 1; i < n; i++) {
        const x = a + i * h;
        sum += x*x;
      }
      const approximation = (h * sum).toFixed(4);

      return {
        approximation: `≈ ${approximation}`,
        explanation: `Used the Trapezoidal Rule with n=10 intervals. The formula is (h/2) * [f(x₀) + 2f(x₁) + ... + 2f(xₙ-₁) + f(xₙ)]. With f(x) = x², a=0, b=1, and h=0.1, we calculated the sum of the areas of the trapezoids to approximate the area under the curve.`
      };
    }

    // Fallback to Genkit if not a hardcoded case
    const {output} = await prompt(input);
    return output!;
  }
);
