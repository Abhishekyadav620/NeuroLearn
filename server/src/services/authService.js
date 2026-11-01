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
export const register = async ({ fullName, username, email, password }) => {
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
    role: 'student',
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
  const normalizedIdentifier = emailOrUsername.trim().toLowerCase();

  // Find user by either email or username (explicitly select password hash)
  const user = await User.findOne({
    $or: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }],
  }).select('+password');

  // Generic credential error to prevent user enumeration
  if (!user) {
    throw new AuthError('Invalid email/username or password', 401);
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
    throw new AuthError('Invalid email/username or password', 401);
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
