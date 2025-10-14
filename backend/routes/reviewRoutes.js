import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getMovieReviews, addReview, updateReview, deleteReview } from '../controllers/reviewController.js';

const router = express.Router();

router.get('/movie/:movieId', getMovieReviews);
router.post('/movie/:movieId', protect, addReview);
router.put('/:reviewId', protect, updateReview);
router.delete('/:reviewId', protect, deleteReview);

export default router;