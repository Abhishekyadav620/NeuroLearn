import * as authService from '../services/authService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { sendAuthCookie, clearAuthCookie } from '../utils/generateToken.js';

/**
 * Controller: Register a new student account
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { fullName, username, email, password, role } = req.body;

    const result = await authService.register({
      fullName,
      username,
      email,
      password,
      role,
    });

    // Set secure HttpOnly session cookie
    if (result.token) {
      sendAuthCookie(res, result.token);
    }

    return successResponse(res, {
      statusCode: 201,
      message: 'Account created successfully',
      data: {
        user: result.user,
        token: result.token, // For documentation / API testing tools
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, {
        statusCode: error.statusCode,
        message: error.message,
        errors: error.errors || [error.message],
      });
    }
    next(error);
  }
};

/**
 * Controller: Authenticate existing student
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;

    const result = await authService.login({
      emailOrUsername,
      password,
    });

    // Set secure HttpOnly session cookie
    if (result.token) {
      sendAuthCookie(res, result.token);
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Login successful',
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, {
        statusCode: error.statusCode,
        message: error.message,
        errors: error.errors || [error.message],
      });
    }
    next(error);
  }
};

/**
 * Controller: Retrieve currently authenticated user profile
 * GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    return successResponse(res, {
      statusCode: 200,
      message: 'Current authenticated student profile',
      data: {
        user: req.user.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Logout and clear session cookie
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    const result = await authService.logout();

    // Clear HttpOnly authentication cookie
    clearAuthCookie(res);

    return successResponse(res, {
      statusCode: 200,
      message: 'Logged out successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
