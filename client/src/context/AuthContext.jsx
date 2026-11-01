import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService.js';

const AuthContext = createContext({
  user: null,
  loading: true,
  isAuthenticated: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Session verification: checks HttpOnly cookie session on /api/auth/me
  const checkAuth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      // 401 or network error means no active session
      setUser(null);
      if (err.status !== 401) {
        setError(err.message || 'Session verification error');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Run session verification on application mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login action: delegates to backend and updates authenticated user
  const login = async (credentials) => {
    setError(null);
    const response = await authService.loginUser(credentials);
    if (response.success && response.data?.user) {
      setUser(response.data.user);
    }
    return response;
  };

  // Register action: creates student and auto-authenticates via HttpOnly cookie
  const register = async (userData) => {
    setError(null);
    const response = await authService.registerUser(userData);
    if (response.success && response.data?.user) {
      setUser(response.data.user);
    }
    return response;
  };

  // Logout action: clears server-side HttpOnly cookie and resets state
  const logout = async () => {
    try {
      await authService.logoutUser();
    } catch (err) {
      console.warn('Logout request completed with notice:', err.message);
    } finally {
      setUser(null);
      setError(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        error,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
