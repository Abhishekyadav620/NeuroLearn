import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ENV } from '../config/env.js';
import { AUTH_COOKIE_NAME } from '../utils/generateToken.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Protect middleware: Verifies HttpOnly session cookie or Bearer token,
 * verifies user existence in MongoDB, and attaches authenticated user to req.user.
 */
export const protect = async (req, res, next) => {
  let token = null;

  // 1. Primary: Extract from secure HttpOnly cookie
  if (req.cookies && req.cookies[AUTH_COOKIE_NAME]) {
    token = req.cookies[AUTH_COOKIE_NAME];
  }
  // 2. Secondary fallback: Extract from Authorization Bearer header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Reject if token is missing
  if (!token) {
    return errorResponse(res, {
      statusCode: 401,
      message: 'Authentication required. No session cookie or authorization token provided.',
    });
  }

  try {
    // Verify cryptographic signature and expiration
    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    // Retrieve fresh user document from MongoDB (excluding password)
    const user = await User.findById(decoded.userId);

    if (!user) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'The user account associated with this session no longer exists.',
      });
    }

    // Verify account status
    if (!user.isActive) {
      return errorResponse(res, {
        statusCode: 403,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Attach verified user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Your session has expired. Please sign in again.',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Invalid session token. Please sign in again.',
      });
    }

    return errorResponse(res, {
      statusCode: 500,
      message: 'Authentication verification encountered an error.',
    });
  }
};

/**
 * Authorize middleware: Enforces role-based access control (RBAC).
 * Never trusts client-supplied roles.
 * @param  {...string} roles - e.g. 'student', 'admin'
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, {
        statusCode: 403,
        message: `Forbidden: Access restricted to authorized roles (${roles.join(', ')})`,
      });
    }
    next();
  };
};

/**
 * OptionalAuth middleware: Attaches req.user if a valid token is present,
 * but allows unauthenticated visitors to proceed without error.
 */
export const optionalAuth = async (req, res, next) => {
  let token = null;

  if (req.cookies && req.cookies[AUTH_COOKIE_NAME]) {
    token = req.cookies[AUTH_COOKIE_NAME];
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (user && user.isActive) {
      req.user = user;
    }
  } catch (err) {
    // Token is invalid/expired; ignore and proceed as guest
  }

  next();
};

export default { protect, authorize, optionalAuth };
