import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  rating: { type: Number, min: 0, max: 10 },
  comment: String,
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;