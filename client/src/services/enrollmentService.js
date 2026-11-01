import apiClient from './api.js';

/**
 * Enrollment Service
 * Handles course enrollment, student course retrieval, and enrollment status checks.
 */
export const enrollmentService = {
  /**
   * Enroll authenticated student in a published course
   * @param {string} courseId
   */
  async enrollInCourse(courseId) {
    const response = await apiClient.post(`/enrollments/${courseId}`);
    return response.data;
  },

  /**
   * Retrieve currently authenticated student's enrolled courses ("My Courses")
   * @param {Object} params - { status, sort, page, limit }
   */
  async getMyCourses(params = {}) {
    const response = await apiClient.get('/enrollments/my-courses', { params });
    return response.data;
  },

  /**
   * Check enrollment status and progress for a specific course
   * @param {string} courseId
   */
  async getEnrollmentStatus(courseId) {
    const response = await apiClient.get(`/enrollments/${courseId}/status`);
    return response.data;
  },
};

export default enrollmentService;
