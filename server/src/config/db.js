import mongoose from 'mongoose';
import { ENV } from './env.js';
import { logger } from '../utils/logger.js';

const READY_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

// Track connection health details
let lastError = null;

// Register Mongoose connection event listeners
mongoose.connection.on('connected', () => {
  lastError = null;
  logger.success(`MongoDB connected successfully to: ${mongoose.connection.host}/${mongoose.connection.name}`);
});

mongoose.connection.on('error', (err) => {
  lastError = err.message;
  logger.error('MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

/**
 * Connect to MongoDB with timeout and robust error trapping
 */
export const connectDB = async () => {
  try {
    const connOptions = {
      serverSelectionTimeoutMS: 4000, // Timeout after 4 seconds instead of 30s
    };

    logger.info(`Attempting MongoDB connection to ${ENV.MONGODB_URI}...`);
    const conn = await mongoose.connect(ENV.MONGODB_URI, connOptions);
    lastError = null;
    return conn;
  } catch (error) {
    lastError = error.message;
    logger.warn(`Initial MongoDB connection failed: ${error.message}`);
    logger.warn('The API server remains operational in offline/degraded database mode.');
    // Do not rethrow or exit process to allow server and health endpoints to stay alive
    return null;
  }
};

/**
 * Retrieve granular database status
 */
export const getDatabaseStatus = () => {
  const readyStateCode = mongoose.connection.readyState;
  const isConnected = readyStateCode === 1;

  return {
    isConnected,
    readyState: readyStateCode,
    stateName: READY_STATES[readyStateCode] || 'unknown',
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
    lastError: lastError,
    uriMasked: ENV.MONGODB_URI.replace(/:\/\/[^@]+@/, '://***:***@'),
  };
};

/**
 * Disconnect database gracefully
 */
export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected gracefully via application shutdown');
  }
};
