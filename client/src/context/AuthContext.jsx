import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService.js';

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('neurolearn_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('neurolearn_token') || null;
  });

  // Keep state synchronized with localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedUser = localStorage.getItem('neurolearn_user');
        const storedToken = localStorage.getItem('neurolearn_token');
        setUser(storedUser ? JSON.parse(storedUser) : null);
        setToken(storedToken || null);
      } catch {
        setUser(null);
        setToken(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (userData, userToken) => {
    if (userData) {
      setUser(userData);
      localStorage.setItem('neurolearn_user', JSON.stringify(userData));
    }
    if (userToken) {
      setToken(userToken);
      localStorage.setItem('neurolearn_token', userToken);
    }
  };

  const logout = async () => {
    try {
      await authService.logoutUser();
    } catch {
      // Continue client cleanup even if logout request fails
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('neurolearn_user');
      localStorage.removeItem('neurolearn_token');
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('neurolearn_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!(user && token),
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
