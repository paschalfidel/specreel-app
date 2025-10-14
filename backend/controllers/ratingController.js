import Review from '../models/Review.js';
import Movie from '../models/Movie.js';
import User from '../models/User.js';

export const addRating = async (req, res) => {
  try {
    const { movieId, rating, comment } = req.body;
    const userId = req.user._id;

    // Validate rating
    if (rating < 0 || rating > 10) {
      return res.status(400).json({ message: 'Rating must be between 0 and 10' });
    }

    // Find or create movie in our database
    let movie = await Movie.findOne({ tmdbId: movieId });
    if (!movie) {
      // You might want to fetch from TMDB and create the movie
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Update or create review
    let review = await Review.findOne({ user: userId, movie: movie._id });
    
    if (review) {
      review.rating = rating;
      review.comment = comment || review.comment;
    } else {
      review = new Review({
        user: userId,
        movie: movie._id,
        rating,
        comment
      });
    }

    await review.save();

    // Update user's ratings array
    await User.findByIdAndUpdate(userId, {
      $pull: { ratings: { tmdbId: movieId } }
    });
    
    await User.findByIdAndUpdate(userId, {
      $push: { ratings: { tmdbId: movieId, rating } }
    });

    res.status(200).json({
      message: 'Rating added successfully',
      review: {
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        movieId: movie.tmdbId
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserRatings = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('movie', 'tmdbId title poster')
      .select('rating comment movie')
      .sort({ updatedAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRating = async (req, res) => {
  try {
    const { movieId } = req.params;
    
    const movie = await Movie.findOne({ tmdbId: movieId });
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    await Review.findOneAndDelete({ 
      user: req.user._id, 
      movie: movie._id 
    });

    // Remove from user's ratings array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { ratings: { tmdbId: movieId } }
    });

    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};