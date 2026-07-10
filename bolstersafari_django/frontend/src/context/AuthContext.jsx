/**
 * AuthContext — BolsterSafari
 * Provides a unified authentication context for both Admin and Customer portals.
 * Tokens are stored in localStorage under 'adminToken' (admin/portal) or 'customerToken' (travelers).
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserFromToken = () => {
    const token = localStorage.getItem('customerToken') || localStorage.getItem('adminToken');
    if (!token) { setUser(null); setLoading(false); return; }
    try {
      const decoded = jwtDecode(token);
      // Check expiry
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('customerToken');
        setUser(null);
      } else {
        setUser(decoded);
      }
    } catch {
      localStorage.removeItem('customerToken');
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => { loadUserFromToken(); }, []);

  const logout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('adminToken');
    setUser(null);
  };

  const loginWithToken = (token, tokenKey = 'customerToken') => {
    localStorage.setItem(tokenKey, token);
    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, loginWithToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
