import { errorResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

/**
 * Centralized Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  logger.error(`Unhandled Error [${req.method} ${req.url}]:`, err.stack || err.message);

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const message = err.message || 'Internal Server Error';

  return errorResponse(res, {
    statusCode,
    message,
    errors: err.errors || null,
    stack: err.stack,
  });
};
