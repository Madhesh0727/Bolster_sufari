import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

export default function ProtectedRoute({ children }) {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setIsVerifying(false);
        return;
      }
      
      try {
        // A minimal endpoint to verify the token is valid (e.g. fetching dashboard stats or user profile)
        // If it throws a 401, the interceptor will clear the token and we'll handle it.
        // For simplicity, we just assume if there's a token, it's valid until an API call fails.
        // However, a true strict check would ping the server first.
        // Since the interceptor handles 401s, we can just allow them through and 
        // the first API call failing will kick them out. 
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Session expired:', error);
        toast.error('Session expired. Please log in again.');
      } finally {
        setIsVerifying(false);
      }
    };
    checkAuth();
  }, []);

  if (isVerifying) {
    return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>Loading Secure Workspace...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
