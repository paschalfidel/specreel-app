// src/routes/movieRoutes.js
import express from 'express';
import { search, details, recommendations, healthCheck } from '../controllers/movieController.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// cached search/discover pages (cache TTL default 1 hour)
router.get('/search', cacheMiddleware('movies_search', 3600), search);
router.get('/details/:id', cacheMiddleware('movies_details', 3600), details);
router.get('/trending', cacheMiddleware('movies_trending', 3600), search);
router.get('/popular', cacheMiddleware('movies_popular', 3600), search);

// recommendations require auth — we do NOT cache per-route (recommender caches per user internally)
router.get('/recommendations', protect, recommendations);

// Health check
router.get('/health', healthCheck);

export default router;
