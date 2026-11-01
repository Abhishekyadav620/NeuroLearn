import { Router } from 'express';
import * as enrollmentController from '../controllers/enrollmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @route   GET /api/enrollments/my-courses
 * @desc    Get all courses enrolled by the authenticated student
 * @access  Private (Student)
 */
router.get('/my-courses', protect, enrollmentController.getMyCourses);

/**
 * @route   GET /api/enrollments/:courseId/status
 * @desc    Check whether student is enrolled in a specific course
 * @access  Private (Student)
 */
router.get('/:courseId/status', protect, enrollmentController.getEnrollmentStatus);

/**
 * @route   POST /api/enrollments/:courseId
 * @desc    Enroll authenticated student in a published course
 * @access  Private (Student)
 */
router.post('/:courseId', protect, enrollmentController.enrollInCourse);

export default router;
