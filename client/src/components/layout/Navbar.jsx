import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Brain, Menu, X, Activity, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { NAV_LINKS } from '../../data/navigation.js';
import useHealthCheck from '../../hooks/useHealthCheck.js';
import Badge from '../ui/Badge.jsx';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { healthData, dbData, loading } = useHealthCheck();

  const isApiHealthy = !loading && healthData?.success;
  const isDbHealthy = !loading && dbData?.connected;

  return (
    <header className="sticky top-0 z-50 bg-neuro-bg/80 backdrop-blur-md border-b border-card-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neuro-purple to-neuro-pink p-0.5 shadow-soft-purple group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-neuro-card rounded-[10px] flex items-center justify-center">
                <Brain className="w-5 h-5 text-neuro-purpleLight" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-neuro-purpleLight bg-clip-text text-transparent">
                NeuroLearn
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-neuro-purple/15 text-neuro-purpleLight border border-neuro-purple/30">
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
                      ? 'text-white bg-neuro-elevated shadow-sm border border-card-border'
                      : 'text-neuro-textMuted hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* System Status Indicators & Action */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Live API & DB Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neuro-card border border-card-border text-xs">
              <span className="flex items-center gap-1.5 text-neuro-textMuted">
                <Activity className="w-3.5 h-3.5 text-neuro-purple" />
                API:
                {loading ? (
                  <span className="text-slate-400">...</span>
                ) : isApiHealthy ? (
                  <span className="text-emerald-400 font-medium">Online</span>
                ) : (
                  <span className="text-rose-400 font-medium">Offline</span>
                )}
              </span>

              <span className="text-white/20">|</span>

              <span className="flex items-center gap-1.5 text-neuro-textMuted">
                <Database className="w-3.5 h-3.5 text-neuro-purpleLight" />
                DB:
                {loading ? (
                  <span className="text-slate-400">...</span>
                ) : isDbHealthy ? (
                  <span className="text-emerald-400 font-medium">Ready</span>
                ) : (
                  <span className="text-amber-400 font-medium" title="Configure MONGODB_URI in server/.env">Standby</span>
                )}
              </span>
            </div>

            <Link
              to="/dashboard"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-neuro-purple hover:bg-violet-600 text-white transition-colors shadow-soft-purple"
            >
              Open Dashboard
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-neuro-textMuted hover:text-white hover:bg-neuro-card focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-card-border bg-neuro-bgSecondary px-4 pt-3 pb-5 space-y-2">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 text-base font-medium rounded-lg ${
                  isActive
                    ? 'text-white bg-neuro-elevated border border-card-border'
                    : 'text-neuro-textMuted hover:text-white hover:bg-white/5'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-neuro-textMuted">
            <span>API: {isApiHealthy ? '🟢 Online' : '🔴 Offline'}</span>
            <span>DB: {isDbHealthy ? '🟢 Connected' : '🟡 Standby'}</span>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
