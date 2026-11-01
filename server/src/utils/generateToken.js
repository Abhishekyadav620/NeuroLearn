import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

export const AUTH_COOKIE_NAME = 'neurolearn_token';

/**
 * Generate a cryptographically signed JWT token for an authenticated user
 * @param {Object} user - User document or object with _id, role, username
 * @returns {string} - Signed JWT token
 */
export const generateToken = (user) => {
  const payload = {
    userId: user._id.toString(),
    username: user.username,
    role: user.role,
  };

  const options = {
    expiresIn: ENV.JWT_EXPIRES_IN || '7d',
    issuer: 'NeuroLearn-Auth',
  };

  return jwt.sign(payload, ENV.JWT_SECRET, options);
};

/**
 * Cookie configuration options for secure HttpOnly session storage
 */
export const getAuthCookieOptions = () => {
  const isProduction = ENV.IS_PRODUCTION;

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
  };
};

/**
 * Attach the secure HttpOnly cookie to the Express response
 */
export const sendAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
};

/**
 * Clear the authentication cookie upon logout
 */
export const clearAuthCookie = (res) => {
  const options = getAuthCookieOptions();
  delete options.maxAge;
  res.clearCookie(AUTH_COOKIE_NAME, {
    ...options,
    expires: new Date(0),
  });
};

export default generateToken;
