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
    if (process.env.NODE_ENV === 'production') {
      console.error(`Please set ${envVar} in your Render environment variables`);
    }
  }
});

connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add this for form data
app.use(cors({ 
  origin: [
    'http://localhost:5173',
    'https://specreel-app.vercel.app',
    'https://specreel-app.vercel.app'
  ],
  credentials: true 
}));

// Passport middleware 
app.use(passport.initialize());

//Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/ratings', ratingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose && mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.json({ 
    status: 'OK', 
    message: 'SpecReel Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    version: '1.0.0'
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
    },
    environment: process.env.NODE_ENV || 'development'
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
📊 Health: https://specreel-app.onrender.com/api/health
  `);
});

export default app; // Export for testing