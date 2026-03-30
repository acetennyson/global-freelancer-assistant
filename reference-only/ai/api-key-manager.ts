/**
 * API Key Manager for Google Gemini
 * 
 * Manages multiple API keys with rotation and fallback logic
 * to handle rate limits and quotas.
 */

export class ApiKeyManager {
  private apiKeys: string[];
  private currentIndex: number = 0;
  private failedKeys: Set<string> = new Set();
  private keyUsageCount: Map<string, number> = new Map();
  private keyLastUsed: Map<string, number> = new Map();
  private readonly COOLDOWN_PERIOD = 60000; // 1 minute cooldown for failed keys

  constructor(apiKeys: string | string[]) {
    // Support both single key (string) and multiple keys (array or comma-separated)
    if (typeof apiKeys === 'string') {
      // Check if it's a comma-separated list
      this.apiKeys = apiKeys.includes(',') 
        ? apiKeys.split(',').map(key => key.trim()).filter(key => key.length > 0)
        : [apiKeys];
    } else {
      this.apiKeys = apiKeys.filter(key => key && key.trim().length > 0);
    }

    if (this.apiKeys.length === 0) {
      throw new Error('At least one valid API key must be provided');
    }

    // Initialize usage tracking
    this.apiKeys.forEach(key => {
      this.keyUsageCount.set(key, 0);
    });

    console.log(`[ApiKeyManager] Initialized with ${this.apiKeys.length} API key(s)`);
  }

  /**
   * Get the current API key to use
   */
  getCurrentKey(): string {
    // Clean up failed keys that have cooled down
    this.cleanupFailedKeys();

    // If all keys have failed, reset and try again
    if (this.failedKeys.size >= this.apiKeys.length) {
      console.warn('[ApiKeyManager] All keys failed, resetting failure tracking');
      this.failedKeys.clear();
    }

    // Find the next available key
    let attempts = 0;
    while (attempts < this.apiKeys.length) {
      const key = this.apiKeys[this.currentIndex];
      
      if (!this.failedKeys.has(key)) {
        // Update usage tracking
        this.keyUsageCount.set(key, (this.keyUsageCount.get(key) || 0) + 1);
        this.keyLastUsed.set(key, Date.now());
        
        console.log(`[ApiKeyManager] Using key ${this.currentIndex + 1}/${this.apiKeys.length} (Used ${this.keyUsageCount.get(key)} times)`);
        return key;
      }

      // Move to next key
      this.currentIndex = (this.currentIndex + 1) % this.apiKeys.length;
      attempts++;
    }

    // Fallback: return the first key even if marked as failed
    console.error('[ApiKeyManager] All keys marked as failed, using first key as fallback');
    return this.apiKeys[0];
  }

  /**
   * Rotate to the next API key
   */
  rotateKey(): string {
    this.currentIndex = (this.currentIndex + 1) % this.apiKeys.length;
    return this.getCurrentKey();
  }

  /**
   * Mark the current key as failed (rate limited or quota exceeded)
   */
  markCurrentKeyAsFailed(error?: any): void {
    const currentKey = this.apiKeys[this.currentIndex];
    this.failedKeys.add(currentKey);
    
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    console.error(`[ApiKeyManager] Key ${this.currentIndex + 1} marked as failed: ${errorMessage}`);
    
    // Automatically rotate to next key
    this.rotateKey();
  }

  /**
   * Check if an error indicates rate limiting or quota exceeded
   */
  isRateLimitError(error: any): boolean {
    const errorString = error?.message?.toLowerCase() || error?.toString()?.toLowerCase() || '';
    
    return (
      errorString.includes('rate limit') ||
      errorString.includes('quota exceeded') ||
      errorString.includes('too many requests') ||
      errorString.includes('429') ||
      errorString.includes('resource exhausted') ||
      errorString.includes('quota_exceeded')
    );
  }

  /**
   * Remove failed keys that have been cooling down
   */
  private cleanupFailedKeys(): void {
    const now = Date.now();
    const keysToRemove: string[] = [];

    this.failedKeys.forEach(key => {
      const lastUsed = this.keyLastUsed.get(key) || 0;
      if (now - lastUsed > this.COOLDOWN_PERIOD) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach(key => {
      this.failedKeys.delete(key);
      console.log(`[ApiKeyManager] Key restored after cooldown`);
    });
  }

  /**
   * Get statistics about API key usage
   */
  getStats(): {
    totalKeys: number;
    activeKeys: number;
    failedKeys: number;
    currentKeyIndex: number;
    keyUsage: Array<{ index: number; usageCount: number; failed: boolean }>;
  } {
    return {
      totalKeys: this.apiKeys.length,
      activeKeys: this.apiKeys.length - this.failedKeys.size,
      failedKeys: this.failedKeys.size,
      currentKeyIndex: this.currentIndex,
      keyUsage: this.apiKeys.map((key, index) => ({
        index: index + 1,
        usageCount: this.keyUsageCount.get(key) || 0,
        failed: this.failedKeys.has(key),
      })),
    };
  }

  /**
   * Reset all failure tracking (useful for testing)
   */
  reset(): void {
    this.failedKeys.clear();
    this.currentIndex = 0;
    console.log('[ApiKeyManager] Reset all failure tracking');
  }
}

/**
 * Singleton instance for the API key manager
 */
let apiKeyManagerInstance: ApiKeyManager | null = null;

/**
 * Get or create the API key manager instance
 */
export function getApiKeyManager(): ApiKeyManager {
  if (!apiKeyManagerInstance) {
    const apiKeys = process.env.GOOGLE_GENAI_API_KEY || '';
    
    if (!apiKeys) {
      throw new Error('GOOGLE_GENAI_API_KEY environment variable is not set');
    }
    
    apiKeyManagerInstance = new ApiKeyManager(apiKeys);
  }
  
  return apiKeyManagerInstance;
}

/**
 * Execute a function with automatic API key rotation on rate limit errors
 */
export async function withApiKeyRotation<T>(
  fn: (apiKey: string) => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  const manager = getApiKeyManager();
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const apiKey = manager.getCurrentKey();
      const result = await fn(apiKey);
      return result;
    } catch (error) {
      lastError = error;
      
      // Check if this is a rate limit error
      if (manager.isRateLimitError(error)) {
        console.warn(`[ApiKeyRotation] Rate limit error on attempt ${attempt + 1}/${maxRetries}, rotating key...`);
        manager.markCurrentKeyAsFailed(error);
        
        // Continue to next attempt with rotated key
        if (attempt < maxRetries - 1) {
          continue;
        }
      }
      
      // If not a rate limit error, or we've exhausted retries, throw immediately
      throw error;
    }
  }

  // All retries exhausted
  throw new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError?.message || lastError}`);
}
