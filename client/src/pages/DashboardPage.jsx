import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Activity,
  Clock,
  BookOpen,
  Zap,
  TrendingUp,
  Sliders,
  CheckCircle,
  LogOut,
  User as UserIcon,
  Settings,
  ChevronDown,
  Mail,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Card, { CardHeader } from '../components/common/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/common/Button.jsx';
import { CORE_SIGNALS } from '../data/navigation.js';
import { useAuth } from '../context/AuthContext.jsx';

// Sample telemetry time-series dataset to test Recharts functionality
const MOCK_TELEMETRY_SERIES = [
  { time: '0m', engagement: 82, driftProbability: 18 },
  { time: '5m', engagement: 88, driftProbability: 12 },
  { time: '10m', engagement: 74, driftProbability: 26 },
  { time: '15m', engagement: 61, driftProbability: 39 },
  { time: '20m', engagement: 85, driftProbability: 15 },
  { time: '25m', engagement: 91, driftProbability: 9 },
  { time: '30m', engagement: 79, driftProbability: 21 },
];

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const getInitials = (name) => {
    if (!name) return 'S';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 bg-neuro-bg">
      {/* Top Banner / Session Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neuro-border">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="purple">
              {user ? `Student: ${user.fullName}` : 'Student Workspace'}
            </Badge>
            <Badge variant="success">Adaptive Telemetry Active</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neuro-text mt-2">
            {user ? `Welcome back, ${user.fullName}!` : 'Cognitive Flow & Learning Analytics'}
          </h1>
          <div className="flex items-center gap-3 mt-1 text-xs text-neuro-textMuted">
            <span>Real-time behavioral telemetry monitoring and adaptive learning interventions.</span>
            {user?.email && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono text-neuro-text">
                  <Mail className="w-3 h-3 text-neuro-purple" />
                  {user.email}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Dashboard Actions and Profile Dropdown */}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            icon={Brain}
            onClick={() => navigate('/analytics')}
          >
            Learning Analytics
          </Button>

          {/* Profile Dropdown Component */}
          {user && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 px-3 rounded-xl bg-white border border-neuro-border shadow-subtle hover:bg-slate-50 transition-all text-xs font-semibold text-neuro-text"
              >
                <div className="w-7 h-7 rounded-lg bg-neuro-purple text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {getInitials(user.fullName)}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="leading-tight truncate max-w-[120px]">{user.fullName}</p>
                  <p className="text-[10px] text-neuro-textMuted font-mono">@{user.username}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neuro-textMuted ml-1" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-neuro-border shadow-card py-2 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-4 py-2.5 border-b border-neuro-border">
                    <p className="text-xs font-bold text-neuro-text">{user.fullName}</p>
                    <p className="text-[11px] text-neuro-textMuted font-mono truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neuro-lavender text-neuro-purple capitalize">
                      {user.role || 'student'}
                    </span>
                  </div>

                  <div className="py-1">
                    <div
                      className="flex items-center justify-between px-4 py-2 text-xs text-neuro-textMuted cursor-not-allowed select-none"
                      title="Profile settings (Upcoming)"
                    >
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>My Profile</span>
                      </div>
                      <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
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
                      <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
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
          )}

          <Button variant="primary" size="sm" icon={Brain}>
            Simulate Cognitive State
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="space-y-2">
          <div className="flex items-center justify-between text-xs text-neuro-textMuted">
            <span>Engagement Index</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-neuro-text">84%</div>
          <p className="text-[11px] text-emerald-600 flex items-center gap-1">
            <span>Optimal cognitive absorption zone</span>
          </p>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-xs text-neuro-textMuted">
            <span>Current State</span>
            <Zap className="w-4 h-4 text-neuro-purple" />
          </div>
          <div className="text-2xl font-bold text-neuro-purple">Focused Flow</div>
          <p className="text-[11px] text-neuro-textMuted">
            Predicted by behavioral signal classifier
          </p>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-xs text-neuro-textMuted">
            <span>Active Module</span>
            <BookOpen className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-2xl font-bold text-neuro-text">Neural Net Basics</div>
          <p className="text-[11px] text-neuro-textMuted">
            Chunk 3 of 7 • Micro-lesson pacing
          </p>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-xs text-neuro-textMuted">
            <span>Session Pacing</span>
            <Clock className="w-4 h-4 text-neuro-purpleLight" />
          </div>
          <div className="text-2xl font-bold text-neuro-text">28 min</div>
          <p className="text-[11px] text-neuro-textMuted">
            Break suggested in 12 min
          </p>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="space-y-4">
        <CardHeader
          title="Cognitive Engagement & Drift Probability (Telemetry Preview)"
          subtitle="Validating Recharts integration on clean lavender SaaS theme"
          action={<Badge variant="purple">Recharts Verified</Badge>}
        />

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_TELEMETRY_SERIES} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="pinkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#A78BFA" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#77788A" fontSize={11} tickLine={false} />
              <YAxis stroke="#77788A" fontSize={11} tickLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#ECECF2',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#202033',
                  boxShadow: '0 4px 20px -2px rgba(32, 32, 51, 0.08)',
                }}
              />
              <Area
                type="monotone"
                dataKey="engagement"
                name="Engagement %"
                stroke="#8B5CF6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#purpleGrad)"
              />
              <Area
                type="monotone"
                dataKey="driftProbability"
                name="Drift Risk %"
                stroke="#A78BFA"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#pinkGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Behavioral Signals Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Telemetry Stream Status"
            subtitle="Client-side interaction listeners"
          />
          <div className="space-y-3">
            {CORE_SIGNALS.map((signal) => (
              <div
                key={signal.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-neuro-border text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-neuro-purple" />
                  <div>
                    <span className="font-semibold text-neuro-text">{signal.title}</span>
                    <p className="text-[11px] text-neuro-textMuted">{signal.badge}</p>
                  </div>
                </div>
                <Badge variant={signal.id === 'gaze' ? 'neutral' : 'success'}>
                  {signal.id === 'gaze' ? 'Opt-In Needed' : 'Listener Active'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card elevated className="border-neuro-purple/20 flex flex-col justify-between">
          <div>
            <CardHeader
              title="Authentication & Telemetry Integration"
              subtitle="Production architecture status"
            />
            <div className="space-y-3 text-xs text-neuro-textMuted">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-neuro-text">Clean Light SaaS Palette:</strong> Predominantly white and very light grey surfaces (#F8F9FC, #FFFFFF) with lavender accents.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-neuro-text">Registration Module:</strong> Split-screen layout with live password strength bar and validation.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-neuro-text">Login Module:</strong> Secure login with bcryptjs comparison, JWT token issuance, and remember-me UI.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-neuro-text">Rate Limiter & Security:</strong> express-rate-limit brute force protection on /api/auth/*.
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neuro-border text-xs text-neuro-textMuted">
            <span className="text-neuro-purple font-medium">Ready for Milestone 5:</span> Protected frontend route wrappers and authenticated session state providers.
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
