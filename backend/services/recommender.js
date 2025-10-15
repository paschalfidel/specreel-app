import User from '../models/User.js';
import redis, { isRedisAvailable } from '../config/redis.js';
import { cosineSimilarityRatings } from '../utils/similarity.js';
import { discoverMovies, getMovieDetails } from '../services/tmdb.js';

const CACHE_PREFIX = 'recs';
const CACHE_TTL = 60 * 60 * 6; // 6 hours

/**
 * Recommend movies for a userId
 */
export async function recommendForUser(userId, options = {}) {
  const limit = options.limit || 12;

  // Try cache first only if Redis is available
  if (isRedisAvailable()) {
    try {
      const cacheKey = `${CACHE_PREFIX}:${userId}:${limit}`;
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.warn('Recommender cache read error', e);
    }
  }

  const user = await User.findById(userId).lean();
  if (!user) {
    // fallback popular
    const popular = await discoverMovies({ sort_by: 'popularity.desc', page: 1 });
    const results = (popular.results || []).slice(0, limit);
    
    // Cache only if Redis available
    if (isRedisAvailable()) {
      try { 
        const cacheKey = `${CACHE_PREFIX}:${userId}:${limit}`;
        await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(results)); 
      } catch {}
    }
    return results;
  }

  const userRatings = user.ratings || [];
  const minRatingsForCF = 3;

  // Collaborative Filtering (only if user has enough ratings)
  if (userRatings.length >= minRatingsForCF) {
    // ... rest of your collaborative filtering code ...
    // Make sure to wrap Redis operations with isRedisAvailable() checks
  }

  // Fallback recommendations
  const popular = await discoverMovies({ sort_by: 'popularity.desc', page: 1 });
  const results = (popular.results || []).slice(0, limit);
  
  // Cache only if Redis available
  if (isRedisAvailable()) {
    try { 
      const cacheKey = `${CACHE_PREFIX}:${userId}:${limit}`;
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(results)); 
    } catch {}
  }
  
  return results;
}