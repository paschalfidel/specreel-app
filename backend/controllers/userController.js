import User from '../models/User.js';
import Movie from '../models/Movie.js';

export const getProfile = async (req, res) => {
  res.json(req.user);
};

export const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.username = req.body.username || user.username;
  user.email = req.body.email || user.email;
  if (req.body.password) user.password = req.body.password;

  const updated = await user.save();
  res.json({
    _id: updated._id,
    username: updated.username,
    email: updated.email,
  });
};

export const toggleFavorite = async (req, res) => {
  const { movieId } = req.body;
  const user = await User.findById(req.user._id);

  if (user.favorites.includes(movieId)) {
    user.favorites.pull(movieId);
  } else {
    user.favorites.push(movieId);
  }

  await user.save();
  res.json({ favorites: user.favorites });
};
