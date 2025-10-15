import redis, { isRedisAvailable } from '../config/redis.js';

/**
 * cacheMiddleware(prefix, ttlSeconds)
 * - Works with or without Redis
 * - Without Redis, it just passes through requests
 */
export const cacheMiddleware = (prefix = 'cache', ttlSeconds = 3600) => {
  return async (req, res, next) => {
    // If Redis is not available, skip caching entirely
    if (!isRedisAvailable()) {
      return next();
    }

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
      // If redis fails, continue without caching
      console.error('Cache middleware error:', err);
      return next();
    }
  };
};