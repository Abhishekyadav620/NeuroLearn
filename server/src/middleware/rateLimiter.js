import rateLimit from 'express-rate-limit';

/**
 * Rate limiting middleware for sensitive authentication endpoints
 * Protects against brute-force password guessing and registration spam
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 30, // Limit each IP to 30 authentication requests per 15 minutes
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
    timestamp: new Date().toISOString(),
  },
  skip: (req) => {
    // Optionally skip rate limit in local automated test scenarios if header is present
    return process.env.NODE_ENV === 'test';
  },
});
