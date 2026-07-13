import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_URL || '/api';
// Ensure baseURL ends with /api/
if (rawBaseUrl.endsWith('/api')) {
  rawBaseUrl += '/';
} else if (!rawBaseUrl.endsWith('/api/')) {
  rawBaseUrl = rawBaseUrl.replace(/\/$/, '') + '/api/';
}

const apiClient = axios.create({
  baseURL: rawBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token and fix URL formatting
apiClient.interceptors.request.use((config) => {
  // Prevent leading slash from overriding the baseURL path (e.g. /api/)
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
