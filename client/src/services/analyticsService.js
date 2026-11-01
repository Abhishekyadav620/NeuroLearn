import apiClient from './api.js';

/**
 * Client Analytics Service
 * Retrieves student learning analytics, progress metrics, charts, insights, and privacy preferences.
 */
export const analyticsService = {
  /**
   * Get overall student analytics summary (hours, lessons completed, avg quiz score, streak)
   */
  async getOverview() {
    const response = await apiClient.get('/analytics/overview');
    return response.data;
  },

  /**
   * Get weekly learning activity data (Monday - Sunday breakdown)
   */
  async getWeeklyActivity() {
    const response = await apiClient.get('/analytics/weekly-activity');
    return response.data;
  },

  /**
   * Get course-by-course completion and progress metrics
   */
  async getCourseProgress() {
    const response = await apiClient.get('/analytics/course-progress');
    return response.data;
  },

  /**
   * Get quiz performance history, average/best scores, and attempt trends
   */
  async getQuizPerformance() {
    const response = await apiClient.get('/analytics/quiz-performance');
    return response.data;
  },

  /**
   * Get measurable learning behaviour insights (active day, pacing, revisits)
   */
  async getLearningInsights() {
    const response = await apiClient.get('/analytics/learning-insights');
    return response.data;
  },

  /**
   * Get chronological activity timeline
   * @param {number} limit
   */
  async getRecentActivity(limit = 20) {
    const response = await apiClient.get('/analytics/recent-activity', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get student's current learning analytics privacy preferences and consent status
   */
  async getPreferences() {
    const response = await apiClient.get('/analytics/preferences');
    return response.data;
  },

  /**
   * Update student's privacy preferences and consent settings
   * @param {Object} preferences - { consent, trackReading, trackVideo, trackQuiz, allowAnonymizedResearch }
   */
  async updatePreferences(preferences) {
    const response = await apiClient.put('/analytics/preferences', preferences);
    return response.data;
  },

  /**
   * Export anonymized ML dataset as CSV (Admin access)
   */
  async exportDataset() {
    const response = await apiClient.get('/analytics/dataset/export', {
      responseType: 'blob',
    });
    // Trigger browser download
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'student_learning_dataset.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return true;
  },
};

export default analyticsService;
