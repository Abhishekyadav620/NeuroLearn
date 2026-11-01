import React from 'react';
import { Clock, CheckCircle2, Award, BookOpen, Flame } from 'lucide-react';

/**
 * Overview Metric Cards for Student Learning Analytics
 * Displays total hours, completed lessons, average quiz score, enrolled courses, and streak.
 */
export const AnalyticsOverviewCards = ({ overview = {}, loading = false }) => {
  const cards = [
    {
      id: 'hours',
      title: 'Total Learning Time',
      value: loading ? '...' : `${overview?.totalLearningHours || '0.0'} hrs`,
      subtitle: `${overview?.totalLearningMinutes || 0} active minutes logged`,
      icon: Clock,
      iconColor: 'text-neuro-purple',
      bgColor: 'bg-neuro-lavender',
      borderColor: 'border-neuro-purple/15',
    },
    {
      id: 'lessons',
      title: 'Lessons Completed',
      value: loading ? '...' : String(overview?.totalLessonsCompleted || 0),
      subtitle: `${overview?.completionRate || 0}% overall course completion`,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
    {
      id: 'quiz',
      title: 'Average Quiz Score',
      value: loading ? '...' : `${overview?.averageQuizScore || 0}%`,
      subtitle: `Across ${overview?.totalQuizAttempts || 0} quiz attempts`,
      icon: Award,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    {
      id: 'courses',
      title: 'Courses Enrolled',
      value: loading ? '...' : String(overview?.totalCoursesEnrolled || 0),
      subtitle: `${overview?.activeCoursesCount || 0} active in progress`,
      icon: BookOpen,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
    },
    {
      id: 'streak',
      title: 'Learning Streak',
      value: loading ? '...' : `${overview?.streakDays || 0} ${overview?.streakDays === 1 ? 'Day' : 'Days'}`,
      subtitle: overview?.streakDays > 0 ? 'Consistent learning streak' : 'Study today to start your streak',
      icon: Flame,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className="bg-white rounded-2xl p-5 border border-neuro-border shadow-card hover:shadow-cardHover transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-neuro-textMuted uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`w-9 h-9 rounded-xl ${card.bgColor} ${card.borderColor} border flex items-center justify-center`}>
                <IconComponent className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-neuro-text tracking-tight mb-1">
                {card.value}
              </h3>
              <p className="text-xs text-neuro-textMuted truncate">
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnalyticsOverviewCards;
