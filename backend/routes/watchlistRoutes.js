import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { addToWatchlist, removeFromWatchlist, getWatchlist } from '../controllers/watchlistController.js';

const router = express.Router();

router.post('/', protect, addToWatchlist);
router.delete('/:movieId', protect, removeFromWatchlist);
router.get('/', protect, getWatchlist);

export default router;