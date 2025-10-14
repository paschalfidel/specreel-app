import axios from 'axios';
import redis from '../config/redis.js';

const TMDB_URL = 'https://api.themoviedb.org/3';

export const fetchTrendingMovies = async () => {
  const cacheKey = 'tmdb:trending';
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const { data } = await axios.get(`${TMDB_URL}/trending/movie/week`, {
    params: { api_key: process.env.TMDB_API_KEY },
  });

  await redis.setex(cacheKey, 3600, JSON.stringify(data.results));
  return data.results;
};

export const getMovieDetails = async (id) => {
  const cacheKey = `tmdb:movie:${id}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const { data } = await axios.get(`${TMDB_URL}/movie/${id}`, {
    params: { api_key: process.env.TMDB_API_KEY },
  });

  await redis.setex(cacheKey, 3600, JSON.stringify(data));
  return data;
};

export const searchMovies = async (query, page = 1, additionalParams = {}) => {
  const cacheKey = `tmdb:search:${query}:${page}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const { data } = await axios.get(`${TMDB_URL}/search/movie`, {
    params: { 
      api_key: process.env.TMDB_API_KEY,
      query,
      page,
      ...additionalParams
    },
  });

  await redis.setex(cacheKey, 3600, JSON.stringify(data));
  return data;
};

export const discoverMovies = async (params = {}) => {
  const cacheKey = `tmdb:discover:${JSON.stringify(params)}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const { data } = await axios.get(`${TMDB_URL}/discover/movie`, {
    params: {
      api_key: process.env.TMDB_API_KEY,
      ...params
    },
  });

  await redis.setex(cacheKey, 3600, JSON.stringify(data));
  return data;
};

