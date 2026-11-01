import { getSystemHealthData, getDatabaseHealthData } from '../services/health.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Controller for GET /api/health
 * Returns overarching API & service health
 */
export const getHealth = (req, res, next) => {
  try {
    const healthData = getSystemHealthData();

    return successResponse(res, {
      statusCode: 200,
      message: 'NeuroLearn API health check completed',
      data: healthData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for GET /api/health/db
 * Accurately reports MongoDB connection state without fabricated success
 */
export const getDatabaseHealth = (req, res, next) => {
  try {
    const dbData = getDatabaseHealthData();

    if (!dbData.connected) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB is currently disconnected or unavailable.',
        timestamp: new Date().toISOString(),
        data: dbData,
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'MongoDB connection is healthy and active',
      data: dbData,
    });
  } catch (error) {
    next(error);
  }
};
