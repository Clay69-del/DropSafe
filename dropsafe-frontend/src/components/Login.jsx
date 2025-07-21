// dropsafe-frontend/src/components/Login.jsx
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { FiMail, FiLock, FiAlertCircle, FiLogIn } from 'react-icons/fi';
import { UserContext } from '../context/UserContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import '../styles/forms.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  const { email, password } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Handle different possible response structures
      const responseData = response.data || {};
      const userData = responseData.user || responseData;
      const token = responseData.token || userData.token;
      
      if (!userData || !token) {
        throw new Error('Invalid response from server');
      }
      
      // Store the complete user data with token
      const completeUserData = {
        ...userData,
        token: token
      };
      
      localStorage.setItem('user', JSON.stringify(completeUserData));
      login(completeUserData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.error || 
                         err.message || 
                         'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse || !credentialResponse.credential) {
        throw new Error('Invalid Google credential response');
      }

      // Send the credential to your backend for verification
      const response = await api.post('/auth/google-auth', {
        credential: credentialResponse.credential,
      });
      
      // Handle different possible response structures
      const responseData = response.data || {};
      const userData = responseData.user || responseData;
      const token = responseData.token || userData.token;
      
      if (!userData || !token) {
        throw new Error('Invalid response from Google authentication');
      }
      
      // Store the complete user data with token
      const completeUserData = {
        ...userData,
        token: token
      };
      
      localStorage.setItem('user', JSON.stringify(completeUserData));
      login(completeUserData);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Google login error:', err);
      const errorMessage = err.response?.data?.error || 
                         err.message || 
                         'Google login failed. Please try again or use email/password.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="form-container">
        <div className="form-header">
          <h2>Welcome Back</h2>
          <p>Sign in to access your account</p>
        </div>
        
        {error && (
          <div className="error-message">
            <FiAlertCircle className="text-xl" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={handleChange}
                className="form-control pl-10"
                placeholder="you@example.com"
                required
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>
          
          <div className="form-group">
            <div className="flex items-center justify-between">
              <label htmlFor="password">Password</label>
              <Link to="/reset-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={handleChange}
                className="form-control pl-10"
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="current-password"
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button
              type="submit"
              className={`btn btn-primary w-full flex items-center justify-center ${isLoading ? 'btn-loading' : ''}`}
              disabled={isLoading}
            >
              {!isLoading && <FiLogIn className="mr-2" />}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
            
            <div className="divider">or continue with</div>
            
            <div className="w-full flex justify-center">
              <div className="w-full max-w-xs">
                <GoogleLogin
                  clientId="383615030405-pljs4u532tsurkmhi4ahiavnffltj2sv.apps.googleusercontent.com"
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Failed to initialize Google Sign-In')}
                  useOneTap
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  width="300"
                  logo_alignment="center"
                  cookiePolicy="single_host_origin"
                />
              </div>
            </div>
          </div>
          
        </form>
        
        <p className="text-center text-gray-600 text-sm mt-4">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-500 hover:text-blue-700 font-semibold">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;