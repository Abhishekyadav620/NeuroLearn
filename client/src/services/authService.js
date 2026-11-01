import apiClient from './api.js';

/**
 * Authentication Service for NeuroLearn Frontend
 * Utilizing secure HttpOnly Cookie-based sessions
 */
export const authService = {
  /**
   * Register a new student account
   * @param {Object} userData - { fullName, username, email, password }
   */
  async registerUser(userData) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Login with email or username and password
   * @param {Object} credentials - { emailOrUsername, password }
   */
  async loginUser(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Retrieve currently authenticated user session from backend
   * Validates HttpOnly cookie
   */
  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  /**
   * Logout the current user and invalidate HttpOnly cookie on backend
   */
  async logoutUser() {
    try {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    } finally {
      // Clear legacy storage items if any remain
      localStorage.removeItem('neurolearn_user');
      localStorage.removeItem('neurolearn_token');
    }
  },
};

export default authService;
