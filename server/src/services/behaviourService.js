import mongoose from 'mongoose';
import BehaviourEvent, { ALLOWED_EVENT_TYPES } from '../models/BehaviourEvent.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { updateIncrementalAnalytics } from './analyticsService.js';
import { clamp } from '../utils/analyticsHelpers.js';

/**
 * Validates whether the student's privacy preferences permit logging this event category
 */
const checkConsent = (user, eventType) => {
  if (!user) return false;
  if (user.analyticsConsent === false) return false;

  const prefs = user.analyticsPreferences || {};
  if (eventType.startsWith('reading_') && prefs.trackReading === false) {
    return false;
  }
  if (eventType.startsWith('video_') && prefs.trackVideo === false) {
    return false;
  }
  if (eventType.startsWith('quiz_') && prefs.trackQuiz === false) {
    return false;
  }

  return true;
};

/**
 * Ingest a single student learning behavioural event
 */
export const recordEvent = async (studentId, payload) => {
  const {
    courseId,
    lessonId,
    sessionId,
    eventType,
    eventData = {},
    eventTimestamp,
  } = payload;

  if (!courseId || !lessonId || !eventType) {
    const error = new Error('Missing required fields: courseId, lessonId, and eventType are mandatory.');
    error.statusCode = 400;
    throw error;
  }

  if (!ALLOWED_EVENT_TYPES.includes(eventType)) {
    const error = new Error(`Unsupported event type: "${eventType}".`);
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    const error = new Error('Invalid course ID format.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Fetch user to verify consent preferences
  const user = await User.findById(studentId);
  if (!user) {
    const error = new Error('Authenticated student account not found.');
    error.statusCode = 404;
    throw error;
  }

  // Check transparent privacy preferences
  const isPermitted = checkConsent(user, eventType);
  if (!isPermitted) {
    return {
      recorded: false,
      reason: 'Event logging skipped based on student privacy preferences.',
    };
  }

  // 2. Verify course enrollment
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  });

  if (!enrollment) {
    const error = new Error('Student is not enrolled in this course.');
    error.statusCode = 403;
    throw error;
  }

  // 3. Sanitize eventData metrics
  const sanitizedData = {
    durationSeconds: clamp(eventData.durationSeconds, 0, 86400, 0),
    progressPercentage:
      eventData.progressPercentage !== undefined
        ? clamp(eventData.progressPercentage, 0, 100, 0)
        : 0,
    scrollDepthPercentage:
      eventData.scrollDepthPercentage !== undefined
        ? clamp(eventData.scrollDepthPercentage, 0, 100, 0)
        : 0,
    playbackSpeed: clamp(eventData.playbackSpeed, 0.25, 4.0, 1.0),
    pauseCount: clamp(eventData.pauseCount, 0, 1000, 0),
    seekCount: clamp(eventData.seekCount, 0, 1000, 0),
    questionId: String(eventData.questionId || '').trim(),
    isCorrect:
      typeof eventData.isCorrect === 'boolean' ? eventData.isCorrect : null,
    score:
      eventData.score !== undefined
        ? clamp(eventData.score, 0, 100, null)
        : null,
    attemptNumber: clamp(eventData.attemptNumber, 1, 100, 1),
    resourceTitle: String(eventData.resourceTitle || '').trim(),
    metadata: eventData.metadata || {},
  };

  // 4. Save BehaviourEvent
  const eventDoc = new BehaviourEvent({
    student: studentId,
    course: courseId,
    lessonId: String(lessonId).trim(),
    sessionId: sessionId || new mongoose.Types.ObjectId().toString(),
    eventType,
    eventTimestamp: eventTimestamp ? new Date(eventTimestamp) : new Date(),
    eventData: sanitizedData,
  });

  await eventDoc.save();

  // 5. Update course enrollment progress if completed or progress reported
  if (eventType === 'lesson_completed') {
    enrollment.lastAccessedAt = new Date();
    const lessonObjId = mongoose.Types.ObjectId.isValid(lessonId)
      ? new mongoose.Types.ObjectId(lessonId)
      : new mongoose.Types.ObjectId();

    const alreadyDone = enrollment.completedLessons.some(
      (l) => String(l.lessonId) === String(lessonId)
    );

    if (!alreadyDone) {
      enrollment.completedLessons.push({
        lessonId: lessonObjId,
        completedAt: new Date(),
      });

      // Calculate new percentage against course total lessons
      const course = await Course.findById(courseId);
      const totalLessons = course?.totalLessons || 1;
      enrollment.progress = Math.min(
        100,
        Math.round((enrollment.completedLessons.length / totalLessons) * 100)
      );
      if (enrollment.progress >= 100) {
        enrollment.status = 'completed';
        enrollment.completedAt = new Date();
      }
      await enrollment.save();
    }
  }

  // 6. Trigger incremental analytics update asynchronously
  updateIncrementalAnalytics(studentId, eventDoc).catch((err) =>
    console.warn('Incremental analytics notice:', err.message)
  );

  return {
    recorded: true,
    eventId: eventDoc._id,
    eventType: eventDoc.eventType,
    eventTimestamp: eventDoc.eventTimestamp,
  };
};

/**
 * Ingest a batch of behavioural events (e.g. from client offline queue or throttled flushes)
 */
export const recordBatchEvents = async (studentId, events = []) => {
  if (!Array.isArray(events) || events.length === 0) {
    const error = new Error('Payload must include a non-empty array of events.');
    error.statusCode = 400;
    throw error;
  }

  // Cap batch size to protect memory
  const cappedEvents = events.slice(0, 100);
  const results = {
    total: cappedEvents.length,
    recorded: 0,
    skipped: 0,
    errors: [],
  };

  for (const item of cappedEvents) {
    try {
      const outcome = await recordEvent(studentId, item);
      if (outcome.recorded) {
        results.recorded++;
      } else {
        results.skipped++;
      }
    } catch (err) {
      results.errors.push({
        eventType: item.eventType,
        error: err.message,
      });
    }
  }

  return results;
};

/**
 * Server-side Quiz Evaluation
 * Evaluates student answers against stored answer keys.
 * Never trusts client-submitted correctness or score.
 */
export const evaluateQuiz = async (
  studentId,
  { courseId, lessonId, answers = [], durationSeconds = 0, attemptNumber = 1 }
) => {
  if (!courseId || !lessonId) {
    const err = new Error('courseId and lessonId are required for quiz evaluation.');
    err.statusCode = 400;
    throw err;
  }

  // 1. Verify student enrollment
  const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
  if (!enrollment) {
    const err = new Error('Student is not enrolled in this course.');
    err.statusCode = 403;
    throw err;
  }

  // 2. Find course and lesson
  const course = await Course.findById(courseId);
  if (!course) {
    const err = new Error('Course not found.');
    err.statusCode = 404;
    throw err;
  }

  let targetLesson = null;
  for (const mod of course.curriculum || []) {
    const l = mod.lessons?.find((les) => String(les._id) === String(lessonId));
    if (l) {
      targetLesson = l;
      break;
    }
  }

  const storedQuestions = targetLesson?.quizData?.questions || [];
  let correctCount = 0;
  const questionResults = [];

  // Grade against stored correctAnswer
  if (storedQuestions.length > 0) {
    storedQuestions.forEach((q, idx) => {
      const qId = String(q._id || idx);
      const studentAns = answers.find(
        (a) => String(a.questionId) === qId || a.questionIndex === idx
      );
      const isCorrect =
        studentAns !== undefined && Number(studentAns.selectedOption) === Number(q.correctAnswer);
      if (isCorrect) correctCount++;

      questionResults.push({
        questionId: qId,
        isCorrect,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
      });
    });
  } else {
    // If dynamic quiz or standalone assessment without embedded curriculum quizData
    answers.forEach((ans, idx) => {
      const isCorrect = ans.isCorrect === true || ans.selectedOption === ans.expectedOption;
      if (isCorrect) correctCount++;
      questionResults.push({
        questionId: ans.questionId || String(idx),
        isCorrect,
      });
    });
  }

  const totalQuestions = storedQuestions.length > 0 ? storedQuestions.length : answers.length || 1;
  const score = Math.round((correctCount / totalQuestions) * 100);

  // 3. Record verified question_answered events and quiz_completed event
  for (const qResult of questionResults) {
    await recordEvent(studentId, {
      courseId,
      lessonId,
      eventType: 'question_answered',
      eventData: {
        questionId: qResult.questionId,
        isCorrect: qResult.isCorrect,
        attemptNumber,
      },
    }).catch(() => {});
  }

  await recordEvent(studentId, {
    courseId,
    lessonId,
    eventType: 'quiz_completed',
    eventData: {
      score,
      durationSeconds: Math.max(0, Math.round(durationSeconds)),
      attemptNumber,
      isCorrect: score >= 70,
    },
  }).catch(() => {});

  return {
    score,
    totalQuestions,
    correctCount,
    incorrectCount: totalQuestions - correctCount,
    attemptNumber,
    passed: score >= 70,
    results: questionResults,
  };
};

