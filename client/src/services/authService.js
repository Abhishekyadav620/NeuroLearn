import apiClient from './api.js';

/**
 * Authentication Service for NeuroLearn Frontend
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
   * Logout the current user
   */
  async logoutUser() {
    try {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    } finally {
      // Clear token and user from localStorage on client side
      localStorage.removeItem('neurolearn_token');
      localStorage.removeItem('neurolearn_user');
    }
  },

  /**
   * Helper to retrieve currently stored user from localStorage
   */
  getCurrentUser() {
    try {
      const raw = localStorage.getItem('neurolearn_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Helper to check if a token is stored
   */
  isAuthenticated() {
    return !!localStorage.getItem('neurolearn_token');
  },
};

export default authService;
