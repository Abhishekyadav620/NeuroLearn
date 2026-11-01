import apiClient from './api.js';

/**
 * Service to interact with backend Health endpoints
 */
export const healthService = {
  /**
   * GET /api/health
   */
  async getSystemHealth() {
    const response = await apiClient.get('/health');
    return response.data;
  },

  /**
   * GET /api/health/db
   */
  async getDatabaseHealth() {
    try {
      const response = await apiClient.get('/health/db');
      return response.data;
    } catch (error) {
      // Return normalized payload even on 503 so UI can display status cleanly
      if (error.status === 503 && error.data) {
        return {
          success: false,
          message: error.message,
          data: error.data,
        };
      }
      throw error;
    }
  },
};

export default healthService;
