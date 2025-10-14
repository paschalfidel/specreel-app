# Environment Variables Guide

## Backend Variables

### `JWT_SECRET`
- **Purpose**: Used to sign JSON Web Tokens for authentication
- **Format**: Long random string (min 32 characters)
- **Generate**: Use `openssl rand -base64 32` or a password manager
- **Security**: NEVER share or commit this value

### `MONGODB_URI`
- **Purpose**: MongoDB connection string
- **Format**: `mongodb+srv://username:password@cluster.mongodb.net/database`
- **Get from**: MongoDB Atlas dashboard

### `TMDB_API_KEY`
- **Purpose**: API key for The Movie Database
- **Get from**: https://www.themoviedb.org/settings/api
- **Free tier**: 1,000 requests per day

## Frontend Variables

### `VITE_API_URL`
- **Development**: `http://localhost:5001/api`
- **Production**: `https://your-backend.onrender.com/api`

### `VITE_TMDB_IMAGE_BASE`
- **Value**: `https://image.tmdb.org/t/p/w500`
- **Purpose**: Base URL for movie poster images