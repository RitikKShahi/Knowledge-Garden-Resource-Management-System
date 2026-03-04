import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login, clearError } from './authSlice';
import { AppDispatch, RootState } from '../../store';
import { Button } from '@/components/ui/button';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the return URL from location state or default to home page
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) {
      dispatch(clearError());
    }
    
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Prevent default form submission behavior
      e.stopPropagation();
      
      console.log('Submitting login with:', formData);
      
      // Dispatch login action
      const actionResult = await dispatch(login(formData));
      console.log('Login action result:', actionResult);
      
      // Check if the action was rejected (Redux Toolkit pattern)
      if (actionResult.meta && actionResult.meta.requestStatus === 'rejected') {
        console.error('Login rejected:', actionResult.payload);
        return false;
      }
      
      // If login was successful, navigate
      if (actionResult.meta && actionResult.meta.requestStatus === 'fulfilled') {
        console.log('Login successful, payload:', actionResult.payload);
        navigate(from, { replace: true });
      }
    } catch (err) {
      // Show the error but don't redirect
      console.error('Login exception caught:', err);
      // Error is already handled in the slice
    }
    
    // Prevent form from submitting again
    return false;
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Sign In</h1>
        <p className="text-gray-600 mt-1">Access your Knowledge Garden account</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="Enter your password"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-800">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
