import React from 'react';
import {
  Activity,
  CheckCircle2,
  Award,
  Video,
  BookOpen,
  RotateCcw,
  Clock,
  Sparkles,
} from 'lucide-react';

/**
 * Returns icon and color styling for an event type
 */
const getEventBadge = (eventType) => {
  switch (eventType) {
    case 'lesson_completed':
      return {
        icon: CheckCircle2,
        label: 'Lesson Completed',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        iconColor: 'text-emerald-600',
      };
    case 'quiz_submitted':
    case 'quiz_completed':
      return {
        icon: Award,
        label: 'Quiz Completed',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        iconColor: 'text-amber-600',
      };
    case 'video_completed':
    case 'video_progress':
      return {
        icon: Video,
        label: 'Video Session',
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        iconColor: 'text-indigo-600',
      };
    case 'reading_completed':
    case 'reading_progress':
      return {
        icon: BookOpen,
        label: 'Reading Progress',
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
        iconColor: 'text-neuro-purple',
      };
    case 'lesson_revisited':
      return {
        icon: RotateCcw,
        label: 'Lesson Revisit',
        badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
        iconColor: 'text-sky-600',
      };
    default:
      return {
        icon: Activity,
        label: 'Learning Interaction',
        badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
        iconColor: 'text-slate-600',
      };
  }
};

/**
 * Chronological Recent Learning Activity Timeline
 */
export const RecentActivityTimeline = ({ activities = [], loading = false }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-neuro-border shadow-card">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-neuro-lavender flex items-center justify-center text-neuro-purple border border-neuro-purple/15">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-neuro-text tracking-tight">
            Recent Activity Feed
          </h3>
          <p className="text-xs text-neuro-textMuted">
            Chronological audit of study sessions and milestones
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-neuro-textMuted">
          <div className="w-6 h-6 border-2 border-neuro-purple border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading recent activities...
        </div>
      ) : !activities || activities.length === 0 ? (
        <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-neuro-border">
          <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-neuro-text">No interactions logged yet</p>
          <p className="text-[11px] text-neuro-textMuted mt-1">
            As you interact with course materials, events will appear here in real time.
          </p>
        </div>
      ) : (
        <div className="flow-root">
          <ul className="-mb-6">
            {activities.map((item, index) => {
              const meta = getEventBadge(item.eventType);
              const Icon = meta.icon;
              const isLast = index === activities.length - 1;

              return (
                <li key={item._id || index} className="relative pb-6">
                  {!isLast && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-neuro-border"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex items-start space-x-3">
                    <div>
                      <div className="h-8 w-8 rounded-xl bg-slate-50 border border-neuro-border flex items-center justify-center">
                        <Icon className={`w-4 h-4 ${meta.iconColor}`} />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${meta.badgeColor}`}>
                          {meta.label}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-neuro-textMuted">
                          <Clock className="w-3 h-3" />
                          <span>{item.relativeTime || 'Recently'}</span>
                        </div>
                      </div>

                      <p className="text-xs font-semibold text-neuro-text">
                        {item.courseTitle || 'Enrolled Course'}
                      </p>

                      <div className="text-[11px] text-neuro-textMuted flex items-center gap-2 mt-0.5">
                        {item.lessonId && (
                          <span>Lesson: {item.lessonId}</span>
                        )}
                        {typeof item.score === 'number' && (
                          <span className="font-semibold text-amber-600">• Score: {item.score}%</span>
                        )}
                        {item.durationSeconds > 0 && (
                          <span>• {Math.round(item.durationSeconds / 60)} mins active</span>
                        )}
                        {item.progressPercentage > 0 && (
                          <span>• {item.progressPercentage}% complete</span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RecentActivityTimeline;
