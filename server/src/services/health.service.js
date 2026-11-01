import os from 'os';
import { getDatabaseStatus } from '../config/db.js';
import { ENV } from '../config/env.js';

const startTime = Date.now();

/**
 * Health service to aggregate system and database diagnostic metrics
 */
export const getSystemHealthData = () => {
  const dbStatus = getDatabaseStatus();
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  return {
    application: {
      name: 'NeuroLearn API',
      version: '1.0.0',
      status: 'operational',
      environment: ENV.NODE_ENV,
      uptimeSeconds,
      timestamp: new Date().toISOString(),
    },
    database: {
      connected: dbStatus.isConnected,
      status: dbStatus.stateName,
      readyState: dbStatus.readyState,
      host: dbStatus.host,
      databaseName: dbStatus.name,
      lastError: dbStatus.lastError,
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: {
        rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    },
  };
};

/**
 * Database-specific diagnostic check
 */
export const getDatabaseHealthData = () => {
  const dbStatus = getDatabaseStatus();

  return {
    connected: dbStatus.isConnected,
    status: dbStatus.stateName,
    readyState: dbStatus.readyState,
    host: dbStatus.host,
    databaseName: dbStatus.name,
    targetUri: dbStatus.uriMasked,
    lastError: dbStatus.lastError,
    timestamp: new Date().toISOString(),
  };
};
