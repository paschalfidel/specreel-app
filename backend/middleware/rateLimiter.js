import redis from '../config/redis.js';

export const rateLimiter = (limit = 100, windowSec = 60) => {
  return async (req, res, next) => {
    const key = `rate:${req.ip}`;
    const count = await redis.incr(key);

    if (count === 1) await redis.expire(key, windowSec);

    if (count > limit) {
      return res.status(429).json({ message: 'Too many requests. Try again later.' });
    }

    next();
  };
};