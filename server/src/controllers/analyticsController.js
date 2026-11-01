import * as analyticsService from '../services/analyticsService.js';
import * as datasetService from '../services/datasetService.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Controller: Get student analytics overview cards
 * GET /api/analytics/overview
 */
export const getOverview = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const overview = await analyticsService.getStudentOverview(studentId);

    return successResponse(res, {
      statusCode: 200,
      message: 'Student analytics overview retrieved',
      data: overview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get Monday-to-Sunday weekly learning activity
 * GET /api/analytics/weekly-activity
 */
export const getWeeklyActivity = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const weekly = await analyticsService.getWeeklyActivity(studentId);

    return successResponse(res, {
      statusCode: 200,
      message: 'Weekly learning activity retrieved',
      data: weekly,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get course completion and lesson progress
 * GET /api/analytics/course-progress
 */
export const getCourseProgress = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const progress = await analyticsService.getCourseProgressAnalytics(studentId);

    return successResponse(res, {
      statusCode: 200,
      message: 'Course progress analytics retrieved',
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get quiz performance metrics and score trend
 * GET /api/analytics/quiz-performance
 */
export const getQuizPerformance = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const quiz = await analyticsService.getQuizPerformanceAnalytics(studentId);

    return successResponse(res, {
      statusCode: 200,
      message: 'Quiz performance analytics retrieved',
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get behavioral learning insights (active day, revisits, etc.)
 * GET /api/analytics/learning-insights
 */
export const getLearningInsights = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const insights = await analyticsService.getLearningInsights(studentId);

    return successResponse(res, {
      statusCode: 200,
      message: 'Learning insights retrieved',
      data: insights,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get chronological recent activity timeline
 * GET /api/analytics/recent-activity
 */
export const getRecentActivity = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const limit = parseInt(req.query.limit, 10) || 10;
    const activity = await analyticsService.getRecentActivity(studentId, limit);

    return successResponse(res, {
      statusCode: 200,
      message: 'Recent activity feed retrieved',
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get current student's analytics consent & privacy preferences
 * GET /api/analytics/preferences
 */
export const getPreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      'analyticsConsent analyticsPreferences'
    );

    return successResponse(res, {
      statusCode: 200,
      message: 'Analytics privacy preferences retrieved',
      data: {
        consent: user.analyticsConsent,
        preferences: user.analyticsPreferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Update student's analytics consent & privacy preferences
 * PUT /api/analytics/preferences
 */
export const updatePreferences = async (req, res, next) => {
  try {
    const { consent, preferences } = req.body;
    const user = await User.findById(req.user._id);

    if (consent !== undefined) {
      user.analyticsConsent = Boolean(consent);
    }
    if (preferences && typeof preferences === 'object') {
      user.analyticsPreferences = {
        ...user.analyticsPreferences,
        ...preferences,
      };
    }

    await user.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'Analytics preferences updated successfully',
      data: {
        consent: user.analyticsConsent,
        preferences: user.analyticsPreferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Export anonymized ML dataset CSV (Admin only)
 * GET /api/analytics/dataset/export
 */
export const exportDataset = async (req, res, next) => {
  try {
    const csvContent = await datasetService.exportDatasetToCSV();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="student_learning_dataset.csv"'
    );
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
