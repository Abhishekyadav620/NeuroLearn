import React from 'react';
import CourseCard from './CourseCard.jsx';
import { BookOpen, SearchX, RotateCcw } from 'lucide-react';
import Button from '../common/Button.jsx';

/**
 * Animated Loading Skeleton Card
 */
const CourseSkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-neuro-border overflow-hidden shadow-subtle animate-pulse">
    <div className="aspect-[16/9] w-full bg-slate-100" />
    <div className="p-5 space-y-4">
      <div className="flex justify-between items-center">
        <div className="w-16 h-3 bg-slate-100 rounded" />
        <div className="w-10 h-3 bg-slate-100 rounded" />
      </div>
      <div className="w-4/5 h-4 bg-slate-200 rounded" />
      <div className="space-y-1.5">
        <div className="w-full h-3 bg-slate-100 rounded" />
        <div className="w-2/3 h-3 bg-slate-100 rounded" />
      </div>
      <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
        <div className="w-20 h-3 bg-slate-100 rounded" />
        <div className="w-12 h-3 bg-slate-100 rounded" />
      </div>
      <div className="w-full h-9 bg-slate-100 rounded-xl" />
    </div>
  </div>
);

export const CourseGrid = ({
  courses = [],
  loading = false,
  onResetFilters,
  totalCourses = 0,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <CourseSkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-neuro-border bg-white p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto shadow-subtle my-8">
        <div className="w-16 h-16 rounded-2xl bg-neuro-lavender flex items-center justify-center text-neuro-purple mb-4 shadow-sm">
          <SearchX className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-neuro-text mb-1">
          No matching courses found
        </h3>
        <p className="text-xs sm:text-sm text-neuro-textMuted max-w-md mb-6 leading-relaxed">
          We couldn't find any courses matching your active search terms or filter selection. Try adjusting your criteria or clearing filters.
        </p>
        {onResetFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            icon={RotateCcw}
          >
            Reset All Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard key={course._id || course.slug} course={course} />
      ))}
    </div>
  );
};

export default CourseGrid;
