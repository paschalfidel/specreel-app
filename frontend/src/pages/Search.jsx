import { useState, useEffect } from 'react';
import api from '../api/api';
import MovieGrid from '../components/MovieGrid';
import { useDebounce } from '../hooks/useDebounce';

export default function Search() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const debouncedQuery = useDebounce(query, 500);

  const searchMovies = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setMovies([]);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.get('/movies/search', { params: { q: searchQuery } });
      setMovies(res.data.results || []);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search movies. Please try again.');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedQuery) {
      searchMovies(debouncedQuery);
    } else {
      setMovies([]);
    }
  }, [debouncedQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    searchMovies(query);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Search Movies</h1>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            className="flex-1 p-3 rounded bg-[#0b0b0d] border border-gray-700 focus:border-primary transition-colors"
            placeholder="Search movies by title..."
          />
          <button 
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-primary rounded disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="text-lg">Searching movies...</div>
        </div>
      ) : (
        <>
          {query && (
            <div className="text-gray-400 mb-4">
              Found {movies.length} results for "{query}"
            </div>
          )}
          <MovieGrid movies={movies} />
        </>
      )}
    </main>
  );
}