import { Link, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { removeToken, getUserFromToken } from '../utils/auth';
import { useEffect, useState } from 'react';

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = () => {
    const userData = getUserFromToken();
    console.log('Header - Current user:', userData);
    setUser(userData);
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
    
    // Listen for auth changes
    const handleAuthChange = () => {
      console.log('Auth change detected, updating header...');
      checkAuth();
    };
    
    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const logout = () => {
    console.log('Logging out...');
    removeToken();
    setUser(null);
    // Trigger auth change for other components
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  if (loading) {
    return (
      <header className="w-full bg-surface shadow-sm sticky top-0 z-50 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-gray-400">Loading...</div>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full bg-surface shadow-sm sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <motion.div 
            layoutId="logo" 
            className="text-primary font-bold text-2xl"
            whileHover={{ scale: 1.05 }}
          >
            SpecReel
          </motion.div>
          <div className="text-sm text-gray-300 hidden sm:block">
            Movies
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {/* Debug info - remove in production */}
          {user && (
            <div className="text-xs text-gray-400 hidden md:block">
              Logged in as: {user.username || user.email || 'User'}
            </div>
          )}

          <nav className="flex items-center gap-4 text-sm">
            <Link 
              to="/search" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Search
            </Link>
            {user ? (
              <>
                <Link 
                  to="/recommendations" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Recommendations
                </Link>
                <Link 
                  to="/watchlist" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Watchlist
                </Link>
                <Link 
                  to="/profile" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Profile
                </Link>
                <button 
                  onClick={logout} 
                  className="px-3 py-1 bg-primary rounded hover:bg-primary/90 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-3 py-1 bg-primary rounded hover:bg-primary/90 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}