import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  Clock,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Brain,
} from 'lucide-react';
import enrollmentService from '../services/enrollmentService.js';
import CourseProgressCard from '../components/courses/CourseProgressCard.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const MyCourses = () => {
  const { user } = useAuth();

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & sorting
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'completed'
  const [sortOption, setSortOption] = useState('recent'); // 'recent' | 'enrolled' | 'progress'

  const fetchMyCourses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await enrollmentService.getMyCourses({
        status: statusFilter,
        sort: sortOption,
      });

      if (response.success && response.data) {
        setEnrollments(response.data.enrollments || []);
      }
    } catch (err) {
      setError(
        err.message || 'Unable to retrieve your enrolled courses. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sortOption]);

  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  // Aggregate stats from enrollments
  const totalEnrolled = enrollments.length;
  const completedCount = enrollments.filter(
    (e) => e.status === 'completed' || e.progress >= 100
  ).length;
  const inProgressCount = totalEnrolled - completedCount;

  return (
    <div className="flex-1 bg-neuro-bg min-h-screen py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Banner / Header */}
        <div className="bg-white rounded-3xl border border-neuro-border p-6 sm:p-8 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="purple">Student Workspace</Badge>
              <Badge variant="success">Adaptive Progress Tracking</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neuro-text tracking-tight">
              My Learning Path
            </h1>
            <p className="text-xs sm:text-sm text-neuro-textMuted max-w-xl">
              Track your enrolled course curriculums, lesson completion milestones, and continue your adaptive learning sessions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/courses">
              <Button variant="outline" size="sm" icon={BookOpen}>
                Explore More Courses
              </Button>
            </Link>
          </div>
        </div>

        {/* Learning Statistics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-neuro-border p-5 shadow-subtle flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-neuro-textMuted font-medium">Total Courses</p>
              <p className="text-2xl font-bold text-neuro-text">{totalEnrolled}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-neuro-lavender flex items-center justify-center text-neuro-purple">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neuro-border p-5 shadow-subtle flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-neuro-textMuted font-medium">In Progress</p>
              <p className="text-2xl font-bold text-neuro-purple">{inProgressCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-neuro-purple">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neuro-border p-5 shadow-subtle flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-neuro-textMuted font-medium">Completed</p>
              <p className="text-2xl font-bold text-emerald-600">{completedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filters and Sorting Controls */}
        <div className="bg-white rounded-2xl border border-neuro-border p-4 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === 'all'
                  ? 'bg-neuro-purple text-white shadow-purple-btn'
                  : 'bg-slate-50 text-neuro-textMuted hover:text-neuro-text border border-neuro-border'
              }`}
            >
              All Courses ({totalEnrolled})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === 'active'
                  ? 'bg-neuro-purple text-white shadow-purple-btn'
                  : 'bg-slate-50 text-neuro-textMuted hover:text-neuro-text border border-neuro-border'
              }`}
            >
              In Progress ({inProgressCount})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === 'completed'
                  ? 'bg-neuro-purple text-white shadow-purple-btn'
                  : 'bg-slate-50 text-neuro-textMuted hover:text-neuro-text border border-neuro-border'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neuro-textMuted font-medium">Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-neuro-border rounded-xl px-3 py-1.5 text-neuro-text focus:outline-none focus:border-neuro-purple"
            >
              <option value="recent">Recently Accessed</option>
              <option value="enrolled">Enrollment Date</option>
              <option value="progress">Progress %</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={fetchMyCourses}>
              Retry
            </Button>
          </div>
        )}

        {/* Enrolled Courses List or Empty State */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-neuro-border p-6 shadow-subtle animate-pulse h-32"
              />
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-neuro-border p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto shadow-subtle">
            <div className="w-16 h-16 rounded-2xl bg-neuro-lavender flex items-center justify-center text-neuro-purple mb-4 shadow-sm">
              <GraduationCap className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-neuro-text mb-1">
              {statusFilter === 'completed'
                ? 'No completed courses yet'
                : statusFilter === 'active'
                ? 'No courses currently in progress'
                : 'You have not enrolled in any courses yet'}
            </h3>

            <p className="text-xs sm:text-sm text-neuro-textMuted max-w-sm mb-6 leading-relaxed">
              Explore our adaptive learning catalog to begin mastering artificial intelligence, cognitive web applications, and data science.
            </p>

            <Link to="/courses">
              <Button variant="primary" size="sm" icon={ArrowRight}>
                Discover Courses
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <CourseProgressCard key={enrollment._id} enrollment={enrollment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
