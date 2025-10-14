import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getProfile, updateProfile, toggleFavorite } from '../controllers/userController.js';
import ratingRoutes from './ratingRoutes.js';
import watchlistRoutes from './watchlistRoutes.js'

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/favorites', protect, toggleFavorite);
router.use('/ratings', ratingRoutes);
router.use('/watchlist', watchlistRoutes)

export default router;
