import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiAlertCircle, FiUserPlus } from 'react-icons/fi';
import { UserContext } from '../context/UserContext';
import api from '../utils/api';
import '../styles/forms.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const { name, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setIsLoading(true);
    
    try {
      const response = await api.post('/auth/register', { 
        name, 
        email, 
        password 
      });
      
      // Log the user in after successful registration
      const { user, token } = response;
      if (user && token) {
        login({ ...user, token });
        navigate('/dashboard');
      } else {
        throw new Error('Invalid registration response');
      }
      
    } catch (err) {
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="form-container">
        <div className="form-header">
          <h2>Create an Account</h2>
          <p>Join us today and start your journey</p>
        </div>
        
        {error && (
          <div className="error-message">
            <FiAlertCircle className="text-xl" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={handleChange}
                className="form-control pl-10"
                placeholder="John Doe"
                required
                minLength={2}
                autoComplete="name"
                autoFocus
              />
            </div>
          </div>
          
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
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
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
                autoComplete="new-password"
              />
            </div>
            <p className="form-text">Must be at least 6 characters</p>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={handleChange}
                className="form-control pl-10"
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button
              type="submit"
              className={`btn btn-primary w-full flex items-center justify-center ${isLoading ? 'btn-loading' : ''}`}
              disabled={isLoading}
            >
              {!isLoading && <FiUserPlus className="mr-2" />}
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
          
          <div className="form-footer">
            Already have an account?{' '}
            <Link to="/login" className="font-medium">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
