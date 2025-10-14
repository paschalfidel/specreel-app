import Review from '../models/Review.js';
import Movie from '../models/Movie.js';
import User from '../models/User.js';

export const addReview = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { rating, text } = req.body;
    
    console.log('Adding review for movie:', movieId, 'by user:', req.user._id);
    
    // Validate input
    if (!rating || rating < 0 || rating > 10) {
      return res.status(400).json({ message: 'Rating must be between 0 and 10' });
    }
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Review text is required' });
    }
    
    // Validate movie ID
    if (!movieId || isNaN(parseInt(movieId))) {
      return res.status(400).json({ message: 'Invalid movie ID' });
    }
    
    // Find or create movie in our database
    let movie = await Movie.findOne({ tmdbId: movieId });
    if (!movie) {
      // Create a basic movie record if it doesn't exist
      movie = new Movie({
        tmdbId: parseInt(movieId),
        title: `Movie ${movieId}`, // We'll update this later if needed
      });
      await movie.save();
      console.log('Created new movie record:', movie._id);
    }
    
    // Check for existing review
    const existingReview = await Review.findOne({
      user: req.user._id,
      movie: movie._id
    });
    
    if (existingReview) {
      return res.status(409).json({ message: 'You have already reviewed this movie' });
    }
    
    const review = new Review({
      user: req.user._id,
      movie: movie._id,
      rating: parseInt(rating),
      comment: text.trim()
    });
    
    await review.save();
    
    // Populate user info for response
    await review.populate('user', 'username avatar name');
    
    res.status(201).json({
      _id: review._id,
      rating: review.rating,
      text: review.comment,
      user: {
        name: review.user.username,
        avatar: review.user.avatar
      },
      createdAt: review.createdAt
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Failed to add review', error: error.message });
  }
};

export const getMovieReviews = async (req, res) => {
  try {
    const { movieId } = req.params;
    
    console.log('Getting reviews for movie:', movieId);
    
    // Validate movie ID
    if (!movieId || isNaN(parseInt(movieId))) {
      return res.status(400).json({ message: 'Invalid movie ID' });
    }
    
    // Find movie in our database
    const movie = await Movie.findOne({ tmdbId: movieId });
    if (!movie) {
      console.log('Movie not found in database, returning empty reviews');
      return res.json([]);
    }
    
    console.log('Found movie in database:', movie._id);
    
    const reviews = await Review.find({ movie: movie._id })
      .populate('user', 'username avatar name')
      .select('rating comment user createdAt')
      .sort({ createdAt: -1 });
    
    console.log('Found reviews:', reviews.length);
    
    const transformedReviews = reviews.map(review => ({
      _id: review._id,
      rating: review.rating,
      text: review.comment,
      user: {
        name: review.user.username,
        avatar: review.user.avatar
      },
      createdAt: review.createdAt
    }));
    
    res.json(transformedReviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    
    // Validate rating if provided
    if (rating !== undefined && (rating < 0 || rating > 10)) {
      return res.status(400).json({ message: 'Rating must be between 0 and 10' });
    }
    
    // Validate comment if provided
    if (comment !== undefined && comment.trim().length === 0) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }
    
    const review = await Review.findOne({ 
      _id: reviewId, 
      user: req.user._id 
    });
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    if (rating !== undefined) review.rating = parseInt(rating);
    if (comment !== undefined) review.comment = comment.trim();
    
    await review.save();
    
    res.json({
      message: 'Review updated successfully',
      review: {
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        updatedAt: review.updatedAt
      }
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Failed to update review', error: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findOneAndDelete({ 
      _id: reviewId, 
      user: req.user._id 
    });
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Failed to delete review', error: error.message });
  }
};