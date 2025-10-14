import React, { useState } from 'react';

export default function AuthForm({ onSubmit, initial = { username: '', email: '', password: '' }, mode = 'login' }) {
  const [form, setForm] = useState(initial);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (mode === 'register') {
      if (!form.username.trim()) {
        newErrors.username = 'Username is required';
      }
      if (!form.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(form.email)) {
        newErrors.email = 'Email is invalid';
      }
      if (!form.password) {
        newErrors.password = 'Password is required';
      } else if (form.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (form.password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else {
      // Login mode
      if (!form.email.trim()) {
        newErrors.email = 'Email is required';
      }
      if (!form.password) {
        newErrors.password = 'Password is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(form);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-[#0f0f10] rounded-lg border border-gray-800">
      {mode === 'register' && (
        <div className="mb-4">
          <label className="block text-sm text-gray-300 mb-2">Username</label>
          <input 
            name="username" 
            onChange={handleChange} 
            value={form.username} 
            className={`w-full p-3 rounded bg-[#0b0b0d] border ${
              errors.username ? 'border-red-500' : 'border-gray-700'
            } focus:border-primary transition-colors`}
            placeholder="Enter your username"
          />
          {errors.username && <div className="text-red-400 text-sm mt-1">{errors.username}</div>}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm text-gray-300 mb-2">Email</label>
        <input 
          name="email" 
          type="email"
          onChange={handleChange} 
          value={form.email} 
          className={`w-full p-3 rounded bg-[#0b0b0d] border ${
            errors.email ? 'border-red-500' : 'border-gray-700'
          } focus:border-primary transition-colors`}
          placeholder="Enter your email"
        />
        {errors.email && <div className="text-red-400 text-sm mt-1">{errors.email}</div>}
      </div>
      
      <div className="mb-4">
        <label className="block text-sm text-gray-300 mb-2">Password</label>
        <div className="relative">
          <input 
            type={showPassword ? "text" : "password"} 
            name="password" 
            onChange={handleChange} 
            value={form.password} 
            className={`w-full p-3 rounded bg-[#0b0b0d] border ${
              errors.password ? 'border-red-500' : 'border-gray-700'
            } focus:border-primary transition-colors pr-12`}
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        {errors.password && <div className="text-red-400 text-sm mt-1">{errors.password}</div>}
      </div>

      {mode === 'register' && (
        <div className="mb-6">
          <label className="block text-sm text-gray-300 mb-2">Confirm Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full p-3 rounded bg-[#0b0b0d] border ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-700'
              } focus:border-primary transition-colors pr-12`}
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.confirmPassword && <div className="text-red-400 text-sm mt-1">{errors.confirmPassword}</div>}
        </div>
      )}
      
      <button 
        type="submit"
        className="w-full py-3 bg-primary rounded hover:bg-primary/90 transition-colors font-semibold"
      >
        {mode === 'login' ? 'Login' : 'Create Account'}
      </button>
    </form>
  );
}