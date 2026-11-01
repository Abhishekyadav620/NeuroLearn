import React from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Sparkles,
  Shield,
  Activity,
  ArrowRight,
  RefreshCw,
  Database,
  Cpu,
  Layers,
  Sliders,
  FileText,
  Lightbulb,
  LogIn,
  UserPlus,
} from 'lucide-react';
import useHealthCheck from '../hooks/useHealthCheck.js';
import Card, { CardHeader } from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import { CORE_SIGNALS } from '../data/navigation.js';
import { formatTimestamp, formatUptime } from '../utils/formatters.js';

export const LandingPage = () => {
  const { healthData, dbData, loading, refetch, lastChecked } = useHealthCheck();

  const isConnected = dbData?.connected;

  return (
    <div className="flex-1 flex flex-col bg-neuro-bg">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden border-b border-neuro-border bg-gradient-to-b from-neuro-lavenderBg/60 to-neuro-bg">
        {/* Subtle soft lavender glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-neuro-lavender/40 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Badge variant="purple" className="mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Adaptive Learning System
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neuro-text max-w-4xl mx-auto leading-tight">
            Personalized Learning Engineered for{' '}
            <span className="bg-gradient-to-r from-neuro-purple to-violet-700 bg-clip-text text-transparent">
              Cognitive Flow
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-neuro-textMuted max-w-2xl mx-auto leading-relaxed">
            NeuroLearn monitors non-intrusive learner interaction patterns to detect attention drift
            and cognitive friction, dynamically adapting educational content in real time.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" icon={UserPlus}>
                Get Started as a Student
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" icon={LogIn}>
                Sign In to Account
              </Button>
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-neuro-textMuted">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Strict privacy adherence: Zero biometric/gaze collection without explicit consent.</span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14 w-full">
        {/* System Diagnostic & API Verification Card */}
        <section id="system-telemetry">
          <Card className="border-neuro-border shadow-card">
            <CardHeader
              title="System Diagnostic Telemetry"
              subtitle="Verifying full-stack communication between React Vite Client and Express Node Server"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refetch}
                  disabled={loading}
                  icon={RefreshCw}
                >
                  {loading ? 'Pinging...' : 'Refresh Status'}
                </Button>
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {/* API Status */}
              <div className="p-4 rounded-xl bg-slate-50 border border-neuro-border space-y-2">
                <div className="flex items-center justify-between text-xs text-neuro-textMuted">
                  <span className="flex items-center gap-1.5 font-medium text-neuro-text">
                    <Activity className="w-4 h-4 text-neuro-purple" />
                    Express Backend
                  </span>
                  <Badge variant={healthData?.success ? 'success' : 'danger'}>
                    {healthData?.success ? 'Operational' : 'Unavailable'}
                  </Badge>
                </div>
                <div className="text-xl font-bold text-neuro-text">
                  {healthData?.data?.application?.version || '1.0.0'}
                </div>
                <p className="text-[11px] text-neuro-textMuted">
                  Endpoint: <code className="text-neuro-purple font-medium">GET /api/health</code>
                </p>
              </div>

              {/* Database Status */}
              <div className="p-4 rounded-xl bg-slate-50 border border-neuro-border space-y-2">
                <div className="flex items-center justify-between text-xs text-neuro-textMuted">
                  <span className="flex items-center gap-1.5 font-medium text-neuro-text">
                    <Database className="w-4 h-4 text-neuro-purpleLight" />
                    MongoDB Mongoose
                  </span>
                  <Badge variant={isConnected ? 'success' : 'warning'}>
                    {isConnected ? 'Connected' : 'Standby / Local URI'}
                  </Badge>
                </div>
                <div className="text-xl font-bold text-neuro-text">
                  {isConnected ? 'Active Connection' : dbData?.data?.status || 'Disconnected'}
                </div>
                <p className="text-[11px] text-neuro-textMuted truncate" title={dbData?.data?.targetUri}>
                  URI: {dbData?.data?.targetUri || 'mongodb://127.0.0.1:27017'}
                </p>
              </div>

              {/* Uptime & Environment */}
              <div className="p-4 rounded-xl bg-slate-50 border border-neuro-border space-y-2">
                <div className="flex items-center justify-between text-xs text-neuro-textMuted">
                  <span className="flex items-center gap-1.5 font-medium text-neuro-text">
                    <Cpu className="w-4 h-4 text-neuro-purple" />
                    Server Runtime
                  </span>
                  <Badge variant="neutral">
                    {healthData?.data?.application?.environment || 'development'}
                  </Badge>
                </div>
                <div className="text-xl font-bold text-neuro-text">
                  {formatUptime(healthData?.data?.application?.uptimeSeconds)}
                </div>
                <p className="text-[11px] text-neuro-textMuted">
                  Node.js: {healthData?.data?.system?.nodeVersion || 'v20+'}
                </p>
              </div>

              {/* Telemetry Polling */}
              <div className="p-4 rounded-xl bg-slate-50 border border-neuro-border space-y-2">
                <div className="flex items-center justify-between text-xs text-neuro-textMuted">
                  <span className="flex items-center gap-1.5 font-medium text-neuro-text">
                    <Layers className="w-4 h-4 text-violet-500" />
                    Telemetry Verification
                  </span>
                  <Badge variant="purple">Live Pulse</Badge>
                </div>
                <div className="text-sm font-semibold text-neuro-text truncate">
                  {lastChecked ? formatTimestamp(lastChecked) : 'Pending...'}
                </div>
                <p className="text-[11px] text-neuro-textMuted">
                  Status response: 200 OK (Validated)
                </p>
              </div>
            </div>

            {/* Notice regarding DB configuration */}
            {!isConnected && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
                <Database className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
                <div className="leading-relaxed">
                  <strong className="font-semibold">MongoDB Status Note:</strong> Express server is active and running. If a local MongoDB daemon or MongoDB Atlas URI is not yet configured, the server operates cleanly in standby mode without crashing. Configure your connection string in <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono">server/.env</code> as <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono">MONGODB_URI</code>.
                </div>
              </div>
            )}
          </Card>
        </section>

        {/* Behavioral Telemetry Signals Grid */}
        <section className="space-y-6">
          <div>
            <Badge variant="purple" className="mb-2">Behavioral Telemetry</Badge>
            <h2 className="text-2xl font-bold text-neuro-text tracking-tight">Core Behavioral Signals</h2>
            <p className="text-sm text-neuro-textMuted mt-1">
              Signals engineered to supply the Machine Learning model for state and cognitive friction prediction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CORE_SIGNALS.map((signal) => (
              <Card key={signal.id} hoverEffect className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-neuro-lavender flex items-center justify-center text-neuro-purple border border-neuro-purple/20">
                    <Activity className="w-4 h-4" />
                  </div>
                  <Badge variant={signal.id === 'gaze' ? 'warning' : 'purple'}>
                    {signal.badge}
                  </Badge>
                </div>
                <h3 className="text-base font-semibold text-neuro-text">{signal.title}</h3>
                <p className="text-xs text-neuro-textMuted leading-relaxed">
                  {signal.description}
                </p>
              </Card>
            ))}

            {/* Privacy Guarantee Card */}
            <Card elevated className="space-y-3 border-emerald-200">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Shield className="w-4 h-4" />
                </div>
                <Badge variant="success">Ethical AI</Badge>
              </div>
              <h3 className="text-base font-semibold text-neuro-text">Privacy by Architecture</h3>
              <p className="text-xs text-neuro-textMuted leading-relaxed">
                Minimal data footprints. Telemetry is anonymized and aggregated. No camera or gaze data is recorded without unambiguous user opt-in.
              </p>
            </Card>
          </div>
        </section>

        {/* Adaptive Interventions Preview */}
        <section className="space-y-6">
          <div>
            <Badge variant="purple" className="mb-2">Autonomous Adaptations</Badge>
            <h2 className="text-2xl font-bold text-neuro-text tracking-tight">Dynamic Learning Adaptations</h2>
            <p className="text-sm text-neuro-textMuted mt-1">
              How NeuroLearn responds when attention drift or cognitive friction is identified.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-neuro-border shadow-subtle space-y-2">
              <FileText className="w-5 h-5 text-neuro-purple" />
              <h4 className="text-sm font-semibold text-neuro-text">Content Simplification</h4>
              <p className="text-xs text-neuro-textMuted">
                Condenses dense multi-paragraph sections into digestible visual summaries and key takeaways.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-neuro-border shadow-subtle space-y-2">
              <Layers className="w-5 h-5 text-violet-600" />
              <h4 className="text-sm font-semibold text-neuro-text">Micro-Section Chunking</h4>
              <p className="text-xs text-neuro-textMuted">
                Breaks extensive educational modules into self-contained 3-minute micro-learning sprints.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-neuro-border shadow-subtle space-y-2">
              <Sliders className="w-5 h-5 text-neuro-purple" />
              <h4 className="text-sm font-semibold text-neuro-text">Dynamic Playback Adjustment</h4>
              <p className="text-xs text-neuro-textMuted">
                Modulates video/audio pace automatically to match estimated cognitive absorption.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-neuro-border shadow-subtle space-y-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              <h4 className="text-sm font-semibold text-neuro-text">Interactive Pulse Quizzes</h4>
              <p className="text-xs text-neuro-textMuted">
                Injects timely 1-question check-ins when attention latency patterns begin to diverge.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-neuro-border shadow-subtle space-y-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h4 className="text-sm font-semibold text-neuro-text">Personalized Recommendations</h4>
              <p className="text-xs text-neuro-textMuted">
                Curates context-relevant review questions and alternative multimedia resources.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-neuro-border shadow-subtle space-y-2">
              <Brain className="w-5 h-5 text-neuro-purple" />
              <h4 className="text-sm font-semibold text-neuro-text">Attention Drift Telemetry</h4>
              <p className="text-xs text-neuro-textMuted">
                Aggregates student engagement logs for longitudinal metacognitive self-awareness.
              </p>
            </div>
          </div>
        </section>

        {/* Milestone Callout Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-neuro-lavenderBg to-white border border-neuro-purple/20 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-neuro-text">
              Authentication Module Ready
            </h3>
            <p className="text-xs text-neuro-textMuted mt-1 max-w-2xl">
              Student registration, secure login with bcryptjs password hashing, JWT authorization, and input validation are active.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/register">
              <Button size="md" icon={UserPlus}>
                Register Student
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
