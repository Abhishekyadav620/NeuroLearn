import mongoose from 'mongoose';
import BehaviourEvent from '../models/BehaviourEvent.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import { anonymizeStudentId, clamp } from '../utils/analyticsHelpers.js';

/**
 * Dataset Service
 * Transforms raw behavioral event logs and enrollment records into an
 * anonymized, normalized feature matrix ready for machine learning pipelines.
 */

export const ML_FEATURE_HEADERS = [
  'anonymous_student_id',
  'course_id',
  'lesson_id',
  'reading_time',
  'video_watch_time',
  'video_completion',
  'scroll_depth',
  'quiz_score',
  'quiz_attempts',
  'response_time',
  'pause_count',
  'revisit_count',
  'session_duration',
  'completion_rate',
];

/**
 * Extract and normalize ML feature records for all students who provided research consent
 */
export const generateMLFeatureMatrix = async () => {
  // 1. Filter students who explicitly agreed to research data collection
  const consentedUsers = await User.find({
    analyticsConsent: true,
    'analyticsPreferences.allowAnonymizedResearch': { $ne: false },
  }).select('_id');

  const consentedStudentIds = consentedUsers.map((u) => u._id);

  if (consentedStudentIds.length === 0) {
    return [];
  }

  // 2. Fetch all behavioral events for consented students
  const events = await BehaviourEvent.find({
    student: { $in: consentedStudentIds },
  })
    .sort({ eventTimestamp: 1 })
    .lean();

  // 3. Fetch enrollments for completion_rate calculation
  const enrollments = await Enrollment.find({
    student: { $in: consentedStudentIds },
  }).lean();

  const enrollmentMap = new Map();
  enrollments.forEach((e) => {
    const key = `${String(e.student)}_${String(e.course)}`;
    enrollmentMap.set(key, e.progress || 0);
  });

  // Group events by student, course, and lessonId into interaction sessions
  const interactionGroups = new Map();

  events.forEach((ev) => {
    const key = `${String(ev.student)}_${String(ev.course)}_${ev.lessonId}`;
    if (!interactionGroups.has(key)) {
      interactionGroups.set(key, {
        student: ev.student,
        course: ev.course,
        lessonId: ev.lessonId,
        readingTime: 0,
        videoWatchTime: 0,
        videoCompletion: 0,
        scrollDepth: 0,
        quizScore: null,
        quizAttempts: 0,
        responseTime: 0,
        pauseCount: 0,
        revisitCount: 0,
        sessionDuration: 0,
        sessionTimestamps: [],
      });
    }

    const group = interactionGroups.get(key);
    group.sessionTimestamps.push(new Date(ev.eventTimestamp).getTime());

    const data = ev.eventData || {};

    if (ev.eventType.startsWith('reading_')) {
      group.readingTime += Number(data.durationSeconds) || 0;
      if (data.scrollDepthPercentage) {
        group.scrollDepth = Math.max(group.scrollDepth, data.scrollDepthPercentage);
      }
    } else if (ev.eventType.startsWith('video_')) {
      group.videoWatchTime += Number(data.durationSeconds) || 0;
      group.pauseCount += Number(data.pauseCount) || 0;
      if (data.progressPercentage) {
        group.videoCompletion = Math.max(group.videoCompletion, data.progressPercentage);
      }
    } else if (ev.eventType.startsWith('quiz_')) {
      group.quizAttempts += 1;
      if (data.score !== null && data.score !== undefined) {
        group.quizScore = Number(data.score);
      }
      if (data.durationSeconds) {
        group.responseTime = Number(data.durationSeconds);
      }
    } else if (ev.eventType === 'lesson_revisited') {
      group.revisitCount += 1;
    }
  });

  // 4. Construct normalized feature rows
  const featureMatrix = [];

  for (const group of interactionGroups.values()) {
    // Calculate total session duration from timestamp spans
    let sessionDuration = 0;
    if (group.sessionTimestamps.length > 1) {
      const minTime = Math.min(...group.sessionTimestamps);
      const maxTime = Math.max(...group.sessionTimestamps);
      sessionDuration = Math.round((maxTime - minTime) / 1000);
    } else {
      sessionDuration = group.readingTime + group.videoWatchTime;
    }

    const enrollKey = `${String(group.student)}_${String(group.course)}`;
    const completionRate = enrollmentMap.get(enrollKey) || 0;

    featureMatrix.push({
      anonymous_student_id: anonymizeStudentId(group.student),
      course_id: String(group.course),
      lesson_id: group.lessonId,
      reading_time: clamp(group.readingTime, 0, 86400, 0),
      video_watch_time: clamp(group.videoWatchTime, 0, 86400, 0),
      video_completion: clamp(group.videoCompletion, 0, 100, 0),
      scroll_depth: clamp(group.scrollDepth, 0, 100, 0),
      quiz_score: group.quizScore !== null ? clamp(group.quizScore, 0, 100, 0) : '',
      quiz_attempts: clamp(group.quizAttempts, 0, 100, 0),
      response_time: clamp(group.responseTime, 0, 3600, 0),
      pause_count: clamp(group.pauseCount, 0, 500, 0),
      revisit_count: clamp(group.revisitCount, 0, 100, 0),
      session_duration: clamp(sessionDuration, 0, 86400, 0),
      completion_rate: clamp(completionRate, 0, 100, 0),
    });
  }

  return featureMatrix;
};

/**
 * Generate CSV formatted string from the extracted ML feature matrix
 */
export const exportDatasetToCSV = async () => {
  const records = await generateMLFeatureMatrix();

  if (records.length === 0) {
    return ML_FEATURE_HEADERS.join(',') + '\n';
  }

  const rows = [ML_FEATURE_HEADERS.join(',')];

  records.forEach((rec) => {
    const rowValues = ML_FEATURE_HEADERS.map((header) => {
      const val = rec[header];
      return val !== undefined && val !== null ? `"${val}"` : '""';
    });
    rows.push(rowValues.join(','));
  });

  return rows.join('\n');
};
