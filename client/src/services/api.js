import axios from 'axios';

// Base API URL with environment variable fallbacks
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  '/api';

/**
 * Pre-configured Axios instance for the NeuroLearn client
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor for attaching bearer token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('neurolearn_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for centralized error normalization
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    let friendlyMessage = error.response?.data?.message;

    if (!friendlyMessage) {
      if (error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')) {
        friendlyMessage = 'The request timed out. The database or server is taking longer than expected. Please try again.';
      } else if (error.message === 'Network Error') {
        friendlyMessage = 'Unable to connect to the backend server. Please verify that the API server is running on port 5000.';
      } else {
        friendlyMessage = error.message || 'An unexpected network error occurred';
      }
    }

    const customError = {
      status: error.response?.status || 500,
      message: friendlyMessage,
      data: error.response?.data?.data || null,
      raw: error,
    };
    return Promise.reject(customError);
  }
);

export default apiClient;
