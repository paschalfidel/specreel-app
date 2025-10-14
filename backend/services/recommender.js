// src/services/recommender.js
import User from '../models/User.js';
import redis from '../config/redis.js';
import { cosineSimilarityRatings } from '../utils/similarity.js';
import { discoverMovies, getMovieDetails } from '../services/tmdb.js';

const CACHE_PREFIX = 'recs';
const CACHE_TTL = 60 * 60 * 6; // 6 hours

/**
 * Recommend movies for a userId
 * @param {String} userId - Mongo user _id string
 * @param {Object} options - { limit: Number }
 * @returns {Array} array of movie objects (TMDB details or TMDB-lite objects)
 */
export async function recommendForUser(userId, options = {}) {
  const limit = options.limit || 12;
  const cacheKey = `${CACHE_PREFIX}:${userId}:${limit}`;

  // Try cache first
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.warn('Recommender cache read error', e);
  }

  const user = await User.findById(userId).lean();
  if (!user) {
    // fallback popular
    const popular = await discoverMovies({ sort_by: 'popularity.desc', page: 1 });
    const results = (popular.results || []).slice(0, limit);
    try { await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(results)); } catch {}
    return results;
  }

  const userRatings = user.ratings || [];
  const minRatingsForCF = 3;

  // Collaborative Filtering
  if (userRatings.length >= minRatingsForCF) {
    // find other users who have ratings
    const others = await User.find({ _id: { $ne: userId }, 'ratings.0': { $exists: true } }).lean();

    const scoreMap = new Map(); // tmdbId -> aggregated weighted score
    const simSumMap = new Map();

    for (const other of others) {
      const sim = cosineSimilarityRatings(userRatings, other.ratings || []);
      if (!sim || sim <= 0) continue;

      // accumulate weighted scores
      for (const r of other.ratings || []) {
        const id = Number(r.tmdbId);
        // skip movies user already rated
        if (userRatings.some(ur => Number(ur.tmdbId) === id)) continue;
        const prev = scoreMap.get(id) || 0;
        const prevSim = simSumMap.get(id) || 0;
        scoreMap.set(id, prev + sim * Number(r.rating));
        simSumMap.set(id, prevSim + Math.abs(sim));
      }
    }

    // build scored array
    const scored = [];
    for (const [tmdbId, weightedSum] of scoreMap.entries()) {
      const simSum = simSumMap.get(tmdbId) || 1;
      scored.push({ tmdbId, score: weightedSum / simSum });
    }

    scored.sort((a, b) => b.score - a.score);
    const topIds = scored.slice(0, limit).map(s => s.tmdbId);

    // fetch TMDB details for topIds (TMDB service should cache details)
    const movies = await Promise.all(
      topIds.map(async (id) => {
        try {
          return await getMovieDetails(id);
        } catch (e) {
          // fallback: return minimal object
          return { id, tmdbId: id };
        }
      })
    );

    const filtered = movies.filter(Boolean).slice(0, limit);

    try { await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(filtered)); } catch (e) { console.warn('Cache set failed', e); }
    return filtered;
  }

  // Fallback 1: genre-based using user.preferences.favoriteGenres
  if (user.preferences?.favoriteGenres?.length) {
    const params = {
      with_genres: user.preferences.favoriteGenres.join(','),
      sort_by: 'popularity.desc',
      page: 1
    };
    const data = await discoverMovies(params);
    const results = (data.results || []).slice(0, limit);
    try { await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(results)); } catch {}
    return results;
  }

  // Fallback 2: global popular
  const popular = await discoverMovies({ sort_by: 'popularity.desc', page: 1 });
  const results = (popular.results || []).slice(0, limit);
  try { await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(results)); } catch {}
  return results;
}
