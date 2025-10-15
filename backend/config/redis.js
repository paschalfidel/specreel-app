import Redis from 'ioredis';

let redis;
let redisEnabled = false;

// Only create Redis connection if REDIS_URL is provided
if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected');
      redisEnabled = true;
    });

    redis.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
      redisEnabled = false;
    });

    // Test connection
    redis.connect().catch(err => {
      console.log('⚠️ Redis connection failed, continuing without cache');
      redisEnabled = false;
    });
  } catch (error) {
    console.log('⚠️ Redis initialization failed, continuing without cache');
    redisEnabled = false;
  }
} else {
  console.log('ℹ️ Redis disabled - no REDIS_URL provided');
  redisEnabled = false;
}

// Create a mock Redis client when Redis is not available
const mockRedis = {
  get: async () => null,
  setex: async () => 'OK',
  set: async () => 'OK',
  del: async () => 0,
  exists: async () => 0,
};

// Export either real Redis or mock based on availability
export default redisEnabled ? redis : mockRedis;

// Helper function to check if Redis is available
export const isRedisAvailable = () => redisEnabled;