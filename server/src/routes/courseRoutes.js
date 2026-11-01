import { Router } from 'express';
import * as courseController from '../controllers/courseController.js';
import { protect, authorize, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @route   GET /api/courses
 * @desc    Get published courses with search, filtering, and pagination
 * @access  Public (Optional auth for admin preview)
 */
router.get('/', optionalAuth, courseController.getCourses);

/**
 * @route   GET /api/courses/categories
 * @desc    Get all categories with active course counts
 * @access  Public
 */
router.get('/categories', courseController.getCategories);

/**
 * @route   GET /api/courses/id/:courseId
 * @desc    Get course by MongoDB ID (for Admin editors)
 * @access  Private (Admin only)
 */
router.get(
  '/id/:courseId',
  protect,
  authorize('admin'),
  courseController.getCourseById
);

/**
 * @route   GET /api/courses/:slug
 * @desc    Get course details by slug or ID
 * @access  Public (Optional auth for admin preview)
 */
router.get('/:slug', optionalAuth, courseController.getCourseBySlug);

/**
 * @route   POST /api/courses
 * @desc    Create a new course
 * @access  Private (Admin only)
 */
router.post(
  '/',
  protect,
  authorize('admin'),
  courseController.createCourse
);

/**
 * @route   PUT /api/courses/:courseId
 * @desc    Update an existing course
 * @access  Private (Admin only)
 */
router.put(
  '/:courseId',
  protect,
  authorize('admin'),
  courseController.updateCourse
);

/**
 * @route   DELETE /api/courses/:courseId
 * @desc    Delete a course and associated enrollments
 * @access  Private (Admin only)
 */
router.delete(
  '/:courseId',
  protect,
  authorize('admin'),
  courseController.deleteCourse
);

/**
 * @route   PATCH /api/courses/:courseId/publish
 * @desc    Toggle course publication status
 * @access  Private (Admin only)
 */
router.patch(
  '/:courseId/publish',
  protect,
  authorize('admin'),
  courseController.toggleCoursePublish
);

/**
 * @route   POST /api/courses/validate-youtube
 * @desc    Validate YouTube video URL and extract video metadata
 * @access  Private (Admin only)
 */
router.post(
  '/validate-youtube',
  protect,
  authorize('admin'),
  courseController.validateYouTubeUrl
);

/**
 * @route   GET /api/courses/:slug/lessons/:lessonId
 * @desc    Retrieve lesson details for interactive learning viewer
 * @access  Public / Authenticated
 */
router.get(
  '/:slug/lessons/:lessonId',
  optionalAuth,
  courseController.getLessonDetails
);

/* ==========================================================================
   MODULE MANAGEMENT ROUTES (ADMIN ONLY)
   ========================================================================== */

/**
 * @route   POST /api/courses/:courseId/modules
 * @desc    Create a new module in course
 * @access  Private (Admin only)
 */
router.post(
  '/:courseId/modules',
  protect,
  authorize('admin'),
  courseController.createModule
);

/**
 * @route   PATCH /api/courses/:courseId/modules/reorder
 * @desc    Reorder modules in course
 * @access  Private (Admin only)
 */
router.patch(
  '/:courseId/modules/reorder',
  protect,
  authorize('admin'),
  courseController.reorderModules
);

/**
 * @route   PUT /api/courses/:courseId/modules/:moduleId
 * @desc    Update module details
 * @access  Private (Admin only)
 */
router.put(
  '/:courseId/modules/:moduleId',
  protect,
  authorize('admin'),
  courseController.updateModule
);

/**
 * @route   DELETE /api/courses/:courseId/modules/:moduleId
 * @desc    Delete module and its lessons
 * @access  Private (Admin only)
 */
router.delete(
  '/:courseId/modules/:moduleId',
  protect,
  authorize('admin'),
  courseController.deleteModule
);

/* ==========================================================================
   LESSON MANAGEMENT ROUTES (ADMIN ONLY)
   ========================================================================== */

/**
 * @route   POST /api/courses/:courseId/modules/:moduleId/lessons
 * @desc    Create a new lesson in module
 * @access  Private (Admin only)
 */
router.post(
  '/:courseId/modules/:moduleId/lessons',
  protect,
  authorize('admin'),
  courseController.createLesson
);

/**
 * @route   PATCH /api/courses/:courseId/modules/:moduleId/lessons/reorder
 * @desc    Reorder lessons in module
 * @access  Private (Admin only)
 */
router.patch(
  '/:courseId/modules/:moduleId/lessons/reorder',
  protect,
  authorize('admin'),
  courseController.reorderLessons
);

/**
 * @route   PUT /api/courses/:courseId/modules/:moduleId/lessons/:lessonId
 * @desc    Update lesson details
 * @access  Private (Admin only)
 */
router.put(
  '/:courseId/modules/:moduleId/lessons/:lessonId',
  protect,
  authorize('admin'),
  courseController.updateLesson
);

/**
 * @route   DELETE /api/courses/:courseId/modules/:moduleId/lessons/:lessonId
 * @desc    Delete lesson from module
 * @access  Private (Admin only)
 */
router.delete(
  '/:courseId/modules/:moduleId/lessons/:lessonId',
  protect,
  authorize('admin'),
  courseController.deleteLesson
);

export default router;
