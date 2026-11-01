import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldAlert, Brain } from 'lucide-react';
import Button from '../components/common/Button.jsx';

/**
 * Route Guard for Administrator-only Pages (/admin/*)
 * Strictly verifies user.role === 'admin'
 */
export const AdminRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-neuro-bg flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-2xl bg-neuro-lavender flex items-center justify-center text-neuro-purple border border-neuro-purple/20 shadow-card animate-pulse">
            <Brain className="w-6 h-6 text-neuro-purple" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-sm font-semibold text-neuro-text">Verifying Admin Permissions</h3>
            <p className="text-xs text-neuro-textMuted">Checking system authorization credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in -> send to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but not an admin -> access forbidden
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-neuro-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-neuro-border p-8 text-center shadow-card space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-neuro-text">Access Restricted</h2>
          <p className="text-xs text-neuro-textMuted leading-relaxed">
            The requested area requires administrator credentials. Your student account does not have permission to manage course catalogs or modify system curricula.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => window.location.assign('/dashboard')}
            >
              Return to Student Workspace
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Authorized Admin
  return <Outlet />;
};

export default AdminRoute;
