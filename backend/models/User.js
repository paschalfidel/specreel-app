import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: { type: String, required: [true, 'Username is required'], trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: [true, 'Password is required'], minlength: 6 },
  avatar: { type: String, default: '' },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  watchlist: [{ tmdbId: Number, addedAt: { type: Date, default: Date.now} }],
  ratings: [{
    tmdbId: Number,
    rating: Number
  }],
  preferences: {
    favoriteGenres: [String]
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
