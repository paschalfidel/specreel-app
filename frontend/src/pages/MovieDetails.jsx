import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import MovieGrid from '../components/MovieGrid';
import ReviewForm from '../components/ReviewForm';
import RatingStars from '../components/RatingStars';
import { getToken } from '../utils/auth';

const IMG_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE;

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [error, setError] = useState('');

  const loadMovieData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load movie details
      const movieRes = await api.get(`/movies/details/${id}`);
      setMovie(movieRes.data);
      
      // Load reviews - FIXED ENDPOINT
      try {
        const reviewsRes = await api.get(`/reviews/movie/${id}`);
        setReviews(reviewsRes.data || []);
      } catch (reviewErr) {
        // If 404, it means no reviews yet or endpoint not available
        if (reviewErr.response?.status === 404) {
          console.log('No reviews found or reviews endpoint not available');
          setReviews([]);
        } else {
          console.error('Error loading reviews:', reviewErr);
          setReviews([]);
        }
      }
      
      // Check watchlist status if logged in
      if (getToken()) {
        try {
          const userRes = await api.get('/users/profile');
          const watchlistItems = userRes.data.watchlist || [];
          
          // Check if current movie is in watchlist
          const inList = watchlistItems.some(item => {
            if (item && item.tmdbId) {
              return item.tmdbId.toString() === id.toString();
            }
            return false;
          });
        
          setInWatchlist(inList);
        } catch (watchlistErr) {
          console.log('Watchlist check failed:', watchlistErr);
          setInWatchlist(false);
        }
      }
    } catch (err) {
      console.error('Error loading movie details:', err);
      setError('Failed to load movie details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const toggleWatchlist = async () => {
    if (!getToken()) {
      alert('Please login to manage your watchlist');
      return;
    }

    try {
      console.log('Toggling watchlist for movie ID:', id);

      if (inWatchlist) {
        await api.delete(`/users/watchlist/${id}`);
        setInWatchlist(false);
        console.log('Removed from watchlist');
      } else {
        await api.post('/users/watchlist', { movieId: id });
        setInWatchlist(true);
        console.log('Added to watchlist');
      }

      // Trigger auth change to update other components
      window.dispatchEvent(new Event('authChange'));
    } catch (err) {
      console.error('Error updating watchlist:', err);
      console.error('Error response:', err.response?.data);
      alert('Failed to update watchlist: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReviewPosted = () => {
    // Reload reviews after a new review is posted
    loadMovieData();
  };

  useEffect(() => { 
    loadMovieData(); 
  }, [loadMovieData]);

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading movie details...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded text-center">
          {error}
        </div>
      </main>
    );
  }

  if (!movie) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="text-center">Movie not found</div>
      </main>
    );
  }

  const trailer = movie.videos?.results?.find(v => 
    v.type === 'Trailer' && v.site === 'YouTube'
  );

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Poster */}
        <div className="w-full md:w-1/3">
          <img 
            src={movie.poster_path ? `${IMG_BASE}${movie.poster_path}` : '/placeholder-movie.jpg'} 
            alt={movie.title} 
            className="w-full rounded-lg shadow-lg"
          />
          
          <button 
            onClick={toggleWatchlist}
            className={`w-full mt-4 py-2 rounded font-semibold transition-colors ${
              inWatchlist 
                ? 'bg-yellow-500 hover:bg-yellow-600' 
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          </button>
        </div>

        {/* Details */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{movie.title}</h1>
          {movie.tagline && (
            <div className="text-gray-300 mt-2 italic">"{movie.tagline}"</div>
          )}
          
          <div className="mt-3 text-sm text-gray-400">
            <span>{movie.release_date}</span> • 
            <span> {movie.runtime} min</span> • 
            <span> ⭐ {movie.vote_average?.toFixed(1)}</span>
          </div>

          <p className="mt-4 text-gray-200 leading-relaxed">{movie.overview}</p>

          {/* Genres */}
          {movie.genres?.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {movie.genres.map(genre => (
                  <span key={genre.id} className="px-3 py-1 bg-surface rounded-full text-sm">
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cast */}
          {movie.credits?.cast?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-3">Cast</h3>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {movie.credits.cast.slice(0, 8).map(actor => (
                  <div key={actor.id} className="flex-shrink-0 w-24 text-center">
                    <img 
                      src={actor.profile_path ? `${IMG_BASE}${actor.profile_path}` : '/placeholder-actor.jpg'} 
                      alt={actor.name} 
                      className="w-24 h-32 object-cover rounded-lg mb-2"
                    />
                    <div className="text-sm font-medium">{actor.name}</div>
                    <div className="text-xs text-gray-400">{actor.character}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trailer */}
          {trailer && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-3">Trailer</h3>
              <div className="aspect-video">
                <iframe 
                  title="trailer"
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Reviews</h2>
        
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review._id} className="p-4 bg-surface rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={review.user?.avatar || '/placeholder-avatar.jpg'} 
                    alt={review.user?.name} 
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-semibold">{review.user?.name}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <RatingStars value={review.rating} />
              </div>
              <p className="text-gray-200">{review.text}</p>
            </div>
          ))}
          
          {reviews.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No reviews yet. Be the first to review!
            </div>
          )}
        </div>

        <ReviewForm tmdbId={id} onPosted={handleReviewPosted} />
      </section>

      {/* Similar Movies */}
      {movie.similar?.results?.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Similar Movies</h2>
          <MovieGrid movies={movie.similar.results} />
        </section>
      )}
    </main>
  );
}