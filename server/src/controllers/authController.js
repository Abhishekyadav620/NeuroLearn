import * as authService from '../services/authService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Controller: Register a new student account
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { fullName, username, email, password } = req.body;

    const result = await authService.register({
      fullName,
      username,
      email,
      password,
    });

    return successResponse(res, {
      statusCode: 201,
      message: 'Account created successfully',
      data: result,
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

    return successResponse(res, {
      statusCode: 200,
      message: 'Login successful',
      data: result,
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
 * Controller: Logout
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    const result = await authService.logout();

    return successResponse(res, {
      statusCode: 200,
      message: 'Logged out successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
