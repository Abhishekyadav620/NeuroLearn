import mongoose from 'mongoose';
import app from './app.js';
import { ENV, validateEnv } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { logger } from './utils/logger.js';

// Validate environment variables on startup
const { warnings } = validateEnv();
if (warnings.length > 0) {
  warnings.forEach((warn) => logger.warn(`Config Notice: ${warn}`));
}

// Connect to MongoDB
connectDB()
  .then(async (conn) => {
    if (conn && mongoose.connection.readyState === 1) {
      try {
        const { seedInitialCourses } = await import('./utils/seedCourses.js');
        await seedInitialCourses();
      } catch (seedErr) {
        logger.warn('Seed execution notice:', seedErr.message);
      }
    }
  })
  .catch((err) => {
    logger.warn('Initial MongoDB connection attempt returned an error:', err.message);
  });

// Start Express server
const server = app.listen(ENV.PORT, () => {
  logger.success(`=======================================================`);
  logger.success(`  NeuroLearn Backend API Server Started Successfully`);
  logger.success(`  Environment : ${ENV.NODE_ENV}`);
  logger.success(`  Port        : ${ENV.PORT}`);
  logger.success(`  Health API  : http://localhost:${ENV.PORT}/api/health`);
  logger.success(`  DB Status   : http://localhost:${ENV.PORT}/api/health/db`);
  logger.success(`=======================================================`);
});

// Graceful shutdown handling
const handleGracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Shutting down HTTP server gracefully...`);

  server.close(async () => {
    logger.info('HTTP server closed.');
    try {
      await disconnectDB();
      logger.info('Database connections closed cleanly.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during database teardown:', err.message);
      process.exit(1);
    }
  });

  // Force shutdown if taking longer than 10s
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception thrown:', err.message);
  logger.error(err.stack);
});
