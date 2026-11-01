import React from 'react';
import { ShieldCheck, Cpu, Code2 } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-neuro-border bg-white text-neuro-textMuted text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand & Privacy Statement */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-neuro-purple font-bold text-base">NeuroLearn</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-neuro-lavender text-neuro-purple border border-neuro-purple/20">
                Capstone Project
              </span>
            </div>
            <p className="text-xs text-neuro-textMuted leading-relaxed">
              AI-powered adaptive learning system utilizing behavioral signal processing to detect attention drift and dynamically adapt learning journeys.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Privacy-First: Zero gaze/camera capture without explicit opt-in.</span>
            </div>
          </div>

          {/* Architecture Pillars */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neuro-text flex items-center gap-2">
              <Cpu className="w-4 h-4 text-neuro-purple" />
              Architecture Pillars
            </h4>
            <ul className="text-xs space-y-1.5 text-neuro-textMuted">
              <li>• Monorepo: Client (Vite + React) & Server (Express + Node)</li>
              <li>• Behavioral Telemetry (Scroll, Cursor, Pacing, Quizzes)</li>
              <li>• Adaptive State Engine (Cognitive Drift Mitigation)</li>
              <li>• Authentication & Role-Based Access Architecture</li>
            </ul>
          </div>

          {/* Foundation & Next Steps */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neuro-text flex items-center gap-2">
              <Code2 className="w-4 h-4 text-neuro-purpleLight" />
              Authentication & Milestone 4
            </h4>
            <p className="text-xs text-neuro-textMuted leading-relaxed">
              Production-ready Student Login & Registration module with bcryptjs hashing, JWT authorization, and server-side validation.
            </p>
            <p className="text-[11px] text-neuro-textMuted">
              Authentication API mounted at <code className="text-neuro-purple font-mono bg-neuro-lavender px-1.5 py-0.5 rounded">/api/auth/*</code>
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neuro-border flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
          <p>© {new Date().getFullYear()} NeuroLearn Adaptive Learning Systems. All rights reserved.</p>
          <div className="flex items-center gap-4 text-neuro-textMuted">
            <span>Production MERN Architecture</span>
            <span>•</span>
            <span>Authentication Module</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
