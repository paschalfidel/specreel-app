const Redis = require('ioredis-mock');

// Create a mock Redis instance
const redis = new Redis();

redis.on('connect', () => console.log('✅ Mock Redis connected'));
redis.on('error', (err) => console.error('❌ Mock Redis error:', err));

module.exports = redis;
