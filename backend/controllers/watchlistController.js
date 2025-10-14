import User from '../models/User.js';
import Movie from '../models/Movie.js';

export const addToWatchlist = async (req, res) => {
  try {
    const { movieId } = req.body;
    console.log('Adding to watchlist - movieId:', movieId);

    if (!movieId || isNaN(parseInt(movieId))) {
      return res.status(400).json({ message: 'Invalid movie ID' });
    }

    const user = await User.findById(req.user._id);

    // Check if already in watchlist
    const alreadyInWatchlist = user.watchlist.some(item => 
      item.tmdbId && item.tmdbId.toString() === movieId.toString()
    );
    
    if (alreadyInWatchlist) {
      return res.status(400).json({ message: 'Movie already in watchlist' });
    }

    // Add to watchlist with the correct structure
    user.watchlist.push({
      tmdbId: parseInt(movieId),
      addedAt: new Date()
    });
    
    await user.save();
    
    console.log('Watchlist after add:', user.watchlist);

    res.json({ 
      message: 'Added to watchlist', 
      watchlist: user.watchlist 
    });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const removeFromWatchlist = async (req, res) => {
  try {
    const { movieId } = req.params;
    console.log('Removing from watchlist - movieId:', movieId);

    const user = await User.findById(req.user._id);

    // Remove by tmdbId
    user.watchlist = user.watchlist.filter(item => 
      item.tmdbId.toString() !== movieId.toString()
    );
    
    await user.save();

    res.json({ 
      message: 'Removed from watchlist', 
      watchlist: user.watchlist 
    });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({ watchlist: user.watchlist });
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({ message: error.message });
  }
};