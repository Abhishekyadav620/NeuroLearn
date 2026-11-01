/**
 * Consistent API Response Helper for NeuroLearn
 */

/**
 * Send a standardized success JSON response
 */
export const successResponse = (res, {
  statusCode = 200,
  message = 'Request processed successfully',
  data = null,
  meta = null,
} = {}) => {
  const payload = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
  };

  if (data !== null) {
    payload.data = data;
  }

  if (meta !== null) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

/**
 * Send a standardized error JSON response
 */
export const errorResponse = (res, {
  statusCode = 500,
  message = 'An unexpected error occurred',
  errors = null,
  stack = null,
} = {}) => {
  const payload = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors !== null) {
    payload.errors = errors;
  }

  if (stack && process.env.NODE_ENV === 'development') {
    payload.stack = stack;
  }

  return res.status(statusCode).json(payload);
};
