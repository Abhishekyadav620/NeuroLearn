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
    // Format error message for consumption
    const customError = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || 'Network error occurred',
      data: error.response?.data?.data || null,
      raw: error,
    };
    return Promise.reject(customError);
  }
);

export default apiClient;
