import { useState } from 'react';
import api from '../api/api';
import { getToken } from '../utils/auth';

export default function ReviewForm({ tmdbId, onPosted }) {
  const [rating, setRating] = useState(8);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    
    if (!getToken()) {
      alert('Please login to post a review');
      return;
    }

    try {
      setSubmitting(true);
      // FIXED ENDPOINT: /api/reviews/movie/:movieId
      await api.post(`/reviews/movie/${tmdbId}`, { rating, text });
      setText('');
      onPosted && onPosted();
    } catch (err) {
      console.error('Review submission error:', err);
      alert(err?.response?.data?.message || 'Failed to post review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 p-4 bg-surface rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
      
      <div className="mb-4">
        <label className="block text-sm text-gray-300 mb-2">Rating: {rating}/10</label>
        <input 
          type="range" 
          min="0" 
          max="10" 
          value={rating} 
          onChange={e => setRating(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm text-gray-300 mb-2">Review</label>
        <textarea 
          value={text} 
          onChange={e => setText(e.target.value)} 
          className="w-full p-3 rounded bg-[#0b0b0d] border border-gray-700 focus:border-primary transition-colors" 
          rows="4"
          placeholder="Share your thoughts about this movie..."
          required
        />
      </div>
      
      <button 
        type="submit"
        disabled={submitting || !text.trim()}
        className="px-6 py-2 bg-primary rounded disabled:opacity-50 hover:bg-primary/90 transition-colors"
      >
        {submitting ? 'Posting...' : 'Post Review'}
      </button>
    </form>
  );
}