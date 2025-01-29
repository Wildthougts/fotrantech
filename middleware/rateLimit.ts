import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const ADMIN_RATE_LIMIT = 100; // requests per window
const WINDOW_SIZE = 60 * 60; // 1 hour in seconds

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export async function rateLimit(userId: string, action: string): Promise<{
  success: boolean;
  remaining: number;
}> {
  if (!userId) {
    return { success: false, remaining: 0 };
  }

  const key = `rate_limit:${action}:${userId}`;
  
  try {
    const [count] = await redis
      .pipeline()
      .incr(key)
      .expire(key, WINDOW_SIZE)
      .exec();

    const remaining = ADMIN_RATE_LIMIT - (count as number);
    
    return {
      success: remaining > 0,
      remaining: Math.max(0, remaining),
    };
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Fail open in case of Redis errors
    return { success: true, remaining: ADMIN_RATE_LIMIT };
  }
} 