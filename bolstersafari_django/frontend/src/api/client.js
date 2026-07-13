import axios from 'axios';

// Always use relative /api/ path.
// - In development: Vite proxy (vite.config.js) forwards /api/* to the backend.
// - In production: Vercel rewrites (vercel.json) proxy /api/* to Render server-side.
// This avoids ALL cross-origin (CORS) issues because the browser only talks to the same domain.
const apiClient = axios.create({
  baseURL: '/api/',
  headers: {
    'Content-Type': 'application/json',
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

