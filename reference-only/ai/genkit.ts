import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import { getApiKeyManager } from './api-key-manager';

// Get the current API key from the manager
const apiKeyManager = getApiKeyManager();
const currentApiKey = apiKeyManager.getCurrentKey();

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: currentApiKey,
    })
  ],
  model: 'googleai/gemini-2.5-flash',
});

// Export the API key manager for use in flows
export { apiKeyManager };
