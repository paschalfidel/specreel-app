import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/api';
import MovieGrid from '../components/MovieGrid';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Use the working popular endpoint
      console.log('Loading popular movies...');
      const res = await api.get('/movies/popular', { params: { page } });
      
      if (res.data && res.data.results) {
        setMovies(res.data.results);
        console.log(`✅ Loaded ${res.data.results.length} popular movies`);
      } else {
        setError('No movies data received from server');
      }
    } catch (err) {
      console.error('Error loading movies:', err);
      setError(`Failed to load movies: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { 
    loadMovies(); 
  }, [loadMovies]);

  if (loading && movies.length === 0) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading popular movies...</div>
        </div>
      </main>
    );
  }

  if (loading && movies.length === 0) {
  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-64 mb-6"></div>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-gray-700 rounded-lg h-80"></div>
          ))}
        </div>
      </div>
    </main>
  );
}

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-6"
      >
        Popular Movies
      </motion.h1>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {movies.length > 0 ? (
        <>
          <MovieGrid movies={movies} />
          <div className="flex justify-between items-center mt-8">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1 || loading}
              className="px-6 py-2 bg-surface rounded disabled:opacity-50 hover:bg-surface/80 transition-colors"
            >
              Previous
            </button>
            <span className="text-gray-300">Page {page}</span>
            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={loading || movies.length === 0}
              className="px-6 py-2 bg-primary rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-400">
          No movies found
        </div>
      )}
    </main>
  );
}