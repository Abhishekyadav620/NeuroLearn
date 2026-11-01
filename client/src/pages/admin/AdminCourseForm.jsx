import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Loader2,
  BookOpen,
  Layers,
  Sparkles,
  HelpCircle,
  Clock,
  PlayCircle,
  FileText,
  Code,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Youtube,
  AlertCircle,
  Download,
  Eye,
  ExternalLink,
} from 'lucide-react';
import courseService from '../../services/courseService.js';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

export const AdminCourseForm = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(courseId);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    thumbnail: '',
    category: 'Artificial Intelligence',
    level: 'Beginner',
    language: 'English',
    price: 0,
    duration: 0,
    prerequisites: [''],
    learningOutcomes: [''],
    tags: '',
    isPublished: false,
    modules: [
      {
        moduleTitle: 'Module 1: Introduction',
        moduleDescription: 'Core fundamentals and orientation.',
        order: 1,
        isPublished: true,
        lessons: [
          {
            lessonTitle: 'Course Orientation & Welcome',
            lessonDescription: 'Welcome to the curriculum and learning roadmap.',
            lessonType: 'video',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeVideoId: 'dQw4w9WgXcQ',
            textContent: '',
            resourceLink: '',
            duration: 10,
            order: 1,
            isPublished: true,
            learningObjectives: ['Understand course goals and learning path'],
          },
        ],
      },
    ],
  });

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Real-time YouTube validation state map: key `${modIdx}-${lessonIdx}` -> { loading, valid, videoId, thumbnail, error }
  const [ytStatusMap, setYtStatusMap] = useState({});

  // Load course if editing
  useEffect(() => {
    if (!isEditing) return;

    const loadCourse = async () => {
      setLoading(true);
      try {
        const response = await courseService.getCourseById(courseId);
        if (response.success && response.data?.course) {
          const c = response.data.course;
          setFormData({
            title: c.title || '',
            shortDescription: c.shortDescription || '',
            description: c.description || '',
            thumbnail: c.thumbnail || '',
            category: c.category || 'Artificial Intelligence',
            level: c.level || 'Beginner',
            language: c.language || 'English',
            price: c.price || 0,
            duration: c.duration || 0,
            prerequisites: c.prerequisites?.length ? c.prerequisites : [''],
            learningOutcomes: c.learningOutcomes?.length ? c.learningOutcomes : [''],
            tags: c.tags ? c.tags.join(', ') : '',
            isPublished: Boolean(c.isPublished),
            modules: c.modules?.length
              ? c.modules.map((m) => ({
                  ...m,
                  isPublished: m.isPublished !== false,
                  lessons: m.lessons?.length
                    ? m.lessons.map((l) => ({
                        ...l,
                        isPublished: l.isPublished !== false,
                        learningObjectives: l.learningObjectives?.length ? l.learningObjectives : [''],
                      }))
                    : [],
                }))
              : [],
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load course details for editing.');
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId, isEditing]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Dynamic Array Handlers for Outcomes & Prerequisites
  const handleArrayItemChange = (field, index, value) => {
    setFormData((prev) => {
      const updated = [...prev[field]];
      updated[index] = value;
      return { ...prev, [field]: updated };
    });
  };

  const addArrayItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // Module Management Handlers
  const addModule = () => {
    setFormData((prev) => ({
      ...prev,
      modules: [
        ...prev.modules,
        {
          moduleTitle: `Module ${prev.modules.length + 1}`,
          moduleDescription: '',
          order: prev.modules.length + 1,
          isPublished: true,
          lessons: [],
        },
      ],
    }));
  };

  const removeModule = (modIndex) => {
    setFormData((prev) => {
      const filtered = prev.modules.filter((_, i) => i !== modIndex);
      return {
        ...prev,
        modules: filtered.map((m, idx) => ({ ...m, order: idx + 1 })),
      };
    });
  };

  const moveModule = (modIndex, direction) => {
    const targetIdx = modIndex + direction;
    if (targetIdx < 0 || targetIdx >= formData.modules.length) return;

    setFormData((prev) => {
      const copy = [...prev.modules];
      const temp = copy[modIndex];
      copy[modIndex] = copy[targetIdx];
      copy[targetIdx] = temp;
      return {
        ...prev,
        modules: copy.map((m, idx) => ({ ...m, order: idx + 1 })),
      };
    });
  };

  const handleModuleChange = (modIndex, field, value) => {
    setFormData((prev) => {
      const updatedModules = [...prev.modules];
      updatedModules[modIndex] = {
        ...updatedModules[modIndex],
        [field]: value,
      };
      return { ...prev, modules: updatedModules };
    });
  };

  // Lesson Management Handlers
  const addLesson = (modIndex) => {
    setFormData((prev) => {
      const updatedModules = [...prev.modules];
      const lessons = updatedModules[modIndex].lessons || [];
      updatedModules[modIndex].lessons = [
        ...lessons,
        {
          lessonTitle: `Lesson ${lessons.length + 1}`,
          lessonDescription: '',
          lessonType: 'video',
          videoUrl: '',
          youtubeVideoId: '',
          textContent: '',
          resourceLink: '',
          duration: 15,
          order: lessons.length + 1,
          isPublished: true,
          learningObjectives: [''],
        },
      ];
      return { ...prev, modules: updatedModules };
    });
  };

  const removeLesson = (modIndex, lessonIndex) => {
    setFormData((prev) => {
      const updatedModules = [...prev.modules];
      const filtered = (updatedModules[modIndex].lessons || []).filter(
        (_, i) => i !== lessonIndex
      );
      updatedModules[modIndex].lessons = filtered.map((l, idx) => ({ ...l, order: idx + 1 }));
      return { ...prev, modules: updatedModules };
    });
  };

  const moveLesson = (modIndex, lessonIndex, direction) => {
    const updatedModules = [...formData.modules];
    const lessons = [...(updatedModules[modIndex].lessons || [])];
    const targetIdx = lessonIndex + direction;
    if (targetIdx < 0 || targetIdx >= lessons.length) return;

    const temp = lessons[lessonIndex];
    lessons[lessonIndex] = lessons[targetIdx];
    lessons[targetIdx] = temp;

    updatedModules[modIndex].lessons = lessons.map((l, idx) => ({ ...l, order: idx + 1 }));
    setFormData((prev) => ({ ...prev, modules: updatedModules }));
  };

  const handleLessonChange = (modIndex, lessonIndex, field, value) => {
    setFormData((prev) => {
      const updatedModules = [...prev.modules];
      const updatedLessons = [...updatedModules[modIndex].lessons];
      updatedLessons[lessonIndex] = {
        ...updatedLessons[lessonIndex],
        [field]: field === 'duration' ? Number(value) : value,
      };
      updatedModules[modIndex].lessons = updatedLessons;
      return { ...prev, modules: updatedModules };
    });
  };

  // YouTube URL Validation via Backend
  const handleValidateYouTube = async (modIndex, lessonIndex, url) => {
    const key = `${modIndex}-${lessonIndex}`;
    if (!url || !url.trim()) {
      setYtStatusMap((prev) => ({ ...prev, [key]: null }));
      return;
    }

    setYtStatusMap((prev) => ({
      ...prev,
      [key]: { loading: true, valid: false, error: null },
    }));

    try {
      const response = await courseService.validateYouTube(url);
      if (response.success && response.data) {
        const { videoId, thumbnail, embedUrl } = response.data;
        setYtStatusMap((prev) => ({
          ...prev,
          [key]: {
            loading: false,
            valid: true,
            videoId,
            thumbnail,
            embedUrl,
            error: null,
          },
        }));

        // Automatically sync extracted videoId to form state
        handleLessonChange(modIndex, lessonIndex, 'youtubeVideoId', videoId);
      } else {
        setYtStatusMap((prev) => ({
          ...prev,
          [key]: {
            loading: false,
            valid: false,
            error: response.message || 'Invalid YouTube URL.',
          },
        }));
      }
    } catch (err) {
      setYtStatusMap((prev) => ({
        ...prev,
        [key]: {
          loading: false,
          valid: false,
          error:
            err.response?.data?.message ||
            err.message ||
            'Failed to validate YouTube link. Please check URL format.',
        },
      }));
    }
  };

  // Learning Objectives within Lesson
  const handleLessonObjectiveChange = (modIndex, lessonIndex, objIndex, val) => {
    setFormData((prev) => {
      const updatedModules = [...prev.modules];
      const updatedLessons = [...updatedModules[modIndex].lessons];
      const objectives = [...(updatedLessons[lessonIndex].learningObjectives || [])];
      objectives[objIndex] = val;
      updatedLessons[lessonIndex].learningObjectives = objectives;
      updatedModules[modIndex].lessons = updatedLessons;
      return { ...prev, modules: updatedModules };
    });
  };

  const addLessonObjective = (modIndex, lessonIndex) => {
    setFormData((prev) => {
      const updatedModules = [...prev.modules];
      const updatedLessons = [...updatedModules[modIndex].lessons];
      const objectives = [...(updatedLessons[lessonIndex].learningObjectives || []), ''];
      updatedLessons[lessonIndex].learningObjectives = objectives;
      updatedModules[modIndex].lessons = updatedLessons;
      return { ...prev, modules: updatedModules };
    });
  };

  const removeLessonObjective = (modIndex, lessonIndex, objIndex) => {
    setFormData((prev) => {
      const updatedModules = [...prev.modules];
      const updatedLessons = [...updatedModules[modIndex].lessons];
      const objectives = (updatedLessons[lessonIndex].learningObjectives || []).filter(
        (_, i) => i !== objIndex
      );
      updatedLessons[lessonIndex].learningObjectives = objectives;
      updatedModules[modIndex].lessons = updatedLessons;
      return { ...prev, modules: updatedModules };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Validation
    if (!formData.title.trim()) {
      setError('Please provide a course title.');
      return;
    }
    if (!formData.shortDescription.trim()) {
      setError('Please provide a short description.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please provide a full course description.');
      return;
    }

    if (formData.isPublished) {
      if (!formData.modules.length) {
        setError('Cannot publish course without at least one module.');
        return;
      }
      const hasLessons = formData.modules.some((m) => m.lessons && m.lessons.length > 0);
      if (!hasLessons) {
        setError('Cannot publish course without at least one lesson.');
        return;
      }
    }

    setSaving(true);

    const payload = {
      ...formData,
      price: Number(formData.price) || 0,
      duration: Number(formData.duration) || 0,
      prerequisites: formData.prerequisites.filter((p) => p.trim() !== ''),
      learningOutcomes: formData.learningOutcomes.filter((o) => o.trim() !== ''),
      tags: formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      modules: formData.modules.map((m, mIdx) => ({
        ...m,
        order: mIdx + 1,
        isPublished: m.isPublished !== false,
        lessons: (m.lessons || []).map((l, lIdx) => ({
          ...l,
          order: lIdx + 1,
          duration: Number(l.duration) || 10,
          isPublished: l.isPublished !== false,
          learningObjectives: (l.learningObjectives || []).filter((o) => o.trim() !== ''),
        })),
      })),
    };

    try {
      if (isEditing) {
        await courseService.updateCourse(courseId, payload);
        setSuccessMsg('Course curriculum updated successfully!');
      } else {
        const res = await courseService.createCourse(payload);
        setSuccessMsg('Course created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/admin/courses');
        }, 1200);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to save course. Please check all required fields.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neuro-bg flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-neuro-purple" />
          <p className="text-xs text-neuro-textMuted font-medium">
            Loading course curriculum editor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-neuro-bg min-h-screen py-8 sm:py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin/courses"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neuro-purple hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Course Administration</span>
          </Link>

          <Badge variant="purple">{isEditing ? 'Edit Mode' : 'New Course Mode'}</Badge>
        </div>

        {/* Title Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neuro-text tracking-tight">
            {isEditing ? 'Edit Course & Curriculum' : 'Create New Course'}
          </h1>
          <p className="text-xs sm:text-sm text-neuro-textMuted mt-1">
            Build and organize learning modules, YouTube video lessons, and interactive content.
          </p>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-700 hover:text-rose-900 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Information */}
          <div className="bg-white rounded-3xl border border-neuro-border p-6 sm:p-8 shadow-subtle space-y-6">
            <div className="border-b border-neuro-border pb-3">
              <h3 className="text-base font-bold text-neuro-text flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-neuro-purple" />
                <span>Course Overview & Identity</span>
              </h3>
              <p className="text-xs text-neuro-textMuted mt-0.5">
                Primary metadata displayed in the catalog and dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-neuro-text">
                  Course Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Deep Learning & Neural Network Foundations"
                  required
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-neuro-border rounded-xl focus:outline-none focus:border-neuro-purple"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-neuro-text">
                  Short Description (Sub-headline) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  placeholder="A concise summary highlighting the curriculum..."
                  required
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-neuro-border rounded-xl focus:outline-none focus:border-neuro-purple"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-neuro-text">
                  Full Course Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detailed course description..."
                  required
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-neuro-border rounded-xl focus:outline-none focus:border-neuro-purple"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neuro-text">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-neuro-border rounded-xl focus:outline-none focus:border-neuro-purple"
                >
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Neuroscience">Neuroscience</option>
                  <option value="Cognitive Psychology">Cognitive Psychology</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neuro-text">Level</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-neuro-border rounded-xl focus:outline-none focus:border-neuro-purple"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neuro-text">Price (USD)</label>
                <input
                  type="number"
                  name="price"
                  min={0}
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-neuro-border rounded-xl focus:outline-none focus:border-neuro-purple"
                />
                <span className="text-[11px] text-neuro-textMuted">
                  Set to 0 for Free Access
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neuro-text">
                  Course Thumbnail Image URL
                </label>
                <input
                  type="url"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleInputChange}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-neuro-border rounded-xl focus:outline-none focus:border-neuro-purple"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-neuro-text">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="python, deep-learning, pytorch, transformers"
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-neuro-border rounded-xl focus:outline-none focus:border-neuro-purple"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Learning Outcomes & Prerequisites */}
          <div className="bg-white rounded-3xl border border-neuro-border p-6 sm:p-8 shadow-subtle space-y-6">
            <div className="border-b border-neuro-border pb-3">
              <h3 className="text-base font-bold text-neuro-text flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-neuro-purple" />
                <span>Learning Outcomes & Prerequisites</span>
              </h3>
            </div>

            {/* Learning Outcomes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neuro-text">
                  What Students Will Learn
                </label>
                <button
                  type="button"
                  onClick={() => addArrayItem('learningOutcomes')}
                  className="text-xs text-neuro-purple hover:underline font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Outcome</span>
                </button>
              </div>

              {formData.learningOutcomes.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) =>
                      handleArrayItemChange('learningOutcomes', idx, e.target.value)
                    }
                    placeholder="e.g. Implement backpropagation from first principles"
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-neuro-border rounded-xl focus:outline-none focus:border-neuro-purple"
                  />
                  {formData.learningOutcomes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('learningOutcomes', idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Prerequisites */}
            <div className="space-y-3 pt-3 border-t border-neuro-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neuro-text">Prerequisites</label>
                <button
                  type="button"
                  onClick={() => addArrayItem('prerequisites')}
                  className="text-xs text-neuro-purple hover:underline font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Prerequisite</span>
                </button>
              </div>

              {formData.prerequisites.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) =>
                      handleArrayItemChange('prerequisites', idx, e.target.value)
                    }
                    placeholder="e.g. Basic Python familiarity"
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-neuro-border rounded-xl focus:outline-none focus:border-neuro-purple"
                  />
                  {formData.prerequisites.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('prerequisites', idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Module & Lesson Curriculum Builder */}
          <div className="bg-white rounded-3xl border border-neuro-border p-6 sm:p-8 shadow-subtle space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neuro-border pb-4">
              <div>
                <h3 className="text-base font-bold text-neuro-text flex items-center gap-2">
                  <Layers className="w-5 h-5 text-neuro-purple" />
                  <span>Module & Lesson Management</span>
                </h3>
                <p className="text-xs text-neuro-textMuted mt-0.5">
                  Organize sequential modules, configure YouTube video lessons, and attach learning objectives.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={addModule}
              >
                Add Module
              </Button>
            </div>

            {formData.modules.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-neuro-border text-xs text-neuro-textMuted">
                No modules created yet. Click "Add Module" to start structuring your curriculum.
              </div>
            ) : (
              formData.modules.map((module, modIdx) => (
                <div
                  key={modIdx}
                  className="p-5 rounded-2xl bg-slate-50/80 border border-neuro-border space-y-5"
                >
                  {/* Module Header Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                      <span className="w-7 h-7 rounded-lg bg-neuro-purple text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {modIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={module.moduleTitle}
                        onChange={(e) =>
                          handleModuleChange(modIdx, 'moduleTitle', e.target.value)
                        }
                        placeholder="Module Title (e.g., Module 1: Foundations)..."
                        className="flex-1 px-3 py-1.5 text-xs font-bold bg-white border border-neuro-border rounded-xl focus:outline-none focus:border-neuro-purple"
                        required
                      />
                    </div>

                    {/* Module Controls: Move Up, Move Down, Published Toggle, Delete */}
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-neuro-text pr-2">
                        <input
                          type="checkbox"
                          checked={module.isPublished !== false}
                          onChange={(e) =>
                            handleModuleChange(modIdx, 'isPublished', e.target.checked)
                          }
                          className="rounded text-neuro-purple focus:ring-neuro-purple w-3.5 h-3.5"
                        />
                        <span className="text-[11px] text-neuro-textMuted">Published</span>
                      </label>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={modIdx === 0}
                          onClick={() => moveModule(modIdx, -1)}
                          className="p-1.5 bg-white border border-neuro-border rounded-lg text-neuro-textMuted hover:text-neuro-purple disabled:opacity-30 disabled:pointer-events-none"
                          title="Move module up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={modIdx === formData.modules.length - 1}
                          onClick={() => moveModule(modIdx, 1)}
                          className="p-1.5 bg-white border border-neuro-border rounded-lg text-neuro-textMuted hover:text-neuro-purple disabled:opacity-30 disabled:pointer-events-none"
                          title="Move module down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {formData.modules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeModule(modIdx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg bg-white border border-neuro-border"
                          title="Delete module"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <input
                    type="text"
                    value={module.moduleDescription || ''}
                    onChange={(e) =>
                      handleModuleChange(modIdx, 'moduleDescription', e.target.value)
                    }
                    placeholder="Module description and learning focus (optional)..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neuro-border rounded-xl focus:outline-none focus:border-neuro-purple"
                  />

                  {/* Lessons Sub-list */}
                  <div className="space-y-3 pt-3 border-t border-neuro-border/70">
                    <div className="flex items-center justify-between text-xs text-neuro-text font-bold">
                      <span className="flex items-center gap-1.5">
                        <PlayCircle className="w-4 h-4 text-neuro-purple" />
                        <span>Lessons ({module.lessons?.length || 0})</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => addLesson(modIdx)}
                        className="text-neuro-purple hover:underline flex items-center gap-1 font-semibold text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Lesson</span>
                      </button>
                    </div>

                    {(module.lessons || []).length === 0 ? (
                      <div className="p-4 text-center text-xs text-neuro-textMuted bg-white rounded-xl border border-dashed border-neuro-border">
                        No lessons in this module. Click "Add Lesson" above.
                      </div>
                    ) : (
                      (module.lessons || []).map((lesson, lessonIdx) => {
                        const ytKey = `${modIdx}-${lessonIdx}`;
                        const ytState = ytStatusMap[ytKey];

                        return (
                          <div
                            key={lessonIdx}
                            className="bg-white p-4 rounded-xl border border-neuro-border space-y-3 shadow-2xs"
                          >
                            {/* Lesson Row 1: Title, Type, Duration, Reordering, Delete */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                              <div className="flex items-center gap-2 flex-1">
                                <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                                  {lessonIdx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={lesson.lessonTitle}
                                  onChange={(e) =>
                                    handleLessonChange(
                                      modIdx,
                                      lessonIdx,
                                      'lessonTitle',
                                      e.target.value
                                    )
                                  }
                                  placeholder="Lesson Title..."
                                  className="flex-1 px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-neuro-border rounded-lg"
                                  required
                                />
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <select
                                  value={lesson.lessonType}
                                  onChange={(e) =>
                                    handleLessonChange(
                                      modIdx,
                                      lessonIdx,
                                      'lessonType',
                                      e.target.value
                                    )
                                  }
                                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-neuro-border rounded-lg font-medium"
                                >
                                  <option value="video">Video</option>
                                  <option value="reading">Reading</option>
                                  <option value="quiz">Quiz</option>
                                  <option value="resource">Resource</option>
                                </select>

                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min={1}
                                    value={lesson.duration || 10}
                                    onChange={(e) =>
                                      handleLessonChange(
                                        modIdx,
                                        lessonIdx,
                                        'duration',
                                        e.target.value
                                      )
                                    }
                                    className="w-14 px-2 py-1.5 text-xs bg-slate-50 border border-neuro-border rounded-lg text-center"
                                  />
                                  <span className="text-[11px] text-neuro-textMuted">m</span>
                                </div>

                                <label className="flex items-center gap-1 cursor-pointer text-[11px] text-neuro-textMuted px-1">
                                  <input
                                    type="checkbox"
                                    checked={lesson.isPublished !== false}
                                    onChange={(e) =>
                                      handleLessonChange(
                                        modIdx,
                                        lessonIdx,
                                        'isPublished',
                                        e.target.checked
                                      )
                                    }
                                    className="rounded text-neuro-purple w-3 h-3"
                                  />
                                  <span>Active</span>
                                </label>

                                {/* Lesson Reorder buttons */}
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={lessonIdx === 0}
                                    onClick={() => moveLesson(modIdx, lessonIdx, -1)}
                                    className="p-1 text-neuro-textMuted hover:text-neuro-purple disabled:opacity-30 disabled:pointer-events-none"
                                    title="Move lesson up"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={lessonIdx === (module.lessons || []).length - 1}
                                    onClick={() => moveLesson(modIdx, lessonIdx, 1)}
                                    className="p-1 text-neuro-textMuted hover:text-neuro-purple disabled:opacity-30 disabled:pointer-events-none"
                                    title="Move lesson down"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeLesson(modIdx, lessonIdx)}
                                  className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                                  title="Delete lesson"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Lesson Description */}
                            <input
                              type="text"
                              value={lesson.lessonDescription || ''}
                              onChange={(e) =>
                                handleLessonChange(
                                  modIdx,
                                  lessonIdx,
                                  'lessonDescription',
                                  e.target.value
                                )
                              }
                              placeholder="Brief lesson summary or overview (optional)..."
                              className="w-full px-3 py-1 text-xs bg-slate-50 border border-neuro-border rounded-lg"
                            />

                            {/* Type Specific Fields */}
                            {lesson.lessonType === 'video' && (
                              <div className="p-3 bg-slate-50 rounded-xl border border-neuro-border space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-neuro-text flex items-center gap-1.5">
                                    <Youtube className="w-4 h-4 text-rose-500" />
                                    <span>YouTube Video URL</span>
                                  </span>

                                  {lesson.youtubeVideoId && (
                                    <span className="text-[11px] font-mono text-neuro-purple font-semibold bg-neuro-lavender px-2 py-0.5 rounded-md">
                                      Video ID: {lesson.youtubeVideoId}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <input
                                    type="url"
                                    value={lesson.videoUrl || ''}
                                    onChange={(e) => {
                                      handleLessonChange(
                                        modIdx,
                                        lessonIdx,
                                        'videoUrl',
                                        e.target.value
                                      );
                                    }}
                                    onBlur={(e) =>
                                      handleValidateYouTube(modIdx, lessonIdx, e.target.value)
                                    }
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-neuro-border rounded-lg font-mono focus:outline-none focus:border-neuro-purple"
                                    required
                                  />

                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleValidateYouTube(modIdx, lessonIdx, lesson.videoUrl)
                                    }
                                  >
                                    Validate
                                  </Button>
                                </div>

                                {/* Validation Feedback Badge */}
                                {ytState?.loading && (
                                  <div className="flex items-center gap-1.5 text-xs text-neuro-textMuted">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-neuro-purple" />
                                    <span>Validating link via YouTube API...</span>
                                  </div>
                                )}

                                {ytState?.valid && (
                                  <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span className="font-semibold">
                                      Valid YouTube Video (ID: {ytState.videoId})
                                    </span>
                                  </div>
                                )}

                                {ytState?.error && (
                                  <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                    <span>{ytState.error}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {lesson.lessonType === 'reading' && (
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-neuro-text">
                                  Reading Lesson Content (Text / Markdown)
                                </label>
                                <textarea
                                  rows={4}
                                  value={lesson.textContent || ''}
                                  onChange={(e) =>
                                    handleLessonChange(
                                      modIdx,
                                      lessonIdx,
                                      'textContent',
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter complete reading material for this lesson..."
                                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-neuro-border rounded-lg"
                                />
                              </div>
                            )}

                            {lesson.lessonType === 'resource' && (
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-neuro-text flex items-center gap-1">
                                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Resource / PDF Link</span>
                                </label>
                                <input
                                  type="url"
                                  value={lesson.resourceLink || ''}
                                  onChange={(e) =>
                                    handleLessonChange(
                                      modIdx,
                                      lessonIdx,
                                      'resourceLink',
                                      e.target.value
                                    )
                                  }
                                  placeholder="https://.../supplementary-notes.pdf"
                                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-neuro-border rounded-lg"
                                />
                              </div>
                            )}

                            {/* Learning Objectives for this lesson */}
                            <div className="pt-2 border-t border-neuro-border/60 space-y-2">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-semibold text-neuro-textMuted">
                                  Lesson Learning Objectives:
                                </span>
                                <button
                                  type="button"
                                  onClick={() => addLessonObjective(modIdx, lessonIdx)}
                                  className="text-neuro-purple hover:underline font-semibold"
                                >
                                  + Add Objective
                                </button>
                              </div>

                              {(lesson.learningObjectives || []).map((obj, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={obj}
                                    onChange={(e) =>
                                      handleLessonObjectiveChange(
                                        modIdx,
                                        lessonIdx,
                                        oIdx,
                                        e.target.value
                                      )
                                    }
                                    placeholder="e.g. Master gradient descent formulas..."
                                    className="flex-1 px-2.5 py-1 text-xs bg-slate-50 border border-neuro-border rounded-md"
                                  />
                                  {(lesson.learningObjectives || []).length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeLessonObjective(modIdx, lessonIdx, oIdx)
                                      }
                                      className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Section 4: Publishing and Submit */}
          <div className="bg-white rounded-3xl border border-neuro-border p-6 sm:p-8 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleInputChange}
                className="w-4 h-4 rounded text-neuro-purple focus:ring-neuro-purple border-neuro-border cursor-pointer"
              />
              <div>
                <span className="text-xs sm:text-sm font-bold text-neuro-text">
                  Publish Course to Student Catalog
                </span>
                <p className="text-[11px] text-neuro-textMuted">
                  When published, enrolled students can view modules and launch lesson video streams.
                </p>
              </div>
            </label>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                className="flex-1 sm:flex-none"
                onClick={() => navigate('/admin/courses')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                icon={Save}
                className="flex-1 sm:flex-none shadow-purple-btn"
              >
                {saving ? 'Saving Course...' : isEditing ? 'Update Course' : 'Create Course'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCourseForm;
