import * as behaviourService from '../services/behaviourService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Controller: Log a single behavioural event
 * POST /api/behaviour/events
 */
export const recordEvent = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const result = await behaviourService.recordEvent(studentId, req.body);

    return successResponse(res, {
      statusCode: 201,
      message: result.recorded
        ? 'Behavioural event recorded successfully'
        : result.reason || 'Event skipped based on preferences',
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, {
        statusCode: error.statusCode,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Controller: Ingest a batch of behavioural events
 * POST /api/behaviour/events/batch
 */
export const recordBatchEvents = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { events } = req.body;

    const result = await behaviourService.recordBatchEvents(studentId, events);

    return successResponse(res, {
      statusCode: 201,
      message: `Batch processed: ${result.recorded} recorded, ${result.skipped} skipped`,
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, {
        statusCode: error.statusCode,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Controller: Server-side Quiz Answer Evaluation
 * POST /api/behaviour/quiz/evaluate
 */
export const evaluateQuiz = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const result = await behaviourService.evaluateQuiz(studentId, req.body);

    return successResponse(res, {
      statusCode: 200,
      message: 'Quiz evaluated successfully with server-verified scoring.',
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, {
        statusCode: error.statusCode,
        message: error.message,
      });
    }
    next(error);
  }
};

