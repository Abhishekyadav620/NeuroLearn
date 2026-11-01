import mongoose from 'mongoose';

/**
 * LearningAnalytics Schema
 * Persists aggregated, student-level learning performance and engagement indicators.
 * Updated incrementally to avoid expensive historical recalculations on every dashboard hit.
 */
const learningAnalyticsSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID reference is required'],
      unique: true,
      index: true,
    },
    totalCoursesEnrolled: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalLessonsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalLearningTime: {
      type: Number, // Total seconds
      default: 0,
      min: 0,
    },
    averageQuizScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalQuizAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageReadingTime: {
      type: Number, // Average seconds per reading session
      default: 0,
      min: 0,
    },
    averageVideoCompletion: {
      type: Number, // Percentage 0-100
      default: 0,
      min: 0,
      max: 100,
    },
    lessonRevisitCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    learningStreak: {
      type: Number,
      default: 1,
      min: 0,
    },
    lastLearningActivity: {
      type: Date,
      default: Date.now,
    },
    dailyActivity: [
      {
        date: { type: String, required: true }, // Format 'YYYY-MM-DD'
        learningTimeMinutes: { type: Number, default: 0 },
        lessonsCount: { type: Number, default: 0 },
        eventsCount: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

learningAnalyticsSchema.index({ student: 1, updatedAt: -1 });

const LearningAnalytics = mongoose.model(
  'LearningAnalytics',
  learningAnalyticsSchema
);

export default LearningAnalytics;
