import mongoose from 'mongoose';
import { ENV } from './env.js';
import { logger } from '../utils/logger.js';

const READY_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

// Track connection health details and embedded instance
let lastError = null;
let memoryServerInstance = null;
let activeDatabaseUri = ENV.MONGODB_URI;

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
 * Connect to MongoDB with automatic local embedded fallback
 */
export const connectDB = async () => {
  try {
    const connOptions = {
      serverSelectionTimeoutMS: 2000, // Timeout fast after 2s if local daemon not found
    };

    logger.info(`Attempting MongoDB connection to ${ENV.MONGODB_URI}...`);
    activeDatabaseUri = ENV.MONGODB_URI;
    const conn = await mongoose.connect(ENV.MONGODB_URI, connOptions);
    lastError = null;
    return conn;
  } catch (error) {
    lastError = error.message;

    // In local development, if external/local MongoDB is not running, seamlessly start local embedded MongoDB
    if (ENV.IS_DEVELOPMENT && !ENV.MONGODB_URI.includes('mongodb+srv://')) {
      try {
        logger.info('Local MongoDB service not found on port 27017.');
        logger.info('Initializing automated embedded MongoDB database for local development...');

        const { MongoMemoryServer } = await import('mongodb-memory-server');
        
        // Attempt to bind on default port 27017 first
        try {
          memoryServerInstance = await MongoMemoryServer.create({
            instance: { port: 27017, dbName: 'neurolearn' },
          });
        } catch {
          // Fallback to dynamic local port if 27017 is occupied
          memoryServerInstance = await MongoMemoryServer.create({
            instance: { dbName: 'neurolearn' },
          });
        }

        activeDatabaseUri = memoryServerInstance.getUri();
        logger.success(`Embedded MongoDB active at: ${activeDatabaseUri}`);

        const conn = await mongoose.connect(activeDatabaseUri);
        lastError = null;
        return conn;
      } catch (embeddedError) {
        lastError = embeddedError.message;
        logger.warn(`Embedded MongoDB initialization notice: ${embeddedError.message}`);
      }
    }

    logger.warn(`Initial MongoDB connection failed: ${error.message}`);
    logger.warn('The API server remains operational in offline/degraded database mode.');
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
    uriMasked: activeDatabaseUri.replace(/:\/\/[^@]+@/, '://***:***@'),
  };
};

/**
 * Disconnect database gracefully
 */
export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
  logger.info('MongoDB disconnected cleanly via application shutdown');
};
