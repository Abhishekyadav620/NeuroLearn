import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  PlayCircle,
  FileText,
  HelpCircle,
  Download,
  ExternalLink,
  Clock,
  Layers,
  BookOpen,
  Sparkles,
  AlertCircle,
  Loader2,
  Check,
} from 'lucide-react';
import courseService from '../services/courseService.js';
import YouTubePlayer from '../components/learning/YouTubePlayer.jsx';
import QuizViewer from '../components/learning/QuizViewer.jsx';
import useLearningTracking from '../hooks/useLearningTracking.js';
import Button from '../components/common/Button.jsx';
import Badge from '../components/ui/Badge.jsx';

export const LessonViewer = () => {
  const { slug, lessonId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lessonData, setLessonData] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);

  // Fetch lesson details
  const fetchLesson = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await courseService.getLesson(slug, lessonId);
      if (response.success && response.data) {
        setLessonData(response.data);
      } else {
        setError(response.message || 'Lesson not found or currently unavailable.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to load this lesson. It may be unpublished or restricted.'
      );
    } finally {
      setLoading(false);
    }
  }, [slug, lessonId]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  const course = lessonData?.course;
  const currentLesson = lessonData?.lesson;
  const currentModule = lessonData?.currentModule;
  const navigation = lessonData?.navigation;

  // Telemetry hook
  const {
    trackLessonOpen,
    trackLessonCompletion,
    trackResourceOpen,
    trackReadingProgress,
    trackReadingCompleted,
  } = useLearningTracking({
    courseId: course?._id,
    lessonId: currentLesson?._id,
    autoTrackReading: currentLesson?.lessonType === 'reading',
  });

  // Track lesson open on mount or when lesson changes
  useEffect(() => {
    if (course?._id && currentLesson?._id) {
      trackLessonOpen();
      setIsCompleted(false);
    }
  }, [course?._id, currentLesson?._id, trackLessonOpen]);

  const handleMarkComplete = async () => {
    if (isCompleted || markingComplete) return;
    setMarkingComplete(true);

    try {
      trackLessonCompletion({
        completedAt: new Date().toISOString(),
        manual: true,
      });
      setIsCompleted(true);
    } catch (err) {
      console.warn('Failed to record lesson completion:', err);
    } finally {
      setMarkingComplete(false);
    }
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="w-4 h-4 text-neuro-purple" />;
      case 'reading':
        return <FileText className="w-4 h-4 text-sky-500" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4 text-amber-500" />;
      case 'resource':
        return <Download className="w-4 h-4 text-emerald-500" />;
      default:
        return <PlayCircle className="w-4 h-4 text-neuro-purple" />;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-neuro-bg min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-neuro-purple mx-auto" />
          <p className="text-xs text-neuro-textMuted font-medium">Loading lesson content...</p>
        </div>
      </div>
    );
  }

  if (error || !currentLesson) {
    return (
      <div className="flex-1 bg-neuro-bg min-h-screen py-12 px-4 sm:px-6">
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-neuro-border p-8 text-center space-y-4 shadow-subtle">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-neuro-text">Lesson Unavailable</h2>
          <p className="text-xs text-neuro-textMuted max-w-sm mx-auto leading-relaxed">
            {error || 'This lesson could not be found or has not been published by the instructor.'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link to={`/courses/${slug}`}>
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Back to Course
              </Button>
            </Link>
            <Link to="/courses">
              <Button variant="primary" size="sm">
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-neuro-bg min-h-screen flex flex-col">
      {/* Top Navbar */}
      <div className="bg-white border-b border-neuro-border sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Back to Course & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to={`/courses/${course?.slug || slug}`}
              className="p-2 rounded-xl text-neuro-textMuted hover:text-neuro-purple hover:bg-slate-50 transition-colors shrink-0"
              title="Back to Course Overview"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="truncate">
              <p className="text-[11px] text-neuro-textMuted font-medium truncate flex items-center gap-1.5">
                <span>{course?.title}</span>
                <span>•</span>
                <span className="text-neuro-purple font-semibold">
                  {currentModule?.moduleTitle || 'Module'}
                </span>
              </p>
              <h1 className="text-sm font-bold text-neuro-text truncate">
                {currentLesson.lessonTitle}
              </h1>
            </div>
          </div>

          {/* Right: Actions & Completion */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant={isCompleted ? 'success' : 'outline'}
              size="sm"
              icon={isCompleted ? Check : CheckCircle2}
              onClick={handleMarkComplete}
              disabled={isCompleted || markingComplete}
              className={isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
            >
              {isCompleted ? 'Completed' : markingComplete ? 'Saving...' : 'Mark Complete'}
            </Button>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={!navigation?.previousLesson}
                onClick={() =>
                  navigation?.previousLesson &&
                  navigate(`/courses/${slug}/lessons/${navigation.previousLesson._id}`)
                }
                className="p-2 rounded-xl border border-neuro-border text-neuro-textMuted hover:text-neuro-purple hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                title="Previous Lesson"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                disabled={!navigation?.nextLesson}
                onClick={() =>
                  navigation?.nextLesson &&
                  navigate(`/courses/${slug}/lessons/${navigation.nextLesson._id}`)
                }
                className="p-2 rounded-xl border border-neuro-border text-neuro-textMuted hover:text-neuro-purple hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                title="Next Lesson"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Lesson Player and Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Content Player Card */}
          <div className="bg-white rounded-3xl border border-neuro-border p-6 shadow-subtle space-y-6">
            {/* Content Renderer by Lesson Type */}
            {currentLesson.lessonType === 'video' && (
              <div className="space-y-4">
                <YouTubePlayer
                  videoId={currentLesson.youtubeVideoId}
                  videoUrl={currentLesson.videoUrl}
                  title={currentLesson.lessonTitle}
                  courseId={course?._id}
                  lessonId={currentLesson._id}
                  onComplete={() => setIsCompleted(true)}
                />
              </div>
            )}

            {currentLesson.lessonType === 'reading' && (
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none text-neuro-text leading-relaxed p-4 sm:p-6 bg-slate-50/60 rounded-2xl border border-neuro-border/70">
                  {currentLesson.textContent ? (
                    <div className="whitespace-pre-line text-xs sm:text-sm">
                      {currentLesson.textContent}
                    </div>
                  ) : (
                    <p className="text-xs text-neuro-textMuted italic">
                      No text reading material provided for this lesson yet.
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentLesson.lessonType === 'quiz' && (
              <div className="space-y-4">
                {currentLesson.quizQuestions && currentLesson.quizQuestions.length > 0 ? (
                  <QuizViewer
                    quizTitle={currentLesson.lessonTitle}
                    questions={currentLesson.quizQuestions}
                    courseId={course?._id}
                    lessonId={currentLesson._id}
                    onCompleted={() => setIsCompleted(true)}
                  />
                ) : (
                  <div className="p-8 text-center text-xs text-neuro-textMuted bg-slate-50 rounded-2xl border border-neuro-border">
                    <HelpCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="font-bold text-neuro-text">Interactive Quiz</p>
                    <p className="mt-1">Quiz questions are being finalized for this lesson.</p>
                  </div>
                )}
              </div>
            )}

            {currentLesson.lessonType === 'resource' && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-neuro-border space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neuro-text">Lesson Resource Material</h3>
                    <p className="text-xs text-neuro-textMuted">
                      Supplementary reference document or file download.
                    </p>
                  </div>
                </div>

                {currentLesson.resourceLink ? (
                  <div className="pt-2">
                    <a
                      href={currentLesson.resourceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackResourceOpen(currentLesson._id)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-subtle transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Access Lesson Resource / PDF</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-neuro-textMuted">
                    No download link currently attached to this resource lesson.
                  </p>
                )}
              </div>
            )}

            {/* Lesson Title & Metadata Bar */}
            <div className="pt-4 border-t border-neuro-border/70 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant="purple" className="capitalize">
                    {currentLesson.lessonType} Lesson
                  </Badge>
                  {currentLesson.duration && (
                    <Badge variant="neutral">
                      <Clock className="w-3 h-3 text-neuro-purpleLight inline mr-1" />
                      {currentLesson.duration} mins
                    </Badge>
                  )}
                </div>

                {isCompleted && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Lesson Completed
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-neuro-text">
                {currentLesson.lessonTitle}
              </h2>

              {currentLesson.lessonDescription && (
                <p className="text-xs text-neuro-textMuted leading-relaxed">
                  {currentLesson.lessonDescription}
                </p>
              )}
            </div>

            {/* Learning Objectives */}
            {currentLesson.learningObjectives && currentLesson.learningObjectives.length > 0 && (
              <div className="p-4 rounded-2xl bg-neuro-lavender/50 border border-neuro-lavenderDark space-y-2">
                <h4 className="text-xs font-bold text-neuro-purple flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Learning Objectives</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-neuro-text">
                  {currentLesson.learningObjectives.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-neuro-purple mt-1.5 shrink-0" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bottom Nav Buttons */}
            <div className="pt-4 border-t border-neuro-border/70 flex items-center justify-between gap-4">
              {navigation?.previousLesson ? (
                <Link
                  to={`/courses/${slug}/lessons/${navigation.previousLesson._id}`}
                  className="flex items-center gap-2 text-xs font-semibold text-neuro-purple hover:underline"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous: {navigation.previousLesson.lessonTitle}</span>
                </Link>
              ) : (
                <span />
              )}

              {navigation?.nextLesson ? (
                <Link
                  to={`/courses/${slug}/lessons/${navigation.nextLesson._id}`}
                  className="flex items-center gap-2 text-xs font-semibold text-neuro-purple hover:underline"
                >
                  <span>Next: {navigation.nextLesson.lessonTitle}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <span className="text-xs text-neuro-textMuted italic">End of Course Curriculum</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Course Curriculum Navigator Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-neuro-border p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neuro-border">
            <h3 className="text-xs font-bold text-neuro-text flex items-center gap-2">
              <Layers className="w-4 h-4 text-neuro-purple" />
              <span>Course Curriculum</span>
            </h3>
            <span className="text-[11px] text-neuro-textMuted">
              {course?.modules?.length || 0} Modules
            </span>
          </div>

          {/* Module & Lesson Accordion Tree */}
          <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {(course?.modules || []).map((mod, modIdx) => (
              <div
                key={mod._id || modIdx}
                className="border border-neuro-border rounded-2xl overflow-hidden bg-slate-50/50"
              >
                {/* Module Header */}
                <div className="px-3.5 py-2.5 bg-slate-100/70 border-b border-neuro-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="w-5 h-5 rounded-md bg-white border border-neuro-border text-neuro-text font-bold text-[10px] flex items-center justify-center shrink-0">
                      {modIdx + 1}
                    </span>
                    <span className="text-xs font-bold text-neuro-text truncate">
                      {mod.moduleTitle}
                    </span>
                  </div>
                  <span className="text-[10px] text-neuro-textMuted shrink-0">
                    {mod.lessons?.length || 0} lessons
                  </span>
                </div>

                {/* Lessons in Module */}
                <div className="divide-y divide-neuro-border/40 bg-white">
                  {(mod.lessons || []).map((les, lesIdx) => {
                    const isCurrent = les._id === currentLesson._id;

                    return (
                      <Link
                        key={les._id || lesIdx}
                        to={`/courses/${slug}/lessons/${les._id}`}
                        className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left transition-colors ${
                          isCurrent
                            ? 'bg-neuro-lavender/60 text-neuro-purple font-semibold'
                            : 'hover:bg-slate-50 text-neuro-text'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate pr-2">
                          <div className="shrink-0">{getLessonIcon(les.lessonType)}</div>
                          <span className="text-xs truncate">{les.lessonTitle}</span>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-neuro-textMuted shrink-0">
                          {les.duration && <span>{les.duration}m</span>}
                          {isCurrent && (
                            <span className="w-1.5 h-1.5 rounded-full bg-neuro-purple ml-1" />
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;
