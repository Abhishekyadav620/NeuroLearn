/**
 * Structured application logger utility for NeuroLearn API
 */

const formatTimestamp = () => new Date().toISOString();

export const logger = {
  info: (message, meta = '') => {
    console.log(`[${formatTimestamp()}] [INFO] ${message}`, meta ? meta : '');
  },
  warn: (message, meta = '') => {
    console.warn(`[${formatTimestamp()}] [WARN] ${message}`, meta ? meta : '');
  },
  error: (message, error = '') => {
    console.error(`[${formatTimestamp()}] [ERROR] ${message}`, error ? error : '');
  },
  success: (message, meta = '') => {
    console.log(`[${formatTimestamp()}] [SUCCESS] ${message}`, meta ? meta : '');
  },
  debug: (message, meta = '') => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${formatTimestamp()}] [DEBUG] ${message}`, meta ? meta : '');
    }
  },
};
