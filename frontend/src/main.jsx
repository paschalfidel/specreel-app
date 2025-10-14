import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Environment validation
if (!import.meta.env.VITE_API_URL) {
  console.warn('VITE_API_URL is not set. Using default: http://localhost:5001/api');
}

if (!import.meta.env.VITE_TMDB_IMAGE_BASE) {
  console.warn('VITE_TMDB_IMAGE_BASE is not set. Using default TMDB URL');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
)
