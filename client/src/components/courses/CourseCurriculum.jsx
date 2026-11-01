import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  PlayCircle,
  FileText,
  HelpCircle,
  Code,
  Clock,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export const CourseCurriculum = ({ modules = [], courseSlug = null }) => {
  // By default expand the first module
  const [expandedModules, setExpandedModules] = useState({ 0: true });

  const toggleModule = (index) => {
    setExpandedModules((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const expandAll = () => {
    const all = {};
    modules.forEach((_, idx) => {
      all[idx] = true;
    });
    setExpandedModules(all);
  };

  const collapseAll = () => {
    setExpandedModules({});
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="w-4 h-4 text-neuro-purple" />;
      case 'reading':
        return <FileText className="w-4 h-4 text-sky-500" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4 text-amber-500" />;
      case 'interactive':
      case 'assignment':
        return <Code className="w-4 h-4 text-emerald-500" />;
      default:
        return <PlayCircle className="w-4 h-4 text-neuro-purple" />;
    }
  };

  if (!modules || modules.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-neuro-textMuted bg-slate-50 rounded-2xl border border-neuro-border">
        Curriculum details are being finalized for this course.
      </div>
    );
  }

  const totalLessons = modules.reduce(
    (sum, m) => sum + (m.lessons ? m.lessons.length : 0),
    0
  );

  return (
    <div className="space-y-4">
      {/* Curriculum Summary Header */}
      <div className="flex items-center justify-between pb-2 text-xs">
        <span className="text-neuro-textMuted font-medium">
          {modules.length} {modules.length === 1 ? 'Module' : 'Modules'} • {totalLessons} Lessons
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={expandAll}
            className="text-neuro-purple hover:underline font-semibold text-xs"
          >
            Expand All
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-neuro-textMuted hover:text-neuro-text font-semibold text-xs"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-3">
        {modules.map((module, modIndex) => {
          const isExpanded = !!expandedModules[modIndex];
          const lessons = module.lessons || [];
          const moduleDuration = lessons.reduce(
            (acc, l) => acc + (Number(l.duration) || 0),
            0
          );

          return (
            <div
              key={module._id || modIndex}
              className="border border-neuro-border rounded-2xl overflow-hidden bg-white shadow-subtle transition-all"
            >
              {/* Module Accordion Header */}
              <button
                type="button"
                onClick={() => toggleModule(modIndex)}
                className="w-full px-5 py-4 flex items-center justify-between bg-slate-50/70 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 pr-4">
                  <div className="w-7 h-7 rounded-xl bg-neuro-lavender flex items-center justify-center text-neuro-purple font-bold text-xs shrink-0">
                    {modIndex + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neuro-text">
                      {module.moduleTitle}
                    </h4>
                    {module.moduleDescription && (
                      <p className="text-xs text-neuro-textMuted line-clamp-1 mt-0.5">
                        {module.moduleDescription}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-neuro-textMuted hidden sm:inline-block">
                    {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'} • {moduleDuration}m
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-white border border-neuro-border flex items-center justify-center text-neuro-textMuted">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </button>

              {/* Lessons Sub-list */}
              {isExpanded && (
                <div className="divide-y divide-neuro-border/60 bg-white">
                  {lessons.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neuro-textMuted">
                      No lessons added yet.
                    </div>
                  ) : (
                    lessons.map((lesson, lessonIndex) => {
                      const lessonContent = (
                        <>
                          <div className="flex items-center gap-3 pr-4">
                            <div className="p-1.5 rounded-lg bg-slate-50 border border-neuro-border group-hover:bg-neuro-lavender transition-colors">
                              {getLessonIcon(lesson.lessonType)}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-neuro-text group-hover:text-neuro-purple transition-colors">
                                {lesson.lessonTitle}
                              </p>
                              {lesson.lessonDescription && (
                                <p className="text-[11px] text-neuro-textMuted line-clamp-1">
                                  {lesson.lessonDescription}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-neuro-textMuted shrink-0">
                            <span className="capitalize text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                              {lesson.lessonType || 'video'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-neuro-purpleLight" />
                              {lesson.duration || 10}m
                            </span>
                            {courseSlug && (
                              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-neuro-purple font-semibold ml-1">
                                <span>Start</span>
                                <ArrowRight className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </>
                      );

                      return courseSlug ? (
                        <Link
                          key={lesson._id || lessonIndex}
                          to={`/courses/${courseSlug}/lessons/${lesson._id}`}
                          className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/70 transition-colors group cursor-pointer"
                        >
                          {lessonContent}
                        </Link>
                      ) : (
                        <div
                          key={lesson._id || lessonIndex}
                          className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/40 transition-colors"
                        >
                          {lessonContent}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseCurriculum;
