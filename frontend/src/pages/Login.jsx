import api from '../api/api';
import AuthForm from '../components/AuthForm';
import { setToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  
  const handleLogin = async (formData) => {
    try {
      const loginData = {
        email: formData.email,
        password: formData.password
      };
      
      console.log('Sending login request...', loginData);
      
      const res = await api.post('/auth/login', loginData);
      console.log('Login response:', res.data);
      
      if (res.data.token) {
        setToken(res.data.token);
        
        // Trigger a custom event to update all components
        window.dispatchEvent(new Event('authChange'));
        
        console.log('Login successful, redirecting to home...');
        navigate('/');
      } else {
        console.error('No token in response');
        alert('Login failed: No token received');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err?.response?.data?.message || 'Login failed. Please check your credentials.';
      alert(errorMessage);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
        <p className="text-gray-400">Sign in to your SpecReel account</p>
      </div>
      <AuthForm onSubmit={handleLogin} mode="login" />
      
      <div className="text-center mt-6">
        <p className="text-gray-400">
          Don't have an account?{' '}
          <a href="/register" className="text-primary hover:underline">
            Create one here
          </a>
        </p>
      </div>
    </main>
  );
}