import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Brain } from 'lucide-react';

/**
 * Route guard for authenticated pages (e.g. /dashboard)
 * Verifies session via HttpOnly cookie and prevents unauthenticated access
 */
export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show professional loading screen while session is being verified
  if (loading) {
    return (
      <div className="min-h-screen bg-neuro-bg flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-2xl bg-neuro-lavender flex items-center justify-center text-neuro-purple border border-neuro-purple/20 shadow-card animate-pulse">
            <Brain className="w-6 h-6 text-neuro-purple" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-sm font-semibold text-neuro-text">Verifying Session</h3>
            <p className="text-xs text-neuro-textMuted">Connecting to your adaptive learning workspace...</p>
          </div>
          <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
            <div className="w-full h-full bg-neuro-purple animate-indeterminate rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login while preserving destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated: Render protected outlet
  return <Outlet />;
};

export default ProtectedRoute;
