import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @route   GET /api/analytics/overview
 * @desc    Get student overall analytics metrics
 * @access  Private (Student)
 */
router.get('/overview', protect, analyticsController.getOverview);

/**
 * @route   GET /api/analytics/weekly-activity
 * @desc    Get Monday-to-Sunday weekly learning time chart data
 * @access  Private (Student)
 */
router.get('/weekly-activity', protect, analyticsController.getWeeklyActivity);

/**
 * @route   GET /api/analytics/course-progress
 * @desc    Get course progress metrics
 * @access  Private (Student)
 */
router.get('/course-progress', protect, analyticsController.getCourseProgress);

/**
 * @route   GET /api/analytics/quiz-performance
 * @desc    Get quiz score trends and statistics
 * @access  Private (Student)
 */
router.get('/quiz-performance', protect, analyticsController.getQuizPerformance);

/**
 * @route   GET /api/analytics/learning-insights
 * @desc    Get measurable learning behavioral insights
 * @access  Private (Student)
 */
router.get('/learning-insights', protect, analyticsController.getLearningInsights);

/**
 * @route   GET /api/analytics/recent-activity
 * @desc    Get chronological learning activity timeline
 * @access  Private (Student)
 */
router.get('/recent-activity', protect, analyticsController.getRecentActivity);

/**
 * @route   GET /api/analytics/preferences
 * @desc    Get student's learning analytics privacy preferences
 * @access  Private (Student)
 */
router.get('/preferences', protect, analyticsController.getPreferences);

/**
 * @route   PUT /api/analytics/preferences
 * @desc    Update student's learning analytics privacy preferences
 * @access  Private (Student)
 */
router.put('/preferences', protect, analyticsController.updatePreferences);

/**
 * @route   GET /api/analytics/dataset/export
 * @desc    Export anonymized student learning feature matrix as CSV
 * @access  Private (Admin only)
 */
router.get(
  '/dataset/export',
  protect,
  authorize('admin'),
  analyticsController.exportDataset
);

export default router;
