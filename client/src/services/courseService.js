import apiClient from './api.js';

/**
 * Course Service
 * Handles all client communications with the course backend endpoints.
 */
export const courseService = {
  /**
   * Fetch courses with filtering, search, sorting, and pagination
   * @param {Object} params - { search, category, level, price, sort, page, limit, includeUnpublished }
   */
  async getCourses(params = {}) {
    const response = await apiClient.get('/courses', { params });
    return response.data;
  },

  /**
   * Fetch distinct categories with course counts
   */
  async getCategories() {
    const response = await apiClient.get('/courses/categories');
    return response.data;
  },

  /**
   * Fetch single course by slug or ID
   * @param {string} slugOrId
   */
  async getCourseBySlug(slugOrId) {
    const response = await apiClient.get(`/courses/${slugOrId}`);
    return response.data;
  },

  /**
   * Fetch course by MongoDB ID (for admin editing)
   * @param {string} courseId
   */
  async getCourseById(courseId) {
    const response = await apiClient.get(`/courses/id/${courseId}`);
    return response.data;
  },

  /**
   * Create a new course (Admin only)
   * @param {Object} courseData
   */
  async createCourse(courseData) {
    const response = await apiClient.post('/courses', courseData);
    return response.data;
  },

  /**
   * Update an existing course (Admin only)
   * @param {string} courseId
   * @param {Object} updateData
   */
  async updateCourse(courseId, updateData) {
    const response = await apiClient.put(`/courses/${courseId}`, updateData);
    return response.data;
  },

  /**
   * Delete a course (Admin only)
   * @param {string} courseId
   */
  async deleteCourse(courseId) {
    const response = await apiClient.delete(`/courses/${courseId}`);
    return response.data;
  },

  /**
   * Toggle course publish status (Admin only)
   * @param {string} courseId
   */
  async togglePublish(courseId) {
    const response = await apiClient.patch(`/courses/${courseId}/publish`);
    return response.data;
  },

  /**
   * Validate YouTube video URL and extract video metadata
   * @param {string} url
   */
  async validateYouTube(url) {
    const response = await apiClient.post('/courses/validate-youtube', { url });
    return response.data;
  },

  /**
   * Retrieve single lesson details for learning player
   * @param {string} slugOrId
   * @param {string} lessonId
   */
  async getLesson(slugOrId, lessonId) {
    const response = await apiClient.get(`/courses/${slugOrId}/lessons/${lessonId}`);
    return response.data;
  },

  /**
   * Create module inside course (Admin only)
   */
  async createModule(courseId, moduleData) {
    const response = await apiClient.post(`/courses/${courseId}/modules`, moduleData);
    return response.data;
  },

  /**
   * Update module (Admin only)
   */
  async updateModule(courseId, moduleId, moduleData) {
    const response = await apiClient.put(`/courses/${courseId}/modules/${moduleId}`, moduleData);
    return response.data;
  },

  /**
   * Delete module (Admin only)
   */
  async deleteModule(courseId, moduleId) {
    const response = await apiClient.delete(`/courses/${courseId}/modules/${moduleId}`);
    return response.data;
  },

  /**
   * Reorder modules (Admin only)
   */
  async reorderModules(courseId, moduleIds) {
    const response = await apiClient.patch(`/courses/${courseId}/modules/reorder`, { moduleIds });
    return response.data;
  },

  /**
   * Create lesson inside module (Admin only)
   */
  async createLesson(courseId, moduleId, lessonData) {
    const response = await apiClient.post(`/courses/${courseId}/modules/${moduleId}/lessons`, lessonData);
    return response.data;
  },

  /**
   * Update lesson (Admin only)
   */
  async updateLesson(courseId, moduleId, lessonId, lessonData) {
    const response = await apiClient.put(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, lessonData);
    return response.data;
  },

  /**
   * Delete lesson (Admin only)
   */
  async deleteLesson(courseId, moduleId, lessonId) {
    const response = await apiClient.delete(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
    return response.data;
  },

  /**
   * Reorder lessons inside module (Admin only)
   */
  async reorderLessons(courseId, moduleId, lessonIds) {
    const response = await apiClient.patch(`/courses/${courseId}/modules/${moduleId}/lessons/reorder`, { lessonIds });
    return response.data;
  },
};

export default courseService;
