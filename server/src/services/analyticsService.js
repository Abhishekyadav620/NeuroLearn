import mongoose from 'mongoose';
import LearningAnalytics from '../models/LearningAnalytics.js';
import BehaviourEvent from '../models/BehaviourEvent.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import {
  formatDateKey,
  getLast7DaysMetadata,
  calculateStreak,
} from '../utils/analyticsHelpers.js';

/**
 * Incrementally update aggregated learning analytics for a student
 */
export const updateIncrementalAnalytics = async (studentId, eventDoc) => {
  let analytics = await LearningAnalytics.findOne({ student: studentId });

  if (!analytics) {
    const enrolledCount = await Enrollment.countDocuments({ student: studentId });
    analytics = new LearningAnalytics({
      student: studentId,
      totalCoursesEnrolled: enrolledCount,
      dailyActivity: [],
    });
  }

  const { eventType, eventData = {}, eventTimestamp = new Date() } = eventDoc;
  const durationSec = Number(eventData.durationSeconds) || 0;
  const todayKey = formatDateKey(eventTimestamp);

  // 1. Accumulate learning time
  if (durationSec > 0) {
    analytics.totalLearningTime += durationSec;
  }

  // 2. Event-specific metrics updates
  if (eventType === 'lesson_completed') {
    analytics.totalLessonsCompleted += 1;
  } else if (eventType === 'lesson_revisited') {
    analytics.lessonRevisitCount += 1;
  } else if (
    eventType === 'quiz_completed' ||
    eventType === 'quiz_submitted'
  ) {
    const score = Number(eventData.score);
    if (!isNaN(score)) {
      const currentAttempts = analytics.totalQuizAttempts;
      const currentAvg = analytics.averageQuizScore;
      analytics.averageQuizScore = Math.round(
        (currentAvg * currentAttempts + score) / (currentAttempts + 1)
      );
      analytics.totalQuizAttempts += 1;
    }
  } else if (
    eventType === 'video_completed' ||
    eventType === 'video_progress'
  ) {
    const pct = Number(eventData.progressPercentage);
    if (!isNaN(pct) && pct > 0) {
      analytics.averageVideoCompletion = Math.min(
        100,
        Math.round((analytics.averageVideoCompletion + pct) / 2)
      );
    }
  } else if (eventType === 'reading_completed' || eventType === 'reading_progress') {
    if (durationSec > 0) {
      analytics.averageReadingTime = Math.round(
        (analytics.averageReadingTime + durationSec) / 2
      );
    }
  }

  // 3. Update daily activity bucketing
  let dayEntry = analytics.dailyActivity.find((d) => d.date === todayKey);
  if (!dayEntry) {
    analytics.dailyActivity.push({
      date: todayKey,
      learningTimeMinutes: Math.round(durationSec / 60),
      lessonsCount: eventType === 'lesson_completed' ? 1 : 0,
      eventsCount: 1,
    });
  } else {
    dayEntry.learningTimeMinutes += Math.round(durationSec / 60);
    dayEntry.eventsCount += 1;
    if (eventType === 'lesson_completed') {
      dayEntry.lessonsCount += 1;
    }
  }

  // Keep last 30 days only to bound subdocument array size
  if (analytics.dailyActivity.length > 30) {
    analytics.dailyActivity = analytics.dailyActivity.slice(-30);
  }

  // 4. Update learning streak and activity timestamp
  analytics.learningStreak = calculateStreak(analytics.dailyActivity);
  analytics.lastLearningActivity = new Date();

  // 5. Sync total courses count
  const currentEnrollmentCount = await Enrollment.countDocuments({
    student: studentId,
  });
  analytics.totalCoursesEnrolled = currentEnrollmentCount;

  await analytics.save();
  return analytics;
};

/**
 * Retrieve high-level student analytics overview
 */
export const getStudentOverview = async (studentId) => {
  let analytics = await LearningAnalytics.findOne({ student: studentId });

  const enrolledCount = await Enrollment.countDocuments({ student: studentId });
  const completedEnrollments = await Enrollment.find({ student: studentId }).lean();
  const actualCompletedLessons = completedEnrollments.reduce(
    (acc, e) => acc + (e.completedLessons ? e.completedLessons.length : 0),
    0
  );

  if (!analytics) {
    return {
      totalLearningHours: 0,
      totalLearningMinutes: 0,
      totalLessonsCompleted: actualCompletedLessons,
      averageQuizScore: 0,
      totalCoursesEnrolled: enrolledCount,
      learningStreak: 1,
      lastLearningActivity: new Date(),
    };
  }

  const totalMinutes = Math.round((analytics.totalLearningTime || 0) / 60);
  const totalHours = Number((totalMinutes / 60).toFixed(1));

  return {
    totalLearningHours: totalHours,
    totalLearningMinutes: totalMinutes,
    totalLessonsCompleted: Math.max(
      analytics.totalLessonsCompleted || 0,
      actualCompletedLessons
    ),
    averageQuizScore: analytics.averageQuizScore || 0,
    totalCoursesEnrolled: enrolledCount,
    learningStreak: analytics.learningStreak || 1,
    lastLearningActivity: analytics.lastLearningActivity || new Date(),
  };
};

/**
 * Retrieve Monday-to-Sunday weekly learning activity chart data
 */
export const getWeeklyActivity = async (studentId) => {
  const daysMeta = getLast7DaysMetadata();
  const analytics = await LearningAnalytics.findOne({ student: studentId }).lean();

  const activityMap = new Map();
  if (analytics && Array.isArray(analytics.dailyActivity)) {
    analytics.dailyActivity.forEach((item) => {
      activityMap.set(item.date, item.learningTimeMinutes || 0);
    });
  }

  let totalWeeklyMinutes = 0;
  const daily = daysMeta.map(({ date, day }) => {
    const minutes = activityMap.get(date) || 0;
    totalWeeklyMinutes += minutes;
    return {
      date,
      day,
      minutes,
      hours: Number((minutes / 60).toFixed(1)),
    };
  });

  return {
    weeklyMinutes: totalWeeklyMinutes,
    weeklyHours: Number((totalWeeklyMinutes / 60).toFixed(1)),
    totalWeeklyHours: Number((totalWeeklyMinutes / 60).toFixed(1)),
    daily,
    days: daily,
  };
};

/**
 * Retrieve granular course completion and lesson progress
 */
export const getCourseProgressAnalytics = async (studentId) => {
  const enrollments = await Enrollment.find({ student: studentId })
    .populate('course', 'title slug category level totalLessons')
    .sort({ lastAccessedAt: -1 })
    .lean();

  return enrollments
    .filter((e) => e.course)
    .map((e) => ({
      enrollmentId: e._id,
      courseId: e.course._id,
      title: e.course.title,
      slug: e.course.slug,
      category: e.course.category,
      level: e.course.level,
      progress: e.progress || 0,
      completedLessons: e.completedLessons ? e.completedLessons.length : 0,
      totalLessons: e.course.totalLessons || 0,
      status: e.status,
      enrolledAt: e.enrolledAt,
      lastAccessedAt: e.lastAccessedAt,
    }));
};

/**
 * Retrieve quiz performance analytics (averages, best score, trend)
 */
export const getQuizPerformanceAnalytics = async (studentId) => {
  const quizEvents = await BehaviourEvent.find({
    student: studentId,
    eventType: { $in: ['quiz_completed', 'quiz_submitted'] },
    'eventData.score': { $ne: null },
  })
    .sort({ eventTimestamp: 1 })
    .limit(30)
    .lean();

  if (quizEvents.length === 0) {
    return {
      averageScore: 0,
      bestScore: 0,
      totalAttempts: 0,
      scoreTrend: [],
    };
  }

  const scores = quizEvents.map((e) => Number(e.eventData.score) || 0);
  const totalScore = scores.reduce((sum, s) => sum + s, 0);
  const avg = Math.round(totalScore / scores.length);
  const best = Math.max(...scores);

  const scoreTrend = quizEvents.map((e, idx) => ({
    attempt: idx + 1,
    score: Number(e.eventData.score) || 0,
    date: formatDateKey(e.eventTimestamp),
  }));

  return {
    averageScore: avg,
    bestScore: best,
    totalAttempts: quizEvents.length,
    scoreTrend,
  };
};

/**
 * Retrieve learning behaviour insights (most active day, revisits, video completion)
 */
export const getLearningInsights = async (studentId) => {
  const analytics = await LearningAnalytics.findOne({ student: studentId }).lean();

  // Aggregate most active day from daily activity
  const dayTotals = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (analytics && Array.isArray(analytics.dailyActivity)) {
    analytics.dailyActivity.forEach((item) => {
      const d = new Date(item.date);
      const name = dayNames[d.getUTCDay()];
      if (name) {
        dayTotals[name] += item.learningTimeMinutes || 0;
      }
    });
  }

  let mostActiveDay = 'Wednesday';
  let maxDayMinutes = -1;
  Object.entries(dayTotals).forEach(([day, mins]) => {
    if (mins > maxDayMinutes) {
      maxDayMinutes = mins;
      mostActiveDay = day;
    }
  });

  // Query top revisited lessons
  const revisitEvents = await BehaviourEvent.aggregate([
    { $match: { student: new mongoose.Types.ObjectId(studentId), eventType: 'lesson_revisited' } },
    { $group: { _id: '$lessonId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 3 },
  ]);

  return {
    mostActiveDay,
    averageSessionMinutes: analytics?.averageReadingTime
      ? Math.max(5, Math.round(analytics.averageReadingTime / 60))
      : 18,
    revisitCount: analytics?.lessonRevisitCount || 0,
    topRevisitedLessonIds: revisitEvents.map((r) => r._id),
    averageVideoCompletion: analytics?.averageVideoCompletion || 85,
    averageReadingTimeMinutes: analytics?.averageReadingTime
      ? Math.round(analytics.averageReadingTime / 60)
      : 12,
  };
};

/**
 * Retrieve chronological recent activity feed
 */
export const getRecentActivity = async (studentId, limit = 10) => {
  const events = await BehaviourEvent.find({
    student: studentId,
    eventType: {
      $in: [
        'lesson_completed',
        'quiz_completed',
        'quiz_submitted',
        'video_completed',
        'reading_completed',
      ],
    },
  })
    .populate('course', 'title slug')
    .sort({ eventTimestamp: -1 })
    .limit(limit)
    .lean();

  return events.map((e) => ({
    id: e._id,
    eventType: e.eventType,
    timestamp: e.eventTimestamp,
    courseTitle: e.course?.title || 'NeuroLearn Adaptive Course',
    lessonId: e.lessonId,
    score: e.eventData?.score,
    durationSeconds: e.eventData?.durationSeconds,
  }));
};
