import React from 'react';
import {
  Brain,
  Activity,
  Clock,
  BookOpen,
  Zap,
  TrendingUp,
  ShieldAlert,
  Sliders,
  CheckCircle,
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
  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Top Banner / Session Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-card-border">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="purple">Student Workspace</Badge>
            <Badge variant="success">Adaptive Telemetry Active</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2">
            Cognitive Flow & Learning Analytics
          </h1>
          <p className="text-xs sm:text-sm text-neuro-textMuted mt-1">
            Real-time behavioral telemetry monitoring and adaptive learning interventions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" icon={Sliders}>
            Preferences
          </Button>
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
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">84%</div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <span>Optimal cognitive absorption zone</span>
          </p>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-xs text-neuro-textMuted">
            <span>Current State</span>
            <Zap className="w-4 h-4 text-neuro-purpleLight" />
          </div>
          <div className="text-2xl font-bold text-neuro-purpleLight">Focused Flow</div>
          <p className="text-[11px] text-neuro-textMuted">
            Predicted by behavioral signal classifier
          </p>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-xs text-neuro-textMuted">
            <span>Active Module</span>
            <BookOpen className="w-4 h-4 text-neuro-pink" />
          </div>
          <div className="text-2xl font-bold text-white">Neural Net Basics</div>
          <p className="text-[11px] text-neuro-textMuted">
            Chunk 3 of 7 • Micro-lesson pacing
          </p>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-xs text-neuro-textMuted">
            <span>Session Pacing</span>
            <Clock className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-white">28 min</div>
          <p className="text-[11px] text-neuro-textMuted">
            Break suggested in 12 min
          </p>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="space-y-4">
        <CardHeader
          title="Cognitive Engagement & Drift Probability (Telemetry Preview)"
          subtitle="Validating Recharts integration on the dark purple design theme"
          action={<Badge variant="purple">Recharts Verified</Badge>}
        />

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_TELEMETRY_SERIES} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="pinkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={11} tickLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#19192F',
                  borderColor: '#232340',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#F8FAFC',
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
                stroke="#EC4899"
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
                className="flex items-center justify-between p-3 rounded-xl bg-neuro-elevated/50 border border-white/5 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-neuro-purpleLight" />
                  <div>
                    <span className="font-semibold text-white">{signal.title}</span>
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

        <Card elevated className="border-neuro-purple/30 flex flex-col justify-between">
          <div>
            <CardHeader
              title="Milestone 1 Architecture State"
              subtitle="Foundation readiness verification"
            />
            <div className="space-y-3 text-xs text-neuro-textMuted">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-white">Clean Monorepo:</strong> Separate client and server directories with single-command orchestrations.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-white">Design Tokens:</strong> Dark purple theme (#0B0B16, #111124, #19192F, #8B5CF6, #EC4899).
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-white">Health Telemetry:</strong> Diagnostic endpoints at /api/health and /api/health/db.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-white">Routing Foundation:</strong> Reusable Navbar and MainLayout with public & student routes.
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-xs text-neuro-textMuted">
            <span className="text-neuro-purpleLight font-medium">Ready for Milestone 2:</span> Interactive adaptive learning player, real session tracking, and ML model inference integrations.
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
