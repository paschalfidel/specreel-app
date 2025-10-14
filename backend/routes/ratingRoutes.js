import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { addRating, getUserRatings, deleteRating } from '../controllers/ratingController.js';

const router = express.Router();

router.post('/', protect, addRating);
router.get('/my-ratings', protect, getUserRatings);
router.delete('/:movieId', protect, deleteRating);

export default router;