import React, { useState, useEffect, useCallback } from 'react';
import {
  Brain,
  Shield,
  Download,
  RotateCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import analyticsService from '../services/analyticsService.js';
import AnalyticsOverviewCards from '../components/analytics/AnalyticsOverviewCards.jsx';
import WeeklyActivityChart from '../components/analytics/WeeklyActivityChart.jsx';
import QuizPerformanceChart from '../components/analytics/QuizPerformanceChart.jsx';
import CourseProgressTable from '../components/analytics/CourseProgressTable.jsx';
import LearningInsightsCard from '../components/analytics/LearningInsightsCard.jsx';
import RecentActivityTimeline from '../components/analytics/RecentActivityTimeline.jsx';
import AnalyticsConsentModal from '../components/analytics/AnalyticsConsentModal.jsx';

/**
 * Student Learning Analytics Dashboard Page
 * Route: /analytics
 */
export const LearningAnalytics = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [exportingDataset, setExportingDataset] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Analytics states
  const [overview, setOverview] = useState(null);
  const [weeklyActivity, setWeeklyActivity] = useState(null);
  const [courseProgress, setCourseProgress] = useState([]);
  const [quizPerformance, setQuizPerformance] = useState(null);
  const [learningInsights, setLearningInsights] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);

  // Fetch all analytics datasets concurrently
  const fetchAllAnalytics = useCallback(async () => {
    try {
      setError(null);
      const [
        overviewRes,
        weeklyRes,
        courseRes,
        quizRes,
        insightsRes,
        recentRes,
      ] = await Promise.all([
        analyticsService.getOverview().catch(() => ({ data: null })),
        analyticsService.getWeeklyActivity().catch(() => ({ data: null })),
        analyticsService.getCourseProgress().catch(() => ({ data: [] })),
        analyticsService.getQuizPerformance().catch(() => ({ data: null })),
        analyticsService.getLearningInsights().catch(() => ({ data: null })),
        analyticsService.getRecentActivity(15).catch(() => ({ data: [] })),
      ]);

      if (overviewRes?.data) setOverview(overviewRes.data);
      if (weeklyRes?.data) setWeeklyActivity(weeklyRes.data);
      if (courseRes?.data) setCourseProgress(courseRes.data);
      if (quizRes?.data) setQuizPerformance(quizRes.data);
      if (insightsRes?.data) setLearningInsights(insightsRes.data);
      if (recentRes?.data) setRecentActivities(recentRes.data);
    } catch (err) {
      setError(err?.message || 'Failed to load learning analytics data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllAnalytics();
  }, [fetchAllAnalytics]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllAnalytics();
  };

  const handleExportDataset = async () => {
    try {
      setExportingDataset(true);
      await analyticsService.exportDataset();
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err) {
      alert(`Export failed: ${err?.message || 'Access restricted to administrators'}`);
    } finally {
      setExportingDataset(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neuro-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neuro-lavender text-neuro-purple text-xs font-semibold border border-neuro-purple/15">
                <Brain className="w-3.5 h-3.5 text-neuro-purple" />
                Adaptive Learning Analytics
              </span>
              {user?.analyticsConsent === false && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
                  Telemetry Paused
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-neuro-text tracking-tight">
              Learning Behaviour & Progress Analytics
            </h1>
            <p className="text-xs sm:text-sm text-neuro-textMuted max-w-2xl">
              Real-time telemetry measuring study pacing, reading depth, video lecture completion, and knowledge retention across all active curriculums.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="p-2.5 rounded-xl bg-slate-50 border border-neuro-border text-neuro-text hover:bg-slate-100 transition-all flex items-center justify-center disabled:opacity-50"
              title="Refresh Analytics Telemetry"
            >
              <RotateCw className={`w-4 h-4 text-neuro-textMuted ${refreshing ? 'animate-spin text-neuro-purple' : ''}`} />
            </button>

            <button
              onClick={() => setIsConsentModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-neuro-border hover:bg-slate-50 text-neuro-text text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
            >
              <Sliders className="w-4 h-4 text-neuro-purple" />
              <span>Privacy & Consent</span>
            </button>

            {user?.role === 'admin' && (
              <button
                onClick={handleExportDataset}
                disabled={exportingDataset}
                className="px-4 py-2.5 rounded-xl bg-neuro-purple hover:bg-neuro-purpleHover text-white text-xs font-semibold shadow-purple-btn transition-all flex items-center gap-2 disabled:opacity-50"
                title="Download anonymized feature matrix for Machine Learning preparation"
              >
                {exportingDataset ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : exportSuccess ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <Download className="w-4 h-4 text-white" />
                )}
                <span>{exportSuccess ? 'CSV Exported' : 'Export ML Dataset (CSV)'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* SECTION A: Overview Metric Cards */}
        <AnalyticsOverviewCards overview={overview} loading={loading} />

        {/* SECTION B & D: Weekly Activity Bar Chart & Quiz Mastery Progression */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeeklyActivityChart
            data={weeklyActivity?.days}
            totalWeeklyHours={weeklyActivity?.totalWeeklyHours}
            loading={loading}
          />
          <QuizPerformanceChart
            performance={quizPerformance}
            loading={loading}
          />
        </div>

        {/* SECTION C: Course Progress & Curriculum Mastery Table */}
        <CourseProgressTable
          courses={courseProgress}
          loading={loading}
        />

        {/* SECTION E: Measurable Learning Behaviour Insights */}
        <LearningInsightsCard
          insights={learningInsights}
          loading={loading}
        />

        {/* SECTION F: Chronological Activity Feed */}
        <RecentActivityTimeline
          activities={recentActivities}
          loading={loading}
        />
      </div>

      {/* Privacy and Telemetry Consent Modal */}
      <AnalyticsConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        onPreferencesUpdated={fetchAllAnalytics}
      />
    </div>
  );
};

export default LearningAnalytics;
