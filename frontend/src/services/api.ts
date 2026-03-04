import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Base API configuration
const API_URL = /*import.meta.env.VITE_API_URL ||*/  'http://localhost:5000/';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors with enhanced debugging
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`[API Success] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
    return response;
  },
  (error: AxiosError) => {
    const { response, request, config } = error;
    const url = config?.url || 'unknown endpoint';
    const method = config?.method?.toUpperCase() || 'unknown method';

    // Enhanced error logging
    console.error(`[API Error] ${method} ${url}`, {
      status: response?.status,
      statusText: response?.statusText,
      data: response?.data,
      headers: config?.headers
    });

    // Only handle token expiration if we're not already on the login page
    if (response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('auth_token');
      // Use history to navigate instead of directly changing location
      // This prevents full page reloads
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Handle server errors
    if (response?.status === 500) {
      console.error('Server error details:', error);
    }

    // Handle CORS errors
    if (!response && request) {
      console.error('Possible CORS or network error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
