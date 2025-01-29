import { NextResponse } from 'next/server';

const ADMIN_RATE_LIMIT = 100; // requests per window
const WINDOW_SIZE = 60 * 60 * 1000; // 1 hour in milliseconds

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup function to remove expired entries
function cleanup() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanup, 5 * 60 * 1000);

export async function rateLimit(userId: string, action: string): Promise<{
  success: boolean;
  remaining: number;
}> {
  if (!userId) {
    return { success: false, remaining: 0 };
  }

  const key = `rate_limit:${action}:${userId}`;
  const now = Date.now();
  
  try {
    // Clean up expired entry if exists
    const existingEntry = rateLimitStore.get(key);
    if (existingEntry && now >= existingEntry.resetTime) {
      rateLimitStore.delete(key);
    }

    // Get or create entry
    const entry = rateLimitStore.get(key) || {
      count: 0,
      resetTime: now + WINDOW_SIZE
    };

    // Increment count
    entry.count += 1;
    rateLimitStore.set(key, entry);

    const remaining = ADMIN_RATE_LIMIT - entry.count;
    
    return {
      success: remaining > 0,
      remaining: Math.max(0, remaining),
    };
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Fail open in case of errors
    return { success: true, remaining: ADMIN_RATE_LIMIT };
  }
} 