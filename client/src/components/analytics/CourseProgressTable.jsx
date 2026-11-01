import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

/**
 * Course Progress Breakdown Table
 * Shows enrolled courses, completion percentage, completed vs total lessons, and last access date.
 */
export const CourseProgressTable = ({ courses = [], loading = false }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-neuro-border shadow-card">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-200">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neuro-text tracking-tight">
              Course Progress & Curriculum Status
            </h3>
            <p className="text-xs text-neuro-textMuted">
              Tracking completed modules across all enrolled programs
            </p>
          </div>
        </div>

        <Link
          to="/my-courses"
          className="text-xs font-semibold text-neuro-purple hover:text-neuro-purpleHover flex items-center gap-1 transition-colors"
        >
          View All Courses
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-neuro-textMuted">
          <div className="w-6 h-6 border-2 border-neuro-purple border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading course progress records...
        </div>
      ) : !courses || courses.length === 0 ? (
        <div className="py-10 text-center bg-slate-50 rounded-xl border border-dashed border-neuro-border">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-neuro-text">No course enrollments found</p>
          <p className="text-[11px] text-neuro-textMuted mt-1 mb-3">
            Explore the catalog and enroll in adaptive courses to start tracking progress.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-neuro-purple rounded-xl shadow-purple-btn hover:bg-neuro-purpleHover transition-all"
          >
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neuro-border text-[11px] font-semibold text-neuro-textMuted uppercase tracking-wider">
                <th className="pb-3 pr-4">Course Name</th>
                <th className="pb-3 px-4">Completion</th>
                <th className="pb-3 px-4">Lessons</th>
                <th className="pb-3 px-4">Last Accessed</th>
                <th className="pb-3 pl-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neuro-border text-xs">
              {courses.map((course) => {
                const isCompleted = course.progressPercentage >= 100 || course.status === 'completed';
                return (
                  <tr key={course.courseId || course._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="font-semibold text-neuro-text hover:text-neuro-purple transition-colors">
                        <Link to={`/courses/${course.slug}`}>
                          {course.courseTitle}
                        </Link>
                      </div>
                      <span className="text-[11px] text-neuro-textMuted capitalize">
                        {course.category || 'Adaptive Curriculum'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-neuro-lavender/60 rounded-full h-2 overflow-hidden border border-neuro-border">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCompleted ? 'bg-emerald-500' : 'bg-neuro-purple'
                            }`}
                            style={{ width: `${Math.min(100, course.progressPercentage || 0)}%` }}
                          />
                        </div>
                        <span className="font-bold text-neuro-text text-xs min-w-[32px] text-right">
                          {course.progressPercentage || 0}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-neuro-textMuted">
                      <span className="font-semibold text-neuro-text">
                        {course.completedLessonsCount || 0}
                      </span>
                      /{course.totalLessonsCount || 0} completed
                    </td>

                    <td className="py-3.5 px-4 text-neuro-textMuted">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-neuro-textMuted" />
                        <span>{course.lastAccessedFormatted || 'Recently'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 pl-4 text-right">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Mastered
                        </span>
                      ) : (
                        <Link
                          to={`/courses/${course.slug}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-neuro-lavender text-neuro-purple hover:bg-neuro-purple hover:text-white text-xs font-semibold transition-all duration-150"
                        >
                          Resume
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CourseProgressTable;
