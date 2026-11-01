import { Router } from 'express';
import * as behaviourController from '../controllers/behaviourController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @route   POST /api/behaviour/events
 * @desc    Log a single student learning behavioural event
 * @access  Private (Authenticated student)
 */
router.post('/events', protect, behaviourController.recordEvent);

/**
 * @route   POST /api/behaviour/events/batch
 * @desc    Ingest a batch of learning behavioural events
 * @access  Private (Authenticated student)
 */
router.post('/events/batch', protect, behaviourController.recordBatchEvents);

/**
 * @route   POST /api/behaviour/quiz/evaluate
 * @desc    Evaluate quiz answers server-side against answer keys and record verified telemetry
 * @access  Private (Authenticated student)
 */
router.post('/quiz/evaluate', protect, behaviourController.evaluateQuiz);

export default router;
