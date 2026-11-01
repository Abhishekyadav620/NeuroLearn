import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import {
  validateRegistrationMiddleware,
  validateLoginMiddleware,
} from '../validators/authValidator.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new student account and set HttpOnly session cookie
 * @access  Public
 */
router.post(
  '/register',
  authRateLimiter,
  validateRegistrationMiddleware,
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate student and set HttpOnly session cookie
 * @access  Public
 */
router.post(
  '/login',
  authRateLimiter,
  validateLoginMiddleware,
  authController.login
);

/**
 * @route   GET /api/auth/me
 * @desc    Retrieve currently authenticated user profile
 * @access  Private (Requires valid HttpOnly session cookie or Bearer token)
 */
router.get('/me', protect, authController.getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Client logout endpoint (clears HttpOnly cookie)
 * @access  Public
 */
router.post('/logout', authController.logout);

export default router;
