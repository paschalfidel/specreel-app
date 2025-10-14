import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('specreel_token');
    if (token) {
       config.headers.Authorization = `Bearer ${token}`;
    }
   return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('specreel_token');
      window.dispatchEvent(new Event('authChange'));
      // Don't redirect immediately, let components handle it
      console.log('Authentication failed, token removed');
    }
    
    if (error.response?.status === 429) {
      alert('Too many requests. Please wait a moment before trying again.');
    }
    
    if (error.response?.status >= 500) {
      alert('Server error. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
