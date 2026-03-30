/**
 * Flow Wrapper with API Key Rotation
 * 
 * Wraps AI flows with automatic error handling and API key rotation
 */

import { getApiKeyManager } from './api-key-manager';

/**
 * Wrap a flow function with automatic API key rotation on rate limit errors
 */
export async function withErrorHandling<T>(
  flowFunction: () => Promise<T>,
  flowName: string = 'Unknown Flow'
): Promise<T> {
  const manager = getApiKeyManager();
  const maxRetries = manager.getStats().totalKeys; // Retry up to the number of available keys

  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`[${flowName}] Attempt ${attempt + 1}/${maxRetries}`);
      const result = await flowFunction();
      
      // Success! Return the result
      if (attempt > 0) {
        console.log(`[${flowName}] ✅ Succeeded on attempt ${attempt + 1} after rotation`);
      }
      
      return result;
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      
      console.error(`[${flowName}] ❌ Error on attempt ${attempt + 1}: ${errorMessage}`);
      
      // Check if this is a rate limit or quota error
      if (manager.isRateLimitError(error)) {
        console.warn(`[${flowName}] 🔄 Rate limit detected, marking current key as failed and rotating...`);
        manager.markCurrentKeyAsFailed(error);
        
        // Log current stats
        const stats = manager.getStats();
        console.log(`[${flowName}] 📊 API Key Stats: ${stats.activeKeys}/${stats.totalKeys} keys active`);
        
        // If we still have retries left, continue
        if (attempt < maxRetries - 1) {
          console.log(`[${flowName}] ⏭️ Retrying with next API key...`);
          
          // Small delay before retry to avoid hammering the API
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
      } else {
        // Non-rate-limit error, throw immediately
        console.error(`[${flowName}] 💥 Non-rate-limit error, not retrying`);
        throw error;
      }
    }
  }

  // All retries exhausted
  const stats = manager.getStats();
  console.error(`[${flowName}] ❌ All ${maxRetries} API keys exhausted`);
  console.error(`[${flowName}] 📊 Final Stats:`, stats);
  
  throw new Error(
    `[${flowName}] Failed after ${maxRetries} attempts with different API keys. ` +
    `All keys may have hit rate limits. Last error: ${lastError?.message || lastError}`
  );
}

/**
 * Log API key manager statistics
 */
export function logApiKeyStats(): void {
  const manager = getApiKeyManager();
  const stats = manager.getStats();
  
  console.log('📊 API Key Manager Statistics:');
  console.log(`   Total Keys: ${stats.totalKeys}`);
  console.log(`   Active Keys: ${stats.activeKeys}`);
  console.log(`   Failed Keys: ${stats.failedKeys}`);
  console.log(`   Current Key Index: ${stats.currentKeyIndex + 1}`);
  console.log('   Key Usage:');
  stats.keyUsage.forEach(usage => {
    const status = usage.failed ? '❌ FAILED' : '✅ Active';
    console.log(`     - Key ${usage.index}: ${usage.usageCount} requests ${status}`);
  });
}
