import MovieCard from './MovieCard';

export default function MovieGrid({ movies }) {
  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {movies.map(m => <MovieCard key={m.id} movie={m} />)}
    </div>
  );
}
