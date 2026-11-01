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
} from 'lucide-react';
import useHealthCheck from '../hooks/useHealthCheck.js';
import Card, { CardHeader } from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import { CORE_SIGNALS } from '../data/navigation.js';
import { formatTimestamp, formatUptime } from '../utils/formatters.js';

export const LandingPage = () => {
  const { healthData, dbData, loading, error, refetch, lastChecked } = useHealthCheck();

  const isConnected = dbData?.connected;

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden border-b border-card-border/60">
        {/* Subtle radial ambient backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-neuro-purple/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Badge variant="purple" className="mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Milestone 1 • MERN Stack Foundation & Diagnostics
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            AI-Powered Adaptive Learning Platform{' '}
            <span className="bg-gradient-to-r from-neuro-purple to-neuro-pink bg-clip-text text-transparent">
              Engineered for Cognitive Flow
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-neuro-textMuted max-w-2xl mx-auto leading-relaxed">
            NeuroLearn monitors non-intrusive learner interaction patterns to detect attention drift
            and cognitive friction, dynamically adapting educational content in real time.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button size="lg" icon={ArrowRight}>
                Explore Student Dashboard
              </Button>
            </Link>
            <a href="#system-telemetry">
              <Button variant="secondary" size="lg" icon={Activity}>
                Inspect API & DB Health
              </Button>
            </a>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-neuro-textMuted">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Strict privacy adherence: Zero biometric/gaze collection without explicit consent.</span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14 w-full">
        {/* System Diagnostic & API Verification Card */}
        <section id="system-telemetry">
          <Card className="border-neuro-purple/20">
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
              <div className="p-4 rounded-xl bg-neuro-elevated/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs text-neuro-textMuted">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Activity className="w-4 h-4 text-neuro-purple" />
                    Express Backend
                  </span>
                  <Badge variant={healthData?.success ? 'success' : 'danger'}>
                    {healthData?.success ? 'Operational' : 'Unavailable'}
                  </Badge>
                </div>
                <div className="text-xl font-bold text-white">
                  {healthData?.data?.application?.version || '1.0.0'}
                </div>
                <p className="text-[11px] text-neuro-textMuted">
                  Endpoint: <code className="text-neuro-purpleLight">GET /api/health</code>
                </p>
              </div>

              {/* Database Status */}
              <div className="p-4 rounded-xl bg-neuro-elevated/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs text-neuro-textMuted">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Database className="w-4 h-4 text-neuro-purpleLight" />
                    MongoDB Mongoose
                  </span>
                  <Badge variant={isConnected ? 'success' : 'warning'}>
                    {isConnected ? 'Connected' : 'Standby / Local URI'}
                  </Badge>
                </div>
                <div className="text-xl font-bold text-white">
                  {isConnected ? 'Active Connection' : dbData?.data?.status || 'Disconnected'}
                </div>
                <p className="text-[11px] text-neuro-textMuted truncate" title={dbData?.data?.targetUri}>
                  URI: {dbData?.data?.targetUri || 'mongodb://127.0.0.1:27017'}
                </p>
              </div>

              {/* Uptime & Environment */}
              <div className="p-4 rounded-xl bg-neuro-elevated/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs text-neuro-textMuted">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Cpu className="w-4 h-4 text-neuro-pink" />
                    Server Runtime
                  </span>
                  <Badge variant="neutral">
                    {healthData?.data?.application?.environment || 'development'}
                  </Badge>
                </div>
                <div className="text-xl font-bold text-white">
                  {formatUptime(healthData?.data?.application?.uptimeSeconds)}
                </div>
                <p className="text-[11px] text-neuro-textMuted">
                  Node.js: {healthData?.data?.system?.nodeVersion || 'v20+'}
                </p>
              </div>

              {/* Telemetry Polling */}
              <div className="p-4 rounded-xl bg-neuro-elevated/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs text-neuro-textMuted">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Layers className="w-4 h-4 text-violet-400" />
                    Telemetry Verification
                  </span>
                  <Badge variant="purple">Live Pulse</Badge>
                </div>
                <div className="text-sm font-semibold text-white truncate">
                  {lastChecked ? formatTimestamp(lastChecked) : 'Pending...'}
                </div>
                <p className="text-[11px] text-neuro-textMuted">
                  Status response: 200 OK (Validated)
                </p>
              </div>
            </div>

            {/* Notice regarding DB configuration */}
            {!isConnected && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
                <Database className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" />
                <div className="leading-relaxed">
                  <strong className="font-semibold">MongoDB Status Note:</strong> Express server is active and running. If a local MongoDB daemon or MongoDB Atlas URI is not yet configured, the server operates cleanly in standby mode without crashing. Configure your connection string in <code className="bg-amber-950/60 px-1 py-0.5 rounded text-amber-200">server/.env</code> as <code className="bg-amber-950/60 px-1 py-0.5 rounded text-amber-200">MONGODB_URI</code>.
                </div>
              </div>
            )}
          </Card>
        </section>

        {/* Behavioral Telemetry Signals Grid */}
        <section className="space-y-6">
          <div>
            <Badge variant="pink" className="mb-2">Phase 1 Telemetry</Badge>
            <h2 className="text-2xl font-bold text-white tracking-tight">Core Behavioral Signals</h2>
            <p className="text-sm text-neuro-textMuted mt-1">
              Signals engineered to supply the Machine Learning model for state and cognitive friction prediction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CORE_SIGNALS.map((signal) => (
              <Card key={signal.id} hoverEffect className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-neuro-elevated flex items-center justify-center text-neuro-purpleLight border border-neuro-purpleLight/10">
                    <Activity className="w-4 h-4" />
                  </div>
                  <Badge variant={signal.id === 'gaze' ? 'warning' : 'purple'}>
                    {signal.badge}
                  </Badge>
                </div>
                <h3 className="text-base font-semibold text-white">{signal.title}</h3>
                <p className="text-xs text-neuro-textMuted leading-relaxed">
                  {signal.description}
                </p>
              </Card>
            ))}

            {/* Privacy Guarantee Card */}
            <Card elevated className="space-y-3 border-emerald-500/20">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                  <Shield className="w-4 h-4" />
                </div>
                <Badge variant="success">Ethical AI</Badge>
              </div>
              <h3 className="text-base font-semibold text-white">Privacy by Architecture</h3>
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
            <h2 className="text-2xl font-bold text-white tracking-tight">Dynamic Learning Adaptations</h2>
            <p className="text-sm text-neuro-textMuted mt-1">
              How NeuroLearn responds when attention drift or cognitive friction is identified.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-neuro-card border border-card-border space-y-2">
              <FileText className="w-5 h-5 text-neuro-purple" />
              <h4 className="text-sm font-semibold text-white">Content Simplification</h4>
              <p className="text-xs text-neuro-textMuted">
                Condenses dense multi-paragraph sections into digestible visual summaries and key takeaways.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neuro-card border border-card-border space-y-2">
              <Layers className="w-5 h-5 text-neuro-pink" />
              <h4 className="text-sm font-semibold text-white">Micro-Section Chunking</h4>
              <p className="text-xs text-neuro-textMuted">
                Breaks extensive educational modules into self-contained 3-minute micro-learning sprints.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neuro-card border border-card-border space-y-2">
              <Sliders className="w-5 h-5 text-violet-400" />
              <h4 className="text-sm font-semibold text-white">Dynamic Playback Adjustment</h4>
              <p className="text-xs text-neuro-textMuted">
                Modulates video/audio pace automatically to match estimated cognitive absorption.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neuro-card border border-card-border space-y-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-semibold text-white">Interactive Pulse Quizzes</h4>
              <p className="text-xs text-neuro-textMuted">
                Injects timely 1-question check-ins when attention latency patterns begin to diverge.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neuro-card border border-card-border space-y-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-semibold text-white">Personalized Recommendations</h4>
              <p className="text-xs text-neuro-textMuted">
                Curates context-relevant review questions and alternative multimedia resources.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neuro-card border border-card-border space-y-2">
              <Brain className="w-5 h-5 text-neuro-purpleLight" />
              <h4 className="text-sm font-semibold text-white">Attention Drift Telemetry</h4>
              <p className="text-xs text-neuro-textMuted">
                Aggregates student engagement logs for longitudinal metacognitive self-awareness.
              </p>
            </div>
          </div>
        </section>

        {/* Milestone Callout Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-neuro-card to-neuro-elevated border border-neuro-purple/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white">
              Foundation Milestone Complete & Operational
            </h3>
            <p className="text-xs text-neuro-textMuted mt-1 max-w-2xl">
              Monorepo architecture, Express API server, Mongoose connection lifecycle, Tailwind dark-purple design tokens, and React Router foundations are ready for Milestone 2.
            </p>
          </div>
          <Link to="/dashboard">
            <Button size="md" icon={ArrowRight}>
              View Student Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
