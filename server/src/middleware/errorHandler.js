import { errorResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

/**
 * Centralized Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  logger.error(`Error [${req.method} ${req.url}]:`, err.message);

  let statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const validationMessages = Object.values(err.errors).map((e) => e.message);
    message = validationMessages.join('. ') || 'Validation failed. Please check your input fields.';
    errors = validationMessages;
  }

  // Handle MongoDB Duplicate Key (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const duplicateField = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[duplicateField] : '';
    message = `A record with this ${duplicateField} ("${value}") already exists. Please choose a different one.`;
    errors = [message];
  }

  // Handle Mongoose CastError (e.g. malformed ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for parameter "${err.path}". Expected valid identifier.`;
    errors = [message];
  }

  // Handle JWT Auth Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
  }

  return errorResponse(res, {
    statusCode,
    message,
    errors,
    stack: err.stack,
  });
};
