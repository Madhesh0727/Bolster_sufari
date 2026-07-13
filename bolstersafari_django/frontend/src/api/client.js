import axios from 'axios';
import axiosRetry from 'axios-retry';

// Always use relative /api/ path.
// - In development: Vite proxy (vite.config.js) forwards /api/* to the backend.
// - In production: Vercel rewrites (vercel.json) proxy /api/* to Render server-side.
// This avoids ALL cross-origin (CORS) issues because the browser only talks to the same domain.
const apiClient = axios.create({
  baseURL: '/api/',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Configure Axios Retry for FIFO-like queueing when server is overloaded (Render free tier)
axiosRetry(apiClient, {
  retries: 3, // Retry up to 3 times
  retryDelay: axiosRetry.exponentialDelay, // 1s, 2s, 4s backoff
  retryCondition: (error) => {
    // Retry on network errors, timeouts, 5xx server errors, and 429 Too Many Requests
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           (error.response && (error.response.status >= 500 || error.response.status === 429 || error.response.status === 408));
  },
});

// Request Interceptor: Attach JWT Token and normalize URL
apiClient.interceptors.request.use((config) => {
  // Strip leading slash to prevent overriding the /api/ base path
  if (config.url && config.url.startsWith('/')) {
    config.url = config.url.substring(1);
  }

  const token = localStorage.getItem('customerToken') || localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Handle 401 Unauthorized and format errors
apiClient.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response) {
    // Handle Unauthorized
    if (error.response.status === 401) {
      localStorage.removeItem('adminToken');
      if (window.location.pathname !== '/admin/login' && window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    
    // Normalize custom backend exception format { success, message, errors }
    // so frontend components can easily access the message
    if (error.response.data && typeof error.response.data === 'object') {
      if (error.response.data.message) {
        // Attach the message directly to the error object for easy access
        error.customMessage = error.response.data.message;
      } else if (error.response.data.detail) {
        error.customMessage = error.response.data.detail;
      }
    }
  } else if (error.request) {
    // Network error (Server down / Offline)
    error.customMessage = "Network error or server is unavailable. Please check your connection.";
  }
  return Promise.reject(error);
});

export default apiClient;

