import axios from 'axios';

/**
 * Axios instance configured for the Bug Tracker API.
 * Base URL is just /api because Vite proxies it to http://localhost:5000
 * In production (Vercel/Railway), set VITE_API_URL env variable.
 */
// Normalize base URL for local dev or production
const rawBaseUrl = import.meta.env.VITE_API_URL || '/api';
const baseURL =
  rawBaseUrl === '/api'
    ? '/api'
    : rawBaseUrl.replace(/\/+$/, '').endsWith('/api')
    ? rawBaseUrl.replace(/\/+$/, '')
    : `${rawBaseUrl.replace(/\/+$/, '')}/api`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Automatically attach the JWT token to every request if the user is logged in.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * If a 401 is returned (token expired/invalid), clear localStorage and redirect to login.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
