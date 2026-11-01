import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Brain } from 'lucide-react';

/**
 * Route wrapper for public-only pages (/login, /register)
 * Automatically redirects authenticated students to /dashboard
 */
export const PublicRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-neuro-bg flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-2xl bg-neuro-lavender flex items-center justify-center text-neuro-purple border border-neuro-purple/20 shadow-card animate-pulse">
            <Brain className="w-6 h-6 text-neuro-purple" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-sm font-semibold text-neuro-text">NeuroLearn</h3>
            <p className="text-xs text-neuro-textMuted">Checking authentication status...</p>
          </div>
        </div>
      </div>
    );
  }

  // If already authenticated, redirect to previous location or dashboard
  if (isAuthenticated) {
    const destination = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={destination} replace />;
  }

  // Unauthenticated: allow access to login/register form
  return <Outlet />;
};

export default PublicRoute;
