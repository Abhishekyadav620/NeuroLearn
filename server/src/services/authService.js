import mongoose from 'mongoose';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

/**
 * Custom application error with HTTP status code
 */
class AuthError extends Error {
  constructor(message, statusCode = 400, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

/**
 * Service handling registration business logic
 */
export const register = async ({ fullName, username, email, password, role = 'student' }) => {
  // Fail fast if database is disconnected instead of Mongoose buffering until timeout
  if (mongoose.connection.readyState !== 1) {
    throw new AuthError(
      'Database service is currently initializing or unavailable. Please wait a moment and try again.',
      503
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim().toLowerCase();
  const trimmedName = fullName.trim();

  // Check duplicate email
  const existingEmail = await User.findOne({ email: normalizedEmail });
  if (existingEmail) {
    throw new AuthError('An account with this email address already exists', 409, [
      'Email is already registered',
    ]);
  }

  // Check duplicate username
  const existingUsername = await User.findOne({ username: normalizedUsername });
  if (existingUsername) {
    throw new AuthError('This username is already taken. Please choose another.', 409, [
      'Username is already taken',
    ]);
  }

  // Create new user (password will be hashed via pre-save hook)
  const newUser = new User({
    fullName: trimmedName,
    username: normalizedUsername,
    email: normalizedEmail,
    password, // Handled by pre('save') hook
    role: role === 'admin' ? 'admin' : 'student',
    isActive: true,
    isEmailVerified: false,
  });

  await newUser.save();

  // Generate JWT token
  const token = generateToken(newUser);

  return {
    user: newUser.toJSON(),
    token,
  };
};

/**
 * Service handling login business logic
 */
export const login = async ({ emailOrUsername, password }) => {
  // Fail fast if database is disconnected instead of Mongoose buffering until timeout
  if (mongoose.connection.readyState !== 1) {
    throw new AuthError(
      'Database service is currently initializing or unavailable. Please wait a moment and try again.',
      503
    );
  }

  const cleanIdentifier = emailOrUsername ? emailOrUsername.trim() : '';
  const normalizedIdentifier = cleanIdentifier.toLowerCase();

  if (!cleanIdentifier) {
    throw new AuthError('Please enter your email or username.', 400);
  }

  if (!password) {
    throw new AuthError('Please enter your password.', 400);
  }

  // Find user by either email or username (case-insensitive)
  const user = await User.findOne({
    $or: [
      { email: normalizedIdentifier },
      { username: normalizedIdentifier },
      { username: new RegExp(`^${cleanIdentifier}$`, 'i') },
    ],
  }).select('+password');

  if (!user) {
    throw new AuthError(
      'No account found with this email or username. Please check your spelling or register a new account.',
      401
    );
  }

  // Check active account status
  if (!user.isActive) {
    throw new AuthError(
      'Your account is currently deactivated. Please contact support.',
      403
    );
  }

  // Compare candidate password with stored bcrypt hash
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new AuthError(
      'Incorrect password. Please verify your password and try again.',
      401
    );
  }

  // Generate JWT token
  const token = generateToken(user);

  return {
    user: user.toJSON(),
    token,
  };
};

/**
 * Service handling logout acknowledgement
 */
export const logout = async () => {
  return {
    note: 'Stateless JWT logout: Client should clear the stored Bearer token from local storage or cookie. Token invalidation blacklists can be added in future milestones.',
  };
};
