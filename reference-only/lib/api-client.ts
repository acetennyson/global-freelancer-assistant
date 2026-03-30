import axios from 'axios';

// Get API base URL from environment variable or default to empty string for relative URLs
// For production/native apps, ALWAYS use the deployed Vercel backend
// For local dev, use relative URLs (empty string)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? '' // Local dev uses relative URLs
    : 'https://step2solve.vercel.app' // Production/Native uses Vercel
);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout for AI operations
});

// API client functions for all AI flows
export const api = {
  solveAlgebra: async (problem: string) => {
    const response = await apiClient.post('/api/ai/solve-algebra', { problem });
    return response.data;
  },

  solveCalculus: async (problem: string) => {
    const response = await apiClient.post('/api/ai/solve-calculus', { problem });
    return response.data;
  },

  solveLinearAlgebra: async (problem: string) => {
    const response = await apiClient.post('/api/ai/solve-linear-algebra', { problem });
    return response.data;
  },

  approximateIntegral: async (problem: string) => {
    const response = await apiClient.post('/api/ai/approximate-integral', { problem });
    return response.data;
  },

  classifyProblem: async (problem: string) => {
    const response = await apiClient.post('/api/ai/classify-problem', { problem });
    return response.data;
  },

  summarizeSolution: async (calculation: string, solution: string) => {
    const response = await apiClient.post('/api/ai/summarize-solution', { 
      calculation, 
      solution 
    });
    return response.data;
  },
};

export default apiClient;
