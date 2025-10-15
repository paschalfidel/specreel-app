import axios from 'axios';
import redis, { isRedisAvailable } from '../config/redis.js';

const TMDB_URL = 'https://api.themoviedb.org/3';

// Check if TMDB API key is configured
if (!process.env.TMDB_API_KEY) {
  console.error('❌ TMDB_API_KEY is not set in environment variables');
}

const tmdbApi = axios.create({
  baseURL: TMDB_URL,
  timeout: 10000,
  params: {
    api_key: process.env.TMDB_API_KEY
  }
});

export const fetchTrendingMovies = async () => {
  try {
    if (isRedisAvailable()) {
      const cacheKey = 'tmdb:trending';
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    const { data } = await tmdbApi.get('/trending/movie/week');
    
    if (isRedisAvailable()) {
      await redis.setex('tmdb:trending', 3600, JSON.stringify(data.results));
    }
    return data.results;
  } catch (error) {
    console.error('❌ TMDB Trending error:', error.response?.data || error.message);
    throw error;
  }
};

export const getMovieDetails = async (id) => {
  try {
    if (isRedisAvailable()) {
      const cacheKey = `tmdb:movie:${id}`;
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    const { data } = await tmdbApi.get(`/movie/${id}`, {
      params: {
        append_to_response: 'credits,videos,similar'
      }
    });

    if (isRedisAvailable()) {
      await redis.setex(`tmdb:movie:${id}`, 3600, JSON.stringify(data));
    }
    return data;
  } catch (error) {
    console.error(`❌ TMDB Details error for movie ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

export const searchMovies = async (query, page = 1, additionalParams = {}) => {
  try {
    if (isRedisAvailable()) {
      const cacheKey = `tmdb:search:${query}:${page}`;
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    const { data } = await tmdbApi.get('/search/movie', {
      params: { 
        query,
        page,
        ...additionalParams
      },
    });

    if (isRedisAvailable()) {
      await redis.setex(`tmdb:search:${query}:${page}`, 3600, JSON.stringify(data));
    }
    return data;
  } catch (error) {
    console.error('❌ TMDB Search error:', error.response?.data || error.message);
    throw error;
  }
};

export const discoverMovies = async (params = {}) => {
  try {
    if (isRedisAvailable()) {
      const cacheKey = `tmdb:discover:${JSON.stringify(params)}`;
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    const { data } = await tmdbApi.get('/discover/movie', {
      params: {
        ...params
      },
    });

    if (isRedisAvailable()) {
      await redis.setex(`tmdb:discover:${JSON.stringify(params)}`, 3600, JSON.stringify(data));
    }
    return data;
  } catch (error) {
    console.error('❌ TMDB Discover error:', error.response?.data || error.message);
    throw error;
  }
};