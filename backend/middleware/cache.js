// src/middleware/cache.js
import redis from '../config/redis.js'; // default export should be an ioredis client

/**
 * cacheMiddleware(prefix, ttlSeconds)
 * - prefix: string used for key namespace (e.g. 'movies', 'recs')
 * - ttlSeconds: time-to-live in seconds (default 3600 = 1 hour)
 *
 * Usage:
 *   router.get('/popular', cacheMiddleware('movies', 3600), controller.getPopular)
 */
export const cacheMiddleware = (prefix = 'cache', ttlSeconds = 3600) => {
  return async (req, res, next) => {
    try {
      const key = `${prefix}:${req.method}:${req.originalUrl}`;
      const cached = await redis.get(key);
      if (cached) {
        // send cached JSON
        res.setHeader('X-Cache', 'HIT');
        return res.json(JSON.parse(cached));
      }
      

      // Wrap res.json so we can cache the response body
      const originalJson = res.json.bind(res);
      res.json = async (body) => {
        try {
          // Only cache on 200 responses (or 2xx)
          if (res.statusCode >= 200 && res.statusCode < 300) {
            await redis.setex(key, ttlSeconds, JSON.stringify(body));
            res.setHeader('X-Cache', 'MISS');
          }
        } catch (err) {
          // log but don't block response
          console.error('Cache set error:', err);
        }
        return originalJson(body);
      };

      return next();
    } catch (err) {
      // If redis is down, continue without caching
      console.error('Cache middleware error:', err);
      return next();
    }
  };
};
