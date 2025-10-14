import { useEffect, useState } from 'react';
import api from '../api/api';
import MovieGrid from '../components/MovieGrid';

export default function Watchlist() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Loading watchlist...');
      const res = await api.get('/users/watchlist');
      console.log('Watchlist response:', res.data);
      
      const watchlistItems = res.data.watchlist || [];
      console.log('Watchlist items:', watchlistItems);
      
      // Filter valid items with tmdbId
      const validItems = watchlistItems.filter(item => 
        item && item.tmdbId && !isNaN(parseInt(item.tmdbId))
      );
      
      console.log('Valid watchlist items:', validItems);
      
      if (validItems.length > 0) {
        const moviePromises = validItems.map(item => 
          api.get(`/movies/details/${item.tmdbId}`)
            .then(r => {
              console.log(`Successfully loaded movie ${item.tmdbId}:`, r.data.title);
              return r.data;
            })
            .catch(err => {
              console.error(`Error loading movie ${item.tmdbId}:`, err);
              return null;
            })
        );
        
        const movieResults = await Promise.all(moviePromises);
        const validMovies = movieResults.filter(movie => movie !== null);
        setMovies(validMovies);
      } else {
        setMovies([]);
      }
    } catch (err) {
      console.error('Error loading watchlist:', err);
      setError('Failed to load watchlist. Please try again.');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadWatchlist(); 
  }, []);

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading your watchlist...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Your Watchlist</h1>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {movies.length > 0 ? (
        <MovieGrid movies={movies} />
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">Your watchlist is empty</div>
          <p className="text-gray-500">Start adding movies to your watchlist to see them here!</p>
        </div>
      )}
    </main>
  );
}