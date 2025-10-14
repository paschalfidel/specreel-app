import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Search from './pages/Search';
import MovieDetails from './pages/MovieDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Watchlist from './pages/Watchlist';
import Recommendations from './pages/Recommendations';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <div className="min-h-screen text-white">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
        <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
        <Route path="*" element={<div className="p-6">404 - Not Found</div>} />
      </Routes>
    </div>
  );
}
