'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/explain-solution-steps.ts';
import '@/ai/flows/summarize-solution.ts';
import '@/ai/flows/classify-problem.ts';
import '@/ai/flows/numerical-integration-flow.ts';
import '@/ai/flows/linear-algebra-flow.ts';
import '@/ai/flows/solve-algebra.ts';
import '@/ai/flows/solve-calculus.ts';
