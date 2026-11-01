import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  BookOpen,
  Play,
  CheckCircle2,
  Calendar,
  Brain,
  ArrowRight,
} from 'lucide-react';
import Badge from '../ui/Badge.jsx';

/**
 * Fallback Thumbnail for My Courses
 */
const FallbackThumb = ({ category, title }) => (
  <div className="w-full h-full bg-gradient-to-br from-neuro-lavender via-[#FAF7FF] to-white flex flex-col items-center justify-center p-4 text-center">
    <Brain className="w-6 h-6 text-neuro-purple mb-1" />
    <span className="text-[10px] font-bold text-neuro-purple uppercase tracking-wider">
      {category}
    </span>
  </div>
);

export const CourseProgressCard = ({ enrollment }) => {
  const [imageError, setImageError] = useState(false);

  if (!enrollment || !enrollment.course) return null;

  const { course, progress = 0, status, enrolledAt, lastAccessedAt, completedLessons = [] } = enrollment;

  const instructorName =
    course.instructor?.fullName ||
    (typeof course.instructor === 'string' ? course.instructor : 'Dr. Elena Vance');

  const formattedEnrolledDate = enrolledAt
    ? new Date(enrolledAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  const formattedLastAccessed = lastAccessedAt
    ? new Date(lastAccessedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : 'Today';

  const isCompleted = status === 'completed' || progress >= 100;

  return (
    <div className="bg-white rounded-2xl border border-neuro-border hover:border-neuro-purple/30 shadow-subtle hover:shadow-card transition-all p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
      {/* Left: Thumbnail & Core Info */}
      <div className="flex items-start gap-4 flex-1">
        <div className="w-24 sm:w-28 aspect-[16/10] rounded-xl overflow-hidden bg-slate-50 border border-neuro-border shrink-0">
          {course.thumbnail && !imageError ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <FallbackThumb category={course.category} title={course.title} />
          )}
        </div>

        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-neuro-purple px-2 py-0.5 rounded-full bg-neuro-lavender">
              {course.category}
            </span>
            <span className="text-xs text-neuro-textMuted">•</span>
            <span className="text-xs text-neuro-textMuted">{course.level}</span>
          </div>

          <Link to={`/courses/${course.slug}`}>
            <h3 className="text-base font-bold text-neuro-text hover:text-neuro-purple transition-colors truncate">
              {course.title}
            </h3>
          </Link>

          <div className="flex items-center gap-4 text-xs text-neuro-textMuted">
            <span>Instructor: <strong className="text-neuro-text">{instructorName}</strong></span>
            <span className="hidden sm:inline-block">•</span>
            <span className="hidden sm:flex items-center gap-1">
              <Calendar className="w-3 h-3 text-neuro-purpleLight" />
              Enrolled: {formattedEnrolledDate}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Progress Bar & Action CTA */}
      <div className="w-full md:w-72 space-y-3 pt-3 md:pt-0 border-t md:border-t-0 border-neuro-border">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-neuro-text font-semibold flex items-center gap-1">
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Course Completed</span>
                </>
              ) : (
                <span>In Progress</span>
              )}
            </span>
            <span className="font-bold text-neuro-purple">{progress}%</span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted ? 'bg-emerald-500' : 'bg-neuro-purple'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-neuro-textMuted mt-1.5">
            <span>
              {completedLessons.length} of {course.totalLessons || 0} lessons completed
            </span>
            <span>Active: {formattedLastAccessed}</span>
          </div>
        </div>

        <Link
          to={`/courses/${course.slug}`}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-neuro-purple hover:bg-neuro-purpleHover shadow-purple-btn transition-all"
        >
          <span>{isCompleted ? 'Review Material' : 'Continue Learning'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default CourseProgressCard;
