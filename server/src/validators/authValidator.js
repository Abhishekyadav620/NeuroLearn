/**
 * Validation utilities and Express middlewares for Authentication
 */

export const validateRegistrationInput = (data = {}) => {
  const errors = [];
  const { fullName, username, email, password } = data;

  // Full Name validation
  if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
    errors.push('Full name is required');
  } else if (fullName.trim().length < 2) {
    errors.push('Full name must be at least 2 characters long');
  } else if (fullName.trim().length > 70) {
    errors.push('Full name cannot exceed 70 characters');
  }

  // Username validation
  if (!username || typeof username !== 'string' || !username.trim()) {
    errors.push('Username is required');
  } else {
    const cleanUsername = username.trim();
    if (cleanUsername.length < 3 || cleanUsername.length > 20) {
      errors.push('Username must be between 3 and 20 characters');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }
  }

  // Email validation
  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email address is required');
  } else {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Please enter a valid email address');
    }
  }

  // Password validation
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one numeric digit');
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateLoginInput = (data = {}) => {
  const errors = [];
  const { emailOrUsername, password } = data;

  if (!emailOrUsername || typeof emailOrUsername !== 'string' || !emailOrUsername.trim()) {
    errors.push('Please enter your email address or username');
  }

  if (!password || typeof password !== 'string' || !password.trim()) {
    errors.push('Please enter your password');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Express middleware to validate registration payload
 */
export const validateRegistrationMiddleware = (req, res, next) => {
  const { isValid, errors } = validateRegistrationInput(req.body);

  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: errors[0] || 'Validation failed',
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

/**
 * Express middleware to validate login payload
 */
export const validateLoginMiddleware = (req, res, next) => {
  const { isValid, errors } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: errors[0] || 'Validation failed',
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};
