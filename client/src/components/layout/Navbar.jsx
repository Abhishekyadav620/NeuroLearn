import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Brain,
  Menu,
  X,
  Activity,
  Database,
  LogIn,
  UserPlus,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Settings,
  GraduationCap,
  Shield,
  BarChart2,
} from 'lucide-react';
import { NAV_LINKS } from '../../data/navigation.js';
import useHealthCheck from '../../hooks/useHealthCheck.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { healthData, dbData, loading } = useHealthCheck(8000); // Poll health every 8s
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const isApiHealthy = !loading && healthData?.success;
  const isDbHealthy = !loading && (dbData?.connected || healthData?.data?.database?.connected);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/', { replace: true });
  };

  // Helper to extract user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'S';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neuro-border shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-neuro-lavender flex items-center justify-center text-neuro-purple border border-neuro-purple/20 shadow-subtle group-hover:scale-105 transition-transform duration-200">
              <Brain className="w-5 h-5 text-neuro-purple" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-neuro-text tracking-tight">
                NeuroLearn
              </span>
              <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-neuro-lavender text-neuro-purple border border-neuro-purple/15">
                Adaptive AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.filter((link) => {
              if (link.publicOnly && isAuthenticated) return false;
              if (link.protected && !isAuthenticated) return false;
              return true;
            }).map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                    isActive
                      ? 'text-neuro-purple bg-neuro-lavender/60 font-semibold'
                      : 'text-neuro-textMuted hover:text-neuro-text hover:bg-slate-50'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            {isAuthenticated && user?.role === 'admin' && (
              <NavLink
                to="/admin/courses"
                className={({ isActive }) =>
                  `px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-150 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-neuro-purple bg-neuro-lavender/60 font-semibold'
                      : 'text-neuro-textMuted hover:text-neuro-text hover:bg-slate-50'
                  }`
                }
              >
                <Shield className="w-3.5 h-3.5 text-neuro-purple" />
                <span>Admin</span>
              </NavLink>
            )}
          </nav>

          {/* System Telemetry & Auth Section */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Live API & DB Indicator (Only displayed before login) */}
            {!isAuthenticated && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-neuro-border text-xs">
                <span className="flex items-center gap-1.5 text-neuro-textMuted">
                  <Activity className="w-3.5 h-3.5 text-neuro-purple" />
                  API:
                  {loading ? (
                    <span className="text-slate-400">...</span>
                  ) : isApiHealthy ? (
                    <span className="text-emerald-600 font-semibold">Online</span>
                  ) : (
                    <span className="text-rose-500 font-semibold">Offline</span>
                  )}
                </span>

                <span className="text-slate-300">|</span>

                <span className="flex items-center gap-1.5 text-neuro-textMuted">
                  <Database className="w-3.5 h-3.5 text-neuro-purpleLight" />
                  DB:
                  {isDbHealthy ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Ready
                    </span>
                  ) : (
                    <span className="text-amber-500 font-semibold">Standby</span>
                  )}
                </span>
              </div>
            )}

            {/* Authenticated State vs Public State */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-neuro-border transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-neuro-purple text-white font-semibold text-xs flex items-center justify-center shadow-sm">
                    {getInitials(user.fullName)}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-semibold text-neuro-text leading-tight truncate max-w-[120px]">
                      {user.fullName}
                    </p>
                    <p className="text-[10px] text-neuro-textMuted capitalize leading-none">
                      {user.role || 'student'}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-neuro-textMuted ml-0.5" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-neuro-border shadow-card py-2 z-50 animate-in fade-in slide-in-from-top-1">
                    <div className="px-4 py-2.5 border-b border-neuro-border">
                      <p className="text-xs font-bold text-neuro-text">{user.fullName}</p>
                      <p className="text-[11px] text-neuro-textMuted font-mono truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neuro-lavender text-neuro-purple">
                        @{user.username || 'student'}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-neuro-text hover:bg-slate-50 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-neuro-purple" />
                        <span>Student Dashboard</span>
                      </Link>

                      <Link
                        to="/my-courses"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-neuro-text hover:bg-slate-50 transition-colors"
                      >
                        <GraduationCap className="w-4 h-4 text-neuro-purple" />
                        <span>My Courses</span>
                      </Link>

                      <Link
                        to="/analytics"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-neuro-text hover:bg-slate-50 transition-colors"
                      >
                        <BarChart2 className="w-4 h-4 text-neuro-purple" />
                        <span>Learning Analytics</span>
                      </Link>

                      {user?.role === 'admin' && (
                        <Link
                          to="/admin/courses"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-neuro-purple font-semibold hover:bg-neuro-lavender/50 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-neuro-purple" />
                          <span>Admin Portal</span>
                        </Link>
                      )}

                      <div
                        className="flex items-center justify-between px-4 py-2 text-xs text-neuro-textMuted cursor-not-allowed select-none"
                        title="Profile management module (Upcoming)"
                      >
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          <span>My Profile</span>
                        </div>
                        <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                          Soon
                        </span>
                      </div>

                      <div
                        className="flex items-center justify-between px-4 py-2 text-xs text-neuro-textMuted cursor-not-allowed select-none"
                        title="Account settings & preferences (Upcoming)"
                      >
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4 text-slate-400" />
                          <span>Account Settings</span>
                        </div>
                        <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                          Soon
                        </span>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-neuro-border">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors font-semibold"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-neuro-text hover:text-neuro-purple transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Link>

                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-neuro-purple hover:bg-neuro-purpleHover text-white transition-all shadow-purple-btn flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-neuro-textMuted hover:text-neuro-text hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neuro-border bg-white px-4 pt-3 pb-5 space-y-2">
          {isAuthenticated && user && (
            <div className="p-3 mb-2 rounded-xl bg-slate-50 border border-neuro-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-neuro-purple text-white font-semibold text-xs flex items-center justify-center">
                  {getInitials(user.fullName)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-neuro-text">{user.fullName}</p>
                  <p className="text-[11px] text-neuro-textMuted">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1 border border-rose-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {NAV_LINKS.filter((link) => {
            if (link.publicOnly && isAuthenticated) return false;
            if (link.protected && !isAuthenticated) return false;
            return true;
          }).map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 text-base font-medium rounded-lg ${
                  isActive
                    ? 'text-neuro-purple bg-neuro-lavender font-semibold'
                    : 'text-neuro-textMuted hover:text-neuro-text hover:bg-slate-50'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          {isAuthenticated && user?.role === 'admin' && (
            <NavLink
              to="/admin/courses"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 text-base font-semibold rounded-lg text-neuro-purple ${
                  isActive ? 'bg-neuro-lavender' : 'hover:bg-slate-50'
                }`
              }
            >
              Course Admin Portal
            </NavLink>
          )}

          {!isAuthenticated && (
            <div className="pt-3 border-t border-neuro-border flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2 text-center text-sm font-semibold text-neuro-text bg-slate-50 rounded-lg border border-neuro-border"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2 text-center text-sm font-semibold text-white bg-neuro-purple rounded-lg shadow-purple-btn"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
