import { useEffect, useRef, useCallback } from 'react';
import behaviourService from '../services/behaviourService.js';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Custom React Hook for Structured Learning Behaviour Tracking
 *
 * Provides throttled, batched, visibility-aware learning telemetry:
 * - Active reading duration calculation (pauses when browser tab is hidden)
 * - Scroll depth tracking
 * - Video playback telemetry (pauses, seeks, watch time, completion)
 * - Quiz engagement & attempt telemetry
 * - Lesson opening, revisits, and completions
 *
 * @param {Object} options
 * @param {string} options.courseId - MongoDB ObjectId of the course
 * @param {string} options.lessonId - Identifier of current lesson
 * @param {string} [options.sessionId] - Optional session ID
 * @param {boolean} [options.autoTrackReading=true] - Automatically measure visible reading time
 */
export const useLearningTracking = ({
  courseId,
  lessonId,
  sessionId,
  autoTrackReading = true,
} = {}) => {
  const { user, isAuthenticated } = useAuth();

  // Queue for batching non-urgent events
  const eventQueueRef = useRef([]);
  const flushTimerRef = useRef(null);

  // Active reading metrics refs
  const activeReadingStartRef = useRef(Date.now());
  const accumulatedReadingSecRef = useRef(0);
  const maxScrollDepthRef = useRef(0);
  const isVisibleRef = useRef(typeof document !== 'undefined' ? !document.hidden : true);
  const lastDispatchedProgressRef = useRef(0);

  // Checks whether student has given consent for telemetry
  const hasConsent = useCallback(() => {
    if (!isAuthenticated || !user) return false;
    // Default consent to true if not explicitly set to false
    return user.analyticsConsent !== false;
  }, [isAuthenticated, user]);

  /**
   * Flush queued events to backend in a single batch
   */
  const flushQueue = useCallback(async () => {
    if (eventQueueRef.current.length === 0) return;
    const batch = [...eventQueueRef.current];
    eventQueueRef.current = [];

    try {
      await behaviourService.recordBatchEvents(batch);
    } catch (err) {
      console.warn('[useLearningTracking] Flush error:', err?.message);
    }
  }, []);

  /**
   * Enqueue event for batching or immediate dispatch
   */
  const emitEvent = useCallback(
    async (eventType, eventData = {}, immediate = false) => {
      if (!courseId || !lessonId || !hasConsent()) return;

      const payload = {
        course: courseId,
        lessonId: String(lessonId),
        sessionId: sessionId || null,
        eventType,
        eventData,
      };

      if (immediate) {
        try {
          await behaviourService.recordEvent(payload);
        } catch (err) {
          console.warn(`[useLearningTracking] Immediate event '${eventType}' failed:`, err?.message);
        }
      } else {
        eventQueueRef.current.push(payload);
        // Flush when queue reaches threshold
        if (eventQueueRef.current.length >= 6) {
          flushQueue();
        }
      }
    },
    [courseId, lessonId, sessionId, hasConsent, flushQueue]
  );

  /**
   * Track lesson opened
   */
  const trackLessonOpen = useCallback(
    (isRevisit = false) => {
      emitEvent(isRevisit ? 'lesson_revisited' : 'lesson_opened', {}, true);
    },
    [emitEvent]
  );

  /**
   * Track lesson revisit explicitly
   */
  const trackLessonRevisit = useCallback(() => {
    emitEvent('lesson_revisited', {}, true);
  }, [emitEvent]);

  /**
   * Track lesson completion
   */
  const trackLessonCompletion = useCallback(
    (metadata = {}) => {
      emitEvent('lesson_completed', {
        progressPercentage: 100,
        ...metadata,
      }, true);
    },
    [emitEvent]
  );

  /**
   * Track resource opened (PDF, external link, download)
   */
  const trackResourceOpen = useCallback(
    (resourceId) => {
      emitEvent('resource_opened', {
        questionId: resourceId ? String(resourceId) : undefined,
      }, false);
    },
    [emitEvent]
  );

  /**
   * Track reading progress explicitly
   */
  const trackReadingProgress = useCallback(
    (progressPercentage, scrollDepthPercentage, durationSeconds) => {
      emitEvent('reading_progress', {
        progressPercentage: Math.min(100, Math.max(0, Math.round(progressPercentage || 0))),
        scrollDepthPercentage: Math.min(100, Math.max(0, Math.round(scrollDepthPercentage || 0))),
        durationSeconds: Math.max(0, Math.round(durationSeconds || 0)),
      }, false);
    },
    [emitEvent]
  );

  /**
   * Track reading completed
   */
  const trackReadingCompleted = useCallback(
    (durationSeconds, scrollDepthPercentage = 100) => {
      emitEvent('reading_completed', {
        durationSeconds: Math.max(0, Math.round(durationSeconds || 0)),
        progressPercentage: 100,
        scrollDepthPercentage: Math.min(100, Math.max(0, Math.round(scrollDepthPercentage))),
      }, true);
    },
    [emitEvent]
  );

  /**
   * Track video telemetry (aggregated and periodic)
   */
  const trackVideoProgress = useCallback(
    ({
      eventType = 'video_progress',
      durationSeconds = 0,
      watchedDuration = 0,
      playbackPosition = 0,
      playbackSpeed = 1,
      pauseCount = 0,
      seekCount = 0,
      completionPercentage = 0,
      immediate = false,
    } = {}) => {
      emitEvent(
        eventType,
        {
          durationSeconds: Math.max(0, Math.round(watchedDuration || 0)),
          progressPercentage: Math.min(100, Math.max(0, Math.round(completionPercentage || 0))),
          playbackSpeed: Number(playbackSpeed) || 1,
          pauseCount: Math.max(0, Number(pauseCount) || 0),
          seekCount: Math.max(0, Number(seekCount) || 0),
        },
        immediate || eventType === 'video_completed'
      );
    },
    [emitEvent]
  );

  /**
   * Track quiz engagement & submission
   */
  const trackQuizActivity = useCallback(
    ({
      eventType = 'question_answered',
      quizId,
      questionId,
      durationSeconds = 0,
      isCorrect,
      score,
      attemptNumber = 1,
      immediate = false,
    } = {}) => {
      emitEvent(
        eventType,
        {
          questionId: questionId ? String(questionId) : undefined,
          durationSeconds: Math.max(0, Math.round(durationSeconds || 0)),
          isCorrect: typeof isCorrect === 'boolean' ? isCorrect : undefined,
          score: typeof score === 'number' ? score : undefined,
          attemptNumber: Math.max(1, Number(attemptNumber) || 1),
        },
        immediate || eventType === 'quiz_submitted' || eventType === 'quiz_completed'
      );
    },
    [emitEvent]
  );

  // Setup periodic batch flush (every 8 seconds)
  useEffect(() => {
    flushTimerRef.current = setInterval(() => {
      flushQueue();
    }, 8000);

    return () => {
      if (flushTimerRef.current) clearInterval(flushTimerRef.current);
      flushQueue();
    };
  }, [flushQueue]);

  // Handle active reading & tab visibility changes
  useEffect(() => {
    if (!autoTrackReading || !courseId || !lessonId) return;

    // Reset metrics on lesson change
    activeReadingStartRef.current = Date.now();
    accumulatedReadingSecRef.current = 0;
    maxScrollDepthRef.current = 0;
    lastDispatchedProgressRef.current = 0;

    // Record reading started
    emitEvent('reading_started', {}, false);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab hidden -> pause reading accumulation
        if (isVisibleRef.current) {
          const now = Date.now();
          const activeSec = (now - activeReadingStartRef.current) / 1000;
          accumulatedReadingSecRef.current += Math.max(0, activeSec);
          isVisibleRef.current = false;
          emitEvent('reading_paused', {
            durationSeconds: Math.round(accumulatedReadingSecRef.current),
            scrollDepthPercentage: maxScrollDepthRef.current,
          }, false);
        }
      } else {
        // Tab became visible again -> resume reading accumulation
        if (!isVisibleRef.current) {
          activeReadingStartRef.current = Date.now();
          isVisibleRef.current = true;
          emitEvent('reading_resumed', {
            durationSeconds: Math.round(accumulatedReadingSecRef.current),
            scrollDepthPercentage: maxScrollDepthRef.current,
          }, false);
        }
      }
    };

    let scrollTimeout = null;
    const handleScroll = () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        scrollTimeout = null;
        if (typeof window === 'undefined') return;

        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollHeight <= 0) return;

        const currentDepth = Math.min(100, Math.max(0, Math.round((window.scrollY / scrollHeight) * 100)));
        if (currentDepth > maxScrollDepthRef.current) {
          maxScrollDepthRef.current = currentDepth;

          // Dispatch milestone progress updates (every 25%)
          if (currentDepth - lastDispatchedProgressRef.current >= 25) {
            lastDispatchedProgressRef.current = currentDepth;
            const currentActiveSec = accumulatedReadingSecRef.current +
              (isVisibleRef.current ? (Date.now() - activeReadingStartRef.current) / 1000 : 0);

            emitEvent('reading_progress', {
              scrollDepthPercentage: currentDepth,
              progressPercentage: currentDepth,
              durationSeconds: Math.round(currentActiveSec),
            }, false);
          }
        }
      }, 400);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);

      // Final unmount reading duration calculation
      const finalSec = accumulatedReadingSecRef.current +
        (isVisibleRef.current ? (Date.now() - activeReadingStartRef.current) / 1000 : 0);

      if (finalSec > 3) {
        emitEvent('reading_progress', {
          durationSeconds: Math.round(finalSec),
          scrollDepthPercentage: maxScrollDepthRef.current,
          progressPercentage: maxScrollDepthRef.current,
        }, true);
      }
    };
  }, [courseId, lessonId, autoTrackReading, emitEvent]);

  return {
    trackLessonOpen,
    trackLessonRevisit,
    trackLessonCompletion,
    trackResourceOpen,
    trackReadingProgress,
    trackReadingCompleted,
    trackVideoProgress,
    trackQuizActivity,
    flush: flushQueue,
  };
};

export default useLearningTracking;
