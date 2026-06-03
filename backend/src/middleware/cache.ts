import { Request, Response, NextFunction } from 'express';
import { createClient } from 'redis';

let REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Strip duplicate variable assignment prefix if present (e.g., "REDIS_URL=...")
if (REDIS_URL && REDIS_URL.startsWith('REDIS_URL=')) {
  REDIS_URL = REDIS_URL.substring('REDIS_URL='.length);
}

// Normalize REDIS_URL: prepend 'redis://' if protocol prefix is missing
if (REDIS_URL && !REDIS_URL.toLowerCase().startsWith('redis://') && !REDIS_URL.toLowerCase().startsWith('rediss://')) {
  REDIS_URL = `redis://${REDIS_URL}`;
}

export const redisClient = createClient({ url: REDIS_URL });

redisClient.on('error', (err) => console.error('[Redis] Client Error:', err));
redisClient.on('connect', () => console.log('[Redis] Connected successfully.'));

// Connect to Redis asynchronously
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('[Redis] Failed to connect to Redis server:', err);
  }
})();

/**
 * Cache middleware for Express.
 * Caches response by request URL.
 */
export const cacheMiddleware = (ttlSeconds = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    if (!redisClient.isOpen) {
      return next();
    }

    const key = `nyumbachain:cache:${req.originalUrl}`;
    try {
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        // Return cached JSON response
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('X-Cache', 'HIT');
        // Parse and send the cached JSON string directly
        return res.json(JSON.parse(cachedData));
      }

      // Override res.send to capture response body and cache it
      const originalSend = res.json;
      res.json = function (body) {
        res.json = originalSend; // restore original
        
        // Cache the body (only if status is 2xx success)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient.setEx(key, ttlSeconds, JSON.stringify(body)).catch((err) => {
            console.error('[Redis] Error saving to cache:', err);
          });
        }
        
        return originalSend.call(this, body);
      };

      res.setHeader('X-Cache', 'MISS');
      next();
    } catch (error) {
      console.error('[Redis] Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Invalidate all property search cache keys.
 */
export const invalidateSearchCache = async () => {
  if (!redisClient.isOpen) return;
  try {
    // Find keys matching pattern
    const pattern = 'nyumbachain:cache:/api/properties*';
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`[Redis] Cache invalidated for keys:`, keys);
    }
  } catch (err) {
    console.error('[Redis] Cache invalidation error:', err);
  }
};
