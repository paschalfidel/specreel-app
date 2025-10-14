import api from '../api/api';
import AuthForm from '../components/AuthForm';
import { setToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  
  const handleRegister = async (formData) => {
    try {
      // The backend expects 'username', not 'name'
      const registerData = {
        username: formData.username,
        email: formData.email,
        password: formData.password
      };
      
      console.log('Sending registration data:', registerData);
      
      const res = await api.post('/auth/register', registerData);
      setToken(res.data.token);
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err?.response?.data?.message || 'Registration failed. Please try again.';
      alert(errorMessage);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Create an Account</h1>
        <p className="text-gray-400">Join SpecReel to save your favorite movies and write reviews</p>
      </div>
      <AuthForm onSubmit={handleRegister} mode="register" />
      
      <div className="text-center mt-6">
        <p className="text-gray-400">
          Already have an account?{' '}
          <a href="/login" className="text-primary hover:underline">
            Sign in here
          </a>
        </p>
      </div>
    </main>
  );
}