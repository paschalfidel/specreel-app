import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from './config/passport.js';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import watchlistRoutes from './routes/watchlistRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'TMDB_API_KEY'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add this for form data
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
  credentials: true 
}));

// Passport middleware 
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/ratings', ratingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SpecReel Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🎬 SpecReel API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users', 
      movies: '/api/movies',
      reviews: '/api/reviews'
    }
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    message: 'Check the API documentation at /'
  });
});

// Error handler (should be last middleware)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`
🚀 SpecReel Server Started!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📊 Health: http://localhost:${PORT}/api/health
  `);
});

export default app; // Export for testing