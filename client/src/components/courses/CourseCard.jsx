import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  BookOpen,
  Users,
  Brain,
  Star,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Badge from '../ui/Badge.jsx';

/**
 * Designed fallback thumbnail for courses without an image
 */
const FallbackThumbnail = ({ category, title }) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-neuro-lavender via-[#FAF7FF] to-white flex flex-col items-center justify-center p-6 text-center border-b border-neuro-border relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
      <div className="w-14 h-14 rounded-2xl bg-white shadow-card flex items-center justify-center text-neuro-purple border border-neuro-border/60 mb-2">
        <Brain className="w-7 h-7 text-neuro-purple" />
      </div>
      <span className="text-[11px] font-semibold text-neuro-purple tracking-wider uppercase">
        {category}
      </span>
      <p className="text-xs font-semibold text-neuro-text line-clamp-1 mt-1 max-w-[200px]">
        {title}
      </p>
    </div>
  );
};

export const CourseCard = ({ course }) => {
  const [imageError, setImageError] = useState(false);

  if (!course) return null;

  const {
    slug,
    title,
    shortDescription,
    thumbnail,
    category,
    level,
    duration,
    totalLessons,
    totalEnrollments,
    averageRating = 4.8,
    isFree,
    price,
    instructor,
  } = course;

  const instructorName =
    instructor?.fullName ||
    (typeof instructor === 'string' ? instructor : 'Elena Vance');

  return (
    <div className="group bg-white rounded-2xl border border-neuro-border hover:border-neuro-purple/30 shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col overflow-hidden">
      {/* Thumbnail Container */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-50 border-b border-neuro-border">
        {thumbnail && !imageError ? (
          <img
            src={thumbnail}
            alt={title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <FallbackThumbnail category={category} title={title} />
        )}

        {/* Floating Category and Price Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/95 backdrop-blur-sm text-neuro-purple shadow-sm border border-neuro-border">
            {category}
          </span>
        </div>

        <div className="absolute top-3 right-3 z-10">
          <span
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-sm backdrop-blur-sm ${
              isFree
                ? 'bg-emerald-50/95 text-emerald-700 border border-emerald-200'
                : 'bg-white/95 text-neuro-text border border-neuro-border'
            }`}
          >
            {isFree ? 'Free' : `$${price}`}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Metadata Row */}
          <div className="flex items-center justify-between text-xs text-neuro-textMuted">
            <span className="font-medium text-neuro-purpleLight">{level}</span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{averageRating.toFixed(1)}</span>
            </div>
          </div>

          {/* Title */}
          <Link to={`/courses/${slug}`}>
            <h3 className="text-base font-bold text-neuro-text group-hover:text-neuro-purple transition-colors line-clamp-2 leading-snug">
              {title}
            </h3>
          </Link>

          {/* Short Description */}
          <p className="text-xs text-neuro-textMuted line-clamp-2 leading-relaxed">
            {shortDescription}
          </p>
        </div>

        {/* Footer Meta & Action */}
        <div className="pt-3 border-t border-neuro-border space-y-3">
          <div className="flex items-center justify-between text-[11px] text-neuro-textMuted">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-neuro-purpleLight" />
                {duration}h
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-neuro-purpleLight" />
                {totalLessons} lessons
              </span>
            </div>

            <span className="flex items-center gap-1 text-slate-500 font-medium">
              <Users className="w-3.5 h-3.5 text-neuro-purpleLight" />
              {totalEnrollments}
            </span>
          </div>

          {/* View Course Action */}
          <Link
            to={`/courses/${slug}`}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-neuro-purple bg-neuro-lavender/60 hover:bg-neuro-purple hover:text-white border border-neuro-purple/20 transition-all duration-200"
          >
            <span>View Course</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
