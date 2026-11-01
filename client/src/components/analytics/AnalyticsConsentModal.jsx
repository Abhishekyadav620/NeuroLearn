import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  X,
  Check,
  Eye,
  Video,
  BookOpen,
  Award,
  Database,
  Lock,
  AlertCircle,
} from 'lucide-react';
import analyticsService from '../../services/analyticsService.js';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Transparent Learning Analytics Privacy & Consent Modal
 * Empowers students with granular control over telemetry and research contributions.
 */
export const AnalyticsConsentModal = ({ isOpen, onClose, onPreferencesUpdated }) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const [consent, setConsent] = useState(true);
  const [trackReading, setTrackReading] = useState(true);
  const [trackVideo, setTrackVideo] = useState(true);
  const [trackQuiz, setTrackQuiz] = useState(true);
  const [allowAnonymizedResearch, setAllowAnonymizedResearch] = useState(true);

  // Initialize from user or fetch from backend
  useEffect(() => {
    if (!isOpen) return;

    const loadPrefs = async () => {
      setLoading(true);
      try {
        const res = await analyticsService.getPreferences();
        if (res?.success && res.data) {
          const p = res.data;
          setConsent(p.analyticsConsent !== false);
          setTrackReading(p.analyticsPreferences?.trackReading !== false);
          setTrackVideo(p.analyticsPreferences?.trackVideo !== false);
          setTrackQuiz(p.analyticsPreferences?.trackQuiz !== false);
          setAllowAnonymizedResearch(p.analyticsPreferences?.allowAnonymizedResearch !== false);
        }
      } catch (err) {
        // Fallback to user context
        if (user) {
          setConsent(user.analyticsConsent !== false);
          setTrackReading(user.analyticsPreferences?.trackReading !== false);
          setTrackVideo(user.analyticsPreferences?.trackVideo !== false);
          setTrackQuiz(user.analyticsPreferences?.trackQuiz !== false);
          setAllowAnonymizedResearch(user.analyticsPreferences?.allowAnonymizedResearch !== false);
        }
      } finally {
        setLoading(false);
      }
    };

    loadPrefs();
  }, [isOpen, user]);

  const handleSave = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const payload = {
        consent,
        trackReading,
        trackVideo,
        trackQuiz,
        allowAnonymizedResearch,
      };

      const res = await analyticsService.updatePreferences(payload);
      if (res?.success) {
        setStatusMsg({ type: 'success', text: 'Privacy preferences saved successfully.' });
        if (updateUser) {
          updateUser({
            ...user,
            analyticsConsent: consent,
            analyticsPreferences: {
              trackReading,
              trackVideo,
              trackQuiz,
              allowAnonymizedResearch,
            },
          });
        }
        if (onPreferencesUpdated) onPreferencesUpdated();
        setTimeout(() => {
          onClose();
          setStatusMsg(null);
        }, 1200);
      } else {
        setStatusMsg({ type: 'error', text: res?.message || 'Could not save preferences.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err?.message || 'Failed to update preferences.' });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-neuro-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neuro-border flex items-center justify-between bg-neuro-lavender/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neuro-lavender flex items-center justify-center text-neuro-purple border border-neuro-purple/20">
              <ShieldCheck className="w-5 h-5 text-neuro-purple" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neuro-text tracking-tight">
                Learning Analytics & Privacy Transparency
              </h3>
              <p className="text-xs text-neuro-textMuted">
                Configure your data collection preferences and research permissions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neuro-textMuted hover:text-neuro-text hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="px-6 py-5 overflow-y-auto space-y-5 text-xs text-neuro-text">
          {statusMsg && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2 font-medium ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {statusMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Core explanation */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-neuro-border">
            <h4 className="font-bold text-neuro-text mb-1 flex items-center gap-1.5 text-xs">
              <Lock className="w-3.5 h-3.5 text-neuro-purple" />
              Our Commitment to Student Privacy
            </h4>
            <p className="text-neuro-textMuted text-[11px] leading-relaxed">
              NeuroLearn tracks structural learning actions (like module completion and lecture playback) exclusively to calibrate adaptive study pacing. We strictly maintain student confidentiality:
            </p>
            <ul className="mt-2 space-y-1 text-[11px] text-neuro-textMuted list-disc pl-4">
              <li>No keylogging, typing content, or screen recording.</li>
              <li>No external browsing or unrelated application tracking.</li>
              <li>Your learning history is never visible to other students.</li>
              <li>Research exports are cryptographically pseudonymous (HMAC SHA-256).</li>
            </ul>
          </div>

          {/* Master Toggle */}
          <div className="p-4 rounded-2xl border border-neuro-border bg-neuro-lavender/20 flex items-center justify-between">
            <div>
              <p className="font-bold text-neuro-text text-sm">Learning Behaviour Analytics</p>
              <p className="text-[11px] text-neuro-textMuted mt-0.5 max-w-sm">
                Enables telemetry logging to generate your personal study dashboard and recommendations.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neuro-purple" />
            </label>
          </div>

          {/* Granular Telemetry Settings */}
          <div className={`space-y-3 transition-opacity ${consent ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <span className="text-[11px] font-bold text-neuro-textMuted uppercase tracking-wider block">
              Granular Telemetry Permissions
            </span>

            {/* Reading */}
            <div className="p-3 rounded-xl border border-neuro-border flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-neuro-purple">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-neuro-text">Reading Pacing & Scroll Depth</p>
                  <p className="text-[11px] text-neuro-textMuted">Active visible time and scroll percentages</p>
                </div>
              </div>
              <input
                type="checkbox"
                disabled={!consent}
                checked={trackReading}
                onChange={(e) => setTrackReading(e.target.checked)}
                className="w-4 h-4 text-neuro-purple rounded border-slate-300 focus:ring-neuro-purple cursor-pointer"
              />
            </div>

            {/* Video */}
            <div className="p-3 rounded-xl border border-neuro-border flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-neuro-text">Video Playback Telemetry</p>
                  <p className="text-[11px] text-neuro-textMuted">Completion rate, pauses, and playback speed</p>
                </div>
              </div>
              <input
                type="checkbox"
                disabled={!consent}
                checked={trackVideo}
                onChange={(e) => setTrackVideo(e.target.checked)}
                className="w-4 h-4 text-neuro-purple rounded border-slate-300 focus:ring-neuro-purple cursor-pointer"
              />
            </div>

            {/* Quiz */}
            <div className="p-3 rounded-xl border border-neuro-border flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-neuro-text">Quiz Interaction Pacing</p>
                  <p className="text-[11px] text-neuro-textMuted">Question answer duration and attempt frequency</p>
                </div>
              </div>
              <input
                type="checkbox"
                disabled={!consent}
                checked={trackQuiz}
                onChange={(e) => setTrackQuiz(e.target.checked)}
                className="w-4 h-4 text-neuro-purple rounded border-slate-300 focus:ring-neuro-purple cursor-pointer"
              />
            </div>

            {/* Anonymized ML research */}
            <div className="p-3 rounded-xl border border-neuro-border flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-neuro-text">Anonymized ML Dataset Contribution</p>
                  <p className="text-[11px] text-neuro-textMuted">Share de-identified metrics to train adaptive models</p>
                </div>
              </div>
              <input
                type="checkbox"
                disabled={!consent}
                checked={allowAnonymizedResearch}
                onChange={(e) => setAllowAnonymizedResearch(e.target.checked)}
                className="w-4 h-4 text-neuro-purple rounded border-slate-300 focus:ring-neuro-purple cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-neuro-border bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neuro-textMuted hover:text-neuro-text transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="px-5 py-2.5 rounded-xl bg-neuro-purple hover:bg-neuro-purpleHover text-white text-xs font-semibold shadow-purple-btn transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Preferences
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsConsentModal;
