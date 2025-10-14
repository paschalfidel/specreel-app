import React, { useEffect, useState } from 'react';
import api from '../api/api';
import MovieGrid from '../components/MovieGrid';

export default function Recommendations() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Loading recommendations...');
      const res = await api.get('/movies/recommendations');
      console.log('Recommendations response:', res.data);
      
      if (res.data && res.data.results) {
        setMovies(res.data.results);
        console.log(`✅ Loaded ${res.data.results.length} recommendations`);
      } else {
        setMovies([]);
      }
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError(`Failed to load recommendations: ${err.response?.data?.message || err.message}`);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadRecommendations(); 
  }, []);

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading your recommendations...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Your Recommendations</h1>

      {error && (
        <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-200 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {movies.length > 0 ? (
        <MovieGrid movies={movies} />
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">No recommendations yet</div>
          <p className="text-gray-500 mb-6">
            Rate more movies to get personalized recommendations!
          </p>
          <a 
            href="/search" 
            className="px-6 py-2 bg-primary rounded hover:bg-primary/90 transition-colors"
          >
            Browse Movies
          </a>
        </div>
      )}
    </main>
  );
}