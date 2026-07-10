import axios from 'axios';

// In development: Vite proxy handles /api requests (see vite.config.js), so baseURL is empty.
// In production: set VITE_API_URL=https://your-backend-domain.com/api in .env
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token (try customerToken first, fallback to adminToken)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('customerToken') || localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Handle 401 Unauthorized
apiClient.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('adminToken');
    // If not already on the login page, redirect
    if (window.location.pathname !== '/admin/login' && window.location.pathname.startsWith('/admin')) {
      window.location.href = '/admin/login';
    }
  }
  return Promise.reject(error);
});

export default apiClient;
