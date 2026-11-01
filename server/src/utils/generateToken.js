import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

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

export default generateToken;
