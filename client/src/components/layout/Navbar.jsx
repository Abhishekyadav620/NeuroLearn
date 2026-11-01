import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Brain, Menu, X, Activity, Database, LogIn, UserPlus } from 'lucide-react';
import { NAV_LINKS } from '../../data/navigation.js';
import useHealthCheck from '../../hooks/useHealthCheck.js';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { healthData, dbData, loading } = useHealthCheck();

  const isApiHealthy = !loading && healthData?.success;
  const isDbHealthy = !loading && dbData?.connected;

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
            {NAV_LINKS.map((link) => (
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
          </nav>

          {/* System Telemetry & Auth Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Live API & DB Indicator */}
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
                {loading ? (
                  <span className="text-slate-400">...</span>
                ) : isDbHealthy ? (
                  <span className="text-emerald-600 font-semibold">Ready</span>
                ) : (
                  <span className="text-amber-500 font-semibold">Standby</span>
                )}
              </span>
            </div>

            {/* Auth Buttons */}
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
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 text-base font-medium rounded-lg ${
                  isActive
                    ? 'text-neuro-purple bg-neuro-lavender'
                    : 'text-neuro-textMuted hover:text-neuro-text hover:bg-slate-50'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

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
        </div>
      )}
    </header>
  );
};

export default Navbar;
