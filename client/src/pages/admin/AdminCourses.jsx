import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Users,
  Clock,
  Sparkles,
  Loader2,
  Shield,
  Search,
  Layers,
  Filter,
  PlayCircle,
} from 'lucide-react';
import courseService from '../../services/courseService.js';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

export const AdminCourses = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'draft'
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toggle publish state
  const [togglingId, setTogglingId] = useState(null);

  const fetchAdminCourses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Include unpublished drafts for admin view
      const response = await courseService.getCourses({
        includeUnpublished: 'true',
        limit: 100,
      });

      if (response.success && response.data) {
        setCourses(response.data.courses || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load courses for administration.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminCourses();
  }, [fetchAdminCourses]);

  const handleTogglePublish = async (courseId) => {
    setTogglingId(courseId);
    setActionSuccess(null);
    try {
      const response = await courseService.togglePublish(courseId);
      if (response.success) {
        setCourses((prev) =>
          prev.map((c) =>
            c._id === courseId ? { ...c, isPublished: response.data.isPublished } : c
          )
        );
        setActionSuccess(
          `Course ${response.data.isPublished ? 'published' : 'unpublished'} successfully.`
        );
      }
    } catch (err) {
      setError(err.message || 'Failed to toggle publication status.');
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const response = await courseService.deleteCourse(deleteTarget._id);
      if (response.success) {
        setCourses((prev) => prev.filter((c) => c._id !== deleteTarget._id));
        setActionSuccess(`Course "${deleteTarget.title}" deleted successfully.`);
        setDeleteTarget(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete course.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set();
    courses.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [courses]);

  // Filtered courses
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'published'
        ? c.isPublished
        : !c.isPublished;

    const matchesCategory =
      categoryFilter === 'all' ? true : c.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate metrics
  const totalCourses = courses.length;
  const publishedCount = courses.filter((c) => c.isPublished).length;
  const totalEnrollments = courses.reduce(
    (acc, c) => acc + (c.totalEnrollments || 0),
    0
  );
  const totalModules = courses.reduce(
    (acc, c) => acc + (c.modules?.length || 0),
    0
  );
  const totalLessons = courses.reduce(
    (acc, c) =>
      acc +
      (c.totalLessons ||
        c.modules?.reduce((mAcc, m) => mAcc + (m.lessons?.length || 0), 0) ||
        0),
    0
  );

  return (
    <div className="flex-1 bg-neuro-bg min-h-screen py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Bar */}
        <div className="bg-white rounded-3xl border border-neuro-border p-6 sm:p-8 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="purple">Admin Portal</Badge>
              <Badge variant="neutral">Curriculum Management</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neuro-text tracking-tight">
              Course & Video Content Management
            </h1>
            <p className="text-xs sm:text-sm text-neuro-textMuted max-w-xl">
              Create, update, publish, or remove courses, sequential modules, and YouTube video lessons.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/admin/courses/create">
              <Button variant="primary" icon={Plus} className="shadow-purple-btn">
                Create New Course
              </Button>
            </Link>
          </div>
        </div>

        {/* Admin Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-neuro-border p-5 shadow-subtle">
            <p className="text-xs text-neuro-textMuted font-medium">Total Courses</p>
            <p className="text-2xl font-bold text-neuro-text mt-1">{totalCourses}</p>
          </div>
          <div className="bg-white rounded-2xl border border-neuro-border p-5 shadow-subtle">
            <p className="text-xs text-neuro-textMuted font-medium">Curriculum Structure</p>
            <p className="text-xl font-bold text-neuro-purple mt-1">
              {totalModules} <span className="text-xs font-normal text-neuro-textMuted">mods</span> • {totalLessons} <span className="text-xs font-normal text-neuro-textMuted">lessons</span>
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-neuro-border p-5 shadow-subtle">
            <p className="text-xs text-neuro-textMuted font-medium">Published in Catalog</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{publishedCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-neuro-border p-5 shadow-subtle">
            <p className="text-xs text-neuro-textMuted font-medium">Enrolled Students</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{totalEnrollments}</p>
          </div>
        </div>

        {/* Notifications */}
        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {actionSuccess}
            </span>
            <button
              onClick={() => setActionSuccess(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              {error}
            </span>
            <button
              onClick={() => setError(null)}
              className="text-rose-700 hover:text-rose-900 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Courses Table Card */}
        <div className="bg-white rounded-3xl border border-neuro-border shadow-subtle overflow-hidden">
          {/* Table Search & Filter Bar */}
          <div className="p-5 border-b border-neuro-border flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-neuro-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, category, slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-neuro-border rounded-xl focus:outline-none focus:border-neuro-purple"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-neuro-border rounded-xl focus:outline-none focus:border-neuro-purple"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-neuro-border rounded-xl focus:outline-none focus:border-neuro-purple"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published Only</option>
                <option value="draft">Drafts Only</option>
              </select>

              <span className="text-xs text-neuro-textMuted ml-auto">
                Showing {filteredCourses.length} of {courses.length} entries
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-neuro-border text-[11px] font-bold text-neuro-text uppercase tracking-wider">
                  <th className="py-3 px-5">Course Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Curriculum</th>
                  <th className="py-3 px-4">Students</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neuro-border text-xs text-neuro-text">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-neuro-textMuted">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-neuro-purple mb-2" />
                      <span>Loading courses from database...</span>
                    </td>
                  </tr>
                ) : filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-neuro-textMuted">
                      No courses found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((c) => {
                    const modCount = c.modules?.length || 0;
                    const lesCount =
                      c.totalLessons ||
                      c.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) ||
                      0;

                    return (
                      <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-5 font-semibold text-neuro-text max-w-xs">
                          <p className="truncate font-bold text-neuro-text">{c.title}</p>
                          <p className="text-[11px] text-neuro-textMuted font-mono truncate">
                            /{c.slug}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neuro-lavender text-neuro-purple">
                            {c.category}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-neuro-textMuted">{c.level}</td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-neuro-text">{modCount}</span>{' '}
                          <span className="text-neuro-textMuted text-[11px]">mods</span> •{' '}
                          <span className="font-semibold text-neuro-text">{lesCount}</span>{' '}
                          <span className="text-neuro-textMuted text-[11px]">lessons</span>
                        </td>
                        <td className="py-4 px-4 font-medium">{c.totalEnrollments || 0}</td>
                        <td className="py-4 px-4 font-semibold">
                          {c.isFree ? (
                            <span className="text-emerald-600">Free</span>
                          ) : (
                            `$${c.price}`
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <button
                            type="button"
                            disabled={togglingId === c._id}
                            onClick={() => handleTogglePublish(c._id)}
                            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all border ${
                              c.isPublished
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            }`}
                            title="Click to toggle publish status"
                          >
                            {togglingId === c._id ? (
                              <Loader2 className="w-3 h-3 animate-spin inline" />
                            ) : c.isPublished ? (
                              'Published'
                            ) : (
                              'Draft (Hidden)'
                            )}
                          </button>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/courses/${c.slug}`}
                              className="p-1.5 rounded-lg text-neuro-textMuted hover:text-neuro-purple hover:bg-slate-100"
                              title="Preview in Catalog"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/admin/courses/${c._id}/edit`}
                              className="p-1.5 rounded-lg text-neuro-textMuted hover:text-neuro-purple hover:bg-slate-100"
                              title="Edit Course & Modules"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(c)}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                              title="Delete Course"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neuro-border p-6 sm:p-8 max-w-md w-full shadow-card space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-neuro-text">Delete Course Confirmation</h3>
              <p className="text-xs text-neuro-textMuted leading-relaxed">
                Are you sure you want to delete <strong className="text-neuro-text">"{deleteTarget.title}"</strong>?
                This will permanently remove the course, all modules, lessons, and associated student progress records.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Button
                variant="outline"
                className="flex-1"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white"
                disabled={isDeleting}
                onClick={confirmDelete}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
