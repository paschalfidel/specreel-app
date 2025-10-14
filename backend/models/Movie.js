import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  tmdbId: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  genre: [String],
  poster: String,
  overview: String,
  releaseDate: String,
  rating: Number,
  popularity: Number,
}, { timestamps: true });

const Movie = mongoose.model('Movie', movieSchema);
export default Movie;
