import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import {
  validateRegistrationMiddleware,
  validateLoginMiddleware,
} from '../validators/authValidator.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new student account
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
 * @desc    Authenticate student and issue JWT token
 * @access  Public
 */
router.post(
  '/login',
  authRateLimiter,
  validateLoginMiddleware,
  authController.login
);

/**
 * @route   POST /api/auth/logout
 * @desc    Client logout endpoint (stateless JWT notice)
 * @access  Public
 */
router.post('/logout', authController.logout);

export default router;
