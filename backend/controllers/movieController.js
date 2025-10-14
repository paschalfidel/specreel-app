// src/controllers/movieController.js
import { searchMovies, getMovieDetails, discoverMovies } from '../services/tmdb.js';
import { recommendForUser } from '../services/recommender.js';

export const search = async (req, res, next) => {
  const { q, page = 1, year, genre, sort_by, rating_gte } = req.query;
  const params = { page, include_adult: false };
  
  if (year) params.primary_release_year = year;
  if (genre) params.with_genres = genre;
  if (sort_by) params.sort_by = sort_by;
  if (rating_gte) params['vote_average.gte'] = rating_gte;
  
  try {
    let data;
    if (q) {
      data = await searchMovies(q, page, params);
    } else {
      data = await discoverMovies(params);
    }
    
    // Ensure consistent response format
    return res.json({
      results: data.results || [],
      page: data.page || page,
      total_pages: data.total_pages || 1,
      total_results: data.total_results || 0
    });
  } catch (err) {
    console.error('Search error:', err);
    return res.status(500).json({ 
      message: 'Failed to fetch movies',
      error: err.message 
    });
  }
};

export const details = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate movie ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid movie ID' });
    }
    
    const data = await getMovieDetails(id);
    
    if (!data) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    return res.json(data);
  } catch (err) {
    console.error('Details error:', err);
    
    if (err.response?.status === 404) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    return res.status(500).json({ 
      message: 'Failed to fetch movie details',
      error: err.message 
    });
  }
};

export const recommendations = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const recs = await recommendForUser(req.user._id.toString(), { limit: 12 });
    
    return res.json({ 
      results: recs || [],
      message: recs.length === 0 ? 'No recommendations available yet. Rate more movies!' : ''
    });
  } catch (err) {
    console.error('Recommendations error:', err);
    return res.status(500).json({ 
      message: 'Failed to get recommendations',
      error: err.message 
    });
  }
};

export const healthCheck = async (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
};