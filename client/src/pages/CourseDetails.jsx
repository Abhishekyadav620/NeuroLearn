import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Brain,
  Clock,
  BookOpen,
  Users,
  Star,
  CheckCircle2,
  Calendar,
  Globe,
  Award,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Share2,
} from 'lucide-react';
import courseService from '../services/courseService.js';
import CourseCurriculum from '../components/courses/CourseCurriculum.jsx';
import EnrollmentButton from '../components/courses/EnrollmentButton.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/common/Button.jsx';

export const CourseDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'curriculum'

  const fetchCourse = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await courseService.getCourseBySlug(slug);
      if (response.success && response.data?.course) {
        setCourse(response.data.course);
      } else {
        setError('Course not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve course information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neuro-bg py-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-in fade-in">
          <div className="w-12 h-12 rounded-2xl bg-neuro-lavender flex items-center justify-center text-neuro-purple animate-pulse shadow-card">
            <Brain className="w-6 h-6 text-neuro-purple" />
          </div>
          <p className="text-xs text-neuro-textMuted font-medium">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-neuro-bg py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-neuro-border p-8 text-center shadow-card space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto">
            <Brain className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-neuro-text">Course Unavailable</h2>
          <p className="text-xs text-neuro-textMuted leading-relaxed">
            {error || 'This course could not be located or is currently unpublished.'}
          </p>
          <Button variant="primary" onClick={() => navigate('/courses')} className="w-full">
            Browse Available Courses
          </Button>
        </div>
      </div>
    );
  }

  const {
    title,
    shortDescription,
    description,
    thumbnail,
    category,
    level,
    language = 'English',
    instructor,
    duration,
    totalLessons,
    totalEnrollments,
    averageRating = 4.8,
    isFree,
    price,
    prerequisites = [],
    learningOutcomes = [],
    tags = [],
    modules = [],
  } = course;

  const instructorName =
    instructor?.fullName ||
    (typeof instructor === 'string' ? instructor : 'Dr. Elena Vance (Lead Instructor)');

  return (
    <div className="flex-1 bg-neuro-bg min-h-screen pb-16">
      {/* Top Breadcrumb Header */}
      <div className="bg-white border-b border-neuro-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-neuro-textMuted">
            <Link to="/courses" className="hover:text-neuro-purple flex items-center gap-1 font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Catalog</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-neuro-purple font-semibold">{category}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:inline-block" />
            <span className="text-neuro-text font-medium truncate max-w-[200px] sm:max-w-xs hidden sm:inline-block">
              {title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="purple">{level}</Badge>
            <Badge variant={isFree ? 'success' : 'neutral'}>
              {isFree ? 'Free Enrollment' : `$${price}`}
            </Badge>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-white to-neuro-bg border-b border-neuro-border py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Hero Left Content */}
          <div className="lg:col-span-8 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-neuro-lavender text-neuro-purple border border-neuro-purple/20">
                {category}
              </span>
              <span className="text-xs text-neuro-textMuted">•</span>
              <span className="text-xs text-neuro-textMuted font-medium flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-neuro-purpleLight" />
                {language}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-neuro-text tracking-tight leading-tight">
              {title}
            </h1>

            <p className="text-sm sm:text-base text-neuro-textMuted leading-relaxed max-w-3xl">
              {shortDescription}
            </p>

            {/* Meta Row: Rating, Students, Duration, Lessons */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs text-neuro-text">
              <div className="flex items-center gap-1.5 font-bold text-amber-500">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{averageRating.toFixed(1)}</span>
                <span className="text-neuro-textMuted font-normal">(Verified Rating)</span>
              </div>

              <div className="flex items-center gap-1.5 text-neuro-textMuted font-medium">
                <Users className="w-4 h-4 text-neuro-purpleLight" />
                <span><strong className="text-neuro-text">{totalEnrollments}</strong> students enrolled</span>
              </div>

              <div className="flex items-center gap-1.5 text-neuro-textMuted font-medium">
                <Clock className="w-4 h-4 text-neuro-purpleLight" />
                <span><strong className="text-neuro-text">{duration}</strong> hours on-demand</span>
              </div>

              <div className="flex items-center gap-1.5 text-neuro-textMuted font-medium">
                <BookOpen className="w-4 h-4 text-neuro-purpleLight" />
                <span><strong className="text-neuro-text">{totalLessons}</strong> lessons</span>
              </div>
            </div>

            {/* Instructor Pill */}
            <div className="pt-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neuro-purple text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {instructorName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold text-neuro-text leading-tight">{instructorName}</p>
                <p className="text-[11px] text-neuro-textMuted">NeuroLearn Lead Instructor & Cognitive Researcher</p>
              </div>
            </div>
          </div>

          {/* Hero Right: Quick Mobile Enrollment Card */}
          <div className="lg:col-span-4 block lg:hidden w-full">
            <div className="bg-white rounded-3xl border border-neuro-border p-6 shadow-card space-y-4">
              <EnrollmentButton course={course} onEnrollmentSuccess={fetchCourse} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area + Sticky Sidebar Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Tabs & Details */}
        <div className="lg:col-span-8 space-y-8">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-neuro-border pb-1">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
                activeTab === 'overview'
                  ? 'border-neuro-purple text-neuro-purple'
                  : 'border-transparent text-neuro-textMuted hover:text-neuro-text'
              }`}
            >
              Course Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('curriculum')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'curriculum'
                  ? 'border-neuro-purple text-neuro-purple'
                  : 'border-transparent text-neuro-textMuted hover:text-neuro-text'
              }`}
            >
              <span>Curriculum</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {modules.length}
              </span>
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Learning Outcomes Card */}
              {learningOutcomes.length > 0 && (
                <div className="bg-white rounded-3xl border border-neuro-border p-6 sm:p-8 shadow-subtle space-y-4">
                  <div className="flex items-center gap-2 text-neuro-text">
                    <Sparkles className="w-5 h-5 text-neuro-purple" />
                    <h3 className="text-base sm:text-lg font-bold">What you'll learn</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    {learningOutcomes.map((outcome, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neuro-text">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span className="leading-snug">{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Description */}
              <div className="bg-white rounded-3xl border border-neuro-border p-6 sm:p-8 shadow-subtle space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-neuro-text">
                  Description
                </h3>
                <div className="text-xs sm:text-sm text-neuro-textMuted leading-relaxed whitespace-pre-line space-y-3">
                  {description}
                </div>
              </div>

              {/* Prerequisites Card */}
              {prerequisites.length > 0 && (
                <div className="bg-white rounded-3xl border border-neuro-border p-6 sm:p-8 shadow-subtle space-y-4">
                  <h3 className="text-base sm:text-lg font-bold text-neuro-text">
                    Prerequisites & Requirements
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-neuro-textMuted">
                    {prerequisites.map((req, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-neuro-purple shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags Section */}
              {tags.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-neuro-textMuted">Tags & Topics:</span>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Curriculum Preview Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-neuro-text">
                    Curriculum Content
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('curriculum')}
                    className="text-xs font-bold text-neuro-purple hover:underline"
                  >
                    View All {modules.length} Modules →
                  </button>
                </div>
                <CourseCurriculum modules={modules} courseSlug={course.slug} />
              </div>
            </div>
          )}

          {/* Tab 2: Full Curriculum */}
          {activeTab === 'curriculum' && (
            <div className="bg-white rounded-3xl border border-neuro-border p-6 sm:p-8 shadow-subtle space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-neuro-text">
                  Complete Course Curriculum
                </h3>
                <p className="text-xs text-neuro-textMuted mt-1">
                  Explore every module, lesson duration, and learning medium included in this course.
                </p>
              </div>
              <CourseCurriculum modules={modules} courseSlug={course.slug} />
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Sticky Enrollment & Highlights Panel */}
        <div className="lg:col-span-4 sticky top-24 space-y-6">
          <div className="bg-white rounded-3xl border border-neuro-border p-6 shadow-card space-y-6">
            {/* Thumbnail Preview */}
            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-50 border border-neuro-border relative">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-neuro-lavender to-white flex items-center justify-center text-neuro-purple">
                  <Brain className="w-10 h-10" />
                </div>
              )}
            </div>

            {/* Price Row */}
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-neuro-text">
                  {isFree ? 'Free' : `$${price}`}
                </span>
                {!isFree && (
                  <span className="text-xs text-neuro-textMuted ml-2 line-through">$129</span>
                )}
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Lifetime Access
              </span>
            </div>

            {/* Enrollment Button Component */}
            <EnrollmentButton course={course} onEnrollmentSuccess={fetchCourse} />

            {/* Course Inclusions List */}
            <div className="pt-4 border-t border-neuro-border space-y-3">
              <h4 className="text-xs font-bold text-neuro-text uppercase tracking-wider">
                This course includes:
              </h4>

              <div className="space-y-2.5 text-xs text-neuro-textMuted">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-neuro-purple" />
                  <span>{duration} hours on-demand learning</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-neuro-purple" />
                  <span>{totalLessons} adaptive micro-lessons</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Brain className="w-4 h-4 text-neuro-purple" />
                  <span>Cognitive attention drift monitoring</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-neuro-purple" />
                  <span>Verified completion certificate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
