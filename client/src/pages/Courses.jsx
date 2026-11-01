import React, { useState, useEffect, useCallback } from 'react';
import {
  Brain,
  Compass,
  Sparkles,
  BookOpen,
  Filter,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import courseService from '../services/courseService.js';
import CourseGrid from '../components/courses/CourseGrid.jsx';
import CourseFilters from '../components/courses/CourseFilters.jsx';
import CourseSearch from '../components/courses/CourseSearch.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/ui/Badge.jsx';

export const Courses = () => {
  // Query parameters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Data state
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    totalCourses: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 9,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const response = await courseService.getCategories();
        if (response.success && response.data?.categories) {
          setCategories(response.data.categories);
        }
      } catch (err) {
        console.warn('Could not fetch course categories:', err.message);
      }
    };
    fetchCats();
  }, []);

  // Fetch Courses with active filters
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await courseService.getCourses({
        search: searchTerm,
        category: selectedCategory,
        level: selectedLevel,
        price: selectedPrice,
        sort: selectedSort,
        page: currentPage,
        limit: 9,
      });

      if (response.success && response.data) {
        setCourses(response.data.courses || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (err) {
      setError(
        err.message || 'Unable to load courses. Please verify backend connectivity.'
      );
    } finally {
      setLoading(false);
    }
  }, [
    searchTerm,
    selectedCategory,
    selectedLevel,
    selectedPrice,
    selectedSort,
    currentPage,
  ]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Reset pagination to page 1 whenever search or filter options change
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleLevelChange = (lvl) => {
    setSelectedLevel(lvl);
    setCurrentPage(1);
  };

  const handlePriceChange = (prc) => {
    setSelectedPrice(prc);
    setCurrentPage(1);
  };

  const handleSortChange = (srt) => {
    setSelectedSort(srt);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedLevel('All');
    setSelectedPrice('all');
    setSelectedSort('newest');
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 bg-neuro-bg min-h-screen py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Hero Section */}
        <div className="bg-white rounded-3xl border border-neuro-border p-6 sm:p-10 shadow-subtle relative overflow-hidden">
          {/* Subtle Decorative Elements */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-neuro-lavender/40 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-neuro-purple/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="purple">Adaptive Learning Catalog</Badge>
              <Badge variant="neutral">MongoDB Integrated</Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neuro-text tracking-tight leading-tight">
              Explore Your Learning Journey
            </h1>

            <p className="text-sm sm:text-base text-neuro-textMuted max-w-2xl leading-relaxed">
              Discover courses designed to help you learn, grow and achieve more. Every curriculum adapts dynamically based on your cognitive attention rhythms.
            </p>

            {/* Search Bar Input */}
            <div className="pt-2">
              <CourseSearch
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search courses by title, keywords, or topics..."
              />
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <CourseFilters
          category={selectedCategory}
          onCategoryChange={handleCategoryChange}
          level={selectedLevel}
          onLevelChange={handleLevelChange}
          price={selectedPrice}
          onPriceChange={handlePriceChange}
          sort={selectedSort}
          onSortChange={handleSortChange}
          categories={categories}
        />

        {/* Results Counter & Active Query Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neuro-textMuted pb-2">
          <div>
            Showing <strong className="text-neuro-text">{courses.length}</strong> of{' '}
            <strong className="text-neuro-text">{pagination.totalCourses}</strong> available courses
            {selectedCategory !== 'All' && (
              <span> in <strong className="text-neuro-purple">{selectedCategory}</strong></span>
            )}
            {searchTerm && (
              <span> matching "<strong className="text-neuro-text">{searchTerm}</strong>"</span>
            )}
          </div>

          {(selectedCategory !== 'All' ||
            selectedLevel !== 'All' ||
            selectedPrice !== 'all' ||
            searchTerm) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-neuro-purple hover:underline font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear all filters</span>
            </button>
          )}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={fetchCourses}>
              Retry
            </Button>
          </div>
        )}

        {/* Course Cards Grid */}
        <CourseGrid
          courses={courses}
          loading={loading}
          onResetFilters={handleResetFilters}
          totalCourses={pagination.totalCourses}
        />

        {/* Pagination Navigation */}
        {pagination.totalPages > 1 && (
          <div className="pt-8 border-t border-neuro-border flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={ChevronLeft}
              disabled={!pagination.hasPrevPage || loading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>

            <div className="flex items-center gap-1 px-3">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all ${
                      currentPage === pageNum
                        ? 'bg-neuro-purple text-white shadow-purple-btn'
                        : 'bg-white text-neuro-text hover:bg-slate-50 border border-neuro-border'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNextPage || loading}
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
              }
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
