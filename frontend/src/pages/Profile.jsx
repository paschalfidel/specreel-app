import { useEffect, useState } from 'react';
import api from '../api/api';
import { getUserFromToken } from '../utils/auth';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', avatar: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const checkAuth = () => {
    const userData = getUserFromToken();
    console.log('Profile - User from token:', userData);
    setUser(userData);
    return userData; // Return the user data
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/users/profile');
      console.log('Profile data:', res.data);
      setProfile(res.data);
      setForm({ 
        username: res.data.username, 
        email: res.data.email, 
        avatar: res.data.avatar || '' 
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = checkAuth(); // Get initial user data
    
    // Listen for auth changes
    const handleAuthChange = () => {
      console.log('Profile: Auth change detected');
      const updatedUser = checkAuth(); // Get updated user data
      if (updatedUser) {
        loadProfile();
      }
    };
    
    window.addEventListener('authChange', handleAuthChange);
    
    if (userData) {
      loadProfile();
    } else {
      setLoading(false);
    }

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []); // Remove user from dependencies to avoid infinite loop

  const save = async () => {
    try {
      setError('');
      const res = await api.put('/users/profile', form);
      setProfile(res.data);
      setEditing(false);
      
      // Update local user state
      const userData = getUserFromToken();
      setUser(userData);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  const cancelEdit = () => {
    if (profile) {
      setForm({ 
        username: profile.username, 
        email: profile.email, 
        avatar: profile.avatar || '' 
      });
    }
    setEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading profile...</div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
          <p className="text-gray-400 mb-6">You need to be logged in to view your profile.</p>
          <a href="/login" className="px-6 py-2 bg-primary rounded hover:bg-primary/90 transition-colors">
            Go to Login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded mb-6">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
        <img 
          src={profile?.avatar || '/placeholder-avatar.jpg'} 
          alt="avatar" 
          className="w-32 h-32 rounded-full object-cover"
        />
        <div className="flex-1">
          {!editing ? (
            <>
              <h2 className="text-2xl font-bold">{profile?.username || 'User'}</h2>
              <div className="text-gray-400 mt-1">{profile?.email}</div>
              <button 
                onClick={() => setEditing(true)} 
                className="mt-4 px-4 py-2 bg-primary rounded hover:bg-primary/90 transition-colors"
              >
                Edit Profile
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Username</label>
                <input 
                  value={form.username} 
                  onChange={e => setForm({ ...form, username: e.target.value })} 
                  className="w-full p-2 rounded bg-surface border border-gray-700 focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Email</label>
                <input 
                  value={form.email} 
                  onChange={e => setForm({ ...form, email: e.target.value })} 
                  className="w-full p-2 rounded bg-surface border border-gray-700 focus:border-primary transition-colors"
                  type="email"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Avatar URL</label>
                <input 
                  value={form.avatar} 
                  onChange={e => setForm({ ...form, avatar: e.target.value })} 
                  className="w-full p-2 rounded bg-surface border border-gray-700 focus:border-primary transition-colors"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={save} 
                  className="px-4 py-2 bg-primary rounded hover:bg-primary/90 transition-colors"
                >
                  Save Changes
                </button>
                <button 
                  onClick={cancelEdit} 
                  className="px-4 py-2 bg-surface rounded hover:bg-surface/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-surface rounded-lg text-center">
          <div className="text-2xl font-bold text-primary">{profile?.watchlist?.length || 0}</div>
          <div className="text-gray-400">Watchlist</div>
        </div>
        <div className="p-4 bg-surface rounded-lg text-center">
          <div className="text-2xl font-bold text-primary">{profile?.ratings?.length || 0}</div>
          <div className="text-gray-400">Ratings</div>
        </div>
        <div className="p-4 bg-surface rounded-lg text-center">
          <div className="text-2xl font-bold text-primary">{profile?.favorites?.length || 0}</div>
          <div className="text-gray-400">Favorites</div>
        </div>
      </div>

      {/* Debug Info - Remove in production */}
      <details className="mt-8">
        <summary className="cursor-pointer text-gray-400">Debug Info</summary>
        <div className="mt-2 p-4 bg-surface rounded-lg">
          <pre className="text-xs">{JSON.stringify({ user, profile }, null, 2)}</pre>
        </div>
      </details>
    </main>
  );
}