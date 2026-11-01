import { errorResponse } from '../utils/apiResponse.js';

/**
 * 404 Route Not Found Middleware
 */
export const notFoundHandler = (req, res, next) => {
  return errorResponse(res, {
    statusCode: 404,
    message: `Resource not found at endpoint: ${req.method} ${req.originalUrl}`,
  });
};
