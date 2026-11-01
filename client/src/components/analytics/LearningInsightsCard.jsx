import React from 'react';
import {
  Compass,
  Calendar,
  Clock,
  RotateCcw,
  Video,
  BookOpen,
  Info,
  ShieldCheck,
} from 'lucide-react';

/**
 * Measurable Learning Behaviour Insights Component
 * Displays empirical interaction signals without pseudo-scientific cognitive claims.
 */
export const LearningInsightsCard = ({ insights = {}, loading = false }) => {
  const {
    mostActiveDay = 'No session data',
    averageSessionMinutes = 0,
    averageVideoCompletionPercentage = 0,
    totalReadingMinutes = 0,
    revisitedLessonsCount = 0,
    topRevisitedLesson = null,
  } = insights;

  const metrics = [
    {
      title: 'Peak Learning Day',
      value: mostActiveDay,
      description: 'Day of week with highest cumulative study time',
      icon: Calendar,
      color: 'text-neuro-purple',
      bg: 'bg-neuro-lavender',
    },
    {
      title: 'Avg. Session Length',
      value: `${averageSessionMinutes} mins`,
      description: 'Continuous active learning engagement window',
      icon: Clock,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'Video Completion',
      value: `${averageVideoCompletionPercentage}%`,
      description: 'Average proportion of lecture content watched',
      icon: Video,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Active Reading Time',
      value: `${totalReadingMinutes} mins`,
      description: 'Accumulated active visible page reading duration',
      icon: BookOpen,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Curriculum Revisits',
      value: `${revisitedLessonsCount} times`,
      description: topRevisitedLesson
        ? `Most reviewed: "${topRevisitedLesson}"`
        : 'Re-accessing previously completed material for review',
      icon: RotateCcw,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-neuro-border shadow-card flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-neuro-lavender flex items-center justify-center text-neuro-purple border border-neuro-purple/15">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neuro-text tracking-tight">
              Learning Behaviour Insights
            </h3>
            <p className="text-xs text-neuro-textMuted">
              Empirical interaction patterns and engagement metrics
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-neuro-textMuted">
            <div className="w-6 h-6 border-2 border-neuro-purple border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Synthesizing behavioural metrics...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            {metrics.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-neuro-border hover:bg-white hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center`}>
                      <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                    </div>
                    <span className="text-[11px] font-semibold text-neuro-textMuted uppercase truncate">
                      {item.title}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-neuro-text mb-1 truncate">
                    {item.value}
                  </div>
                  <p className="text-[11px] text-neuro-textMuted leading-snug line-clamp-2">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transparent Disclaimer Box */}
      <div className="p-3.5 rounded-xl bg-neuro-lavender/30 border border-neuro-purple/15 flex items-start gap-2.5 text-xs">
        <ShieldCheck className="w-4 h-4 text-neuro-purple flex-shrink-0 mt-0.5" />
        <div className="text-neuro-textMuted text-[11px] leading-relaxed">
          <strong className="text-neuro-text font-semibold">Empirical Interaction Transparency: </strong>
          NeuroLearn computes active study telemetry solely to tailor curriculum pacing and recommend review intervals.
          These indicators reflect observable interactions (such as video watch completion and reading duration) and do not evaluate cognitive capacity, intelligence, or involuntary attention.
        </div>
      </div>
    </div>
  );
};

export default LearningInsightsCard;
