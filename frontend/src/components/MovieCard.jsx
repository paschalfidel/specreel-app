import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const IMG = import.meta.env.VITE_TMDB_IMAGE_BASE;

export default function MovieCard({ movie }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} className="bg-[#111] rounded-lg overflow-hidden shadow">
      <Link to={`/movie/${movie.id}`}>
        <img src={movie.poster_path ? `${IMG}${movie.poster_path}` : '/placeholder.png'} alt={movie.title}
             className="w-full h-64 object-cover"
             loading="lazy"
             onError={(e) => {
              e.target.src = '/placeholder.png';
              e.target.className = 'w-full h-64 object-cover bg-gray-800';
             }}
             />
        <div className="p-3">
          <h3 className="text-white font-semibold">{movie.title}</h3>
          <div className="text-sm text-gray-400 flex justify-between mt-2">
            <span>{movie.release_date?.slice(0,4) || '—'}</span>
            <span>⭐ {movie.vote_average?.toFixed(1) || '—'}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
