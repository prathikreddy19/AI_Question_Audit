import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;
    error.userMessage = !error.response
      ? 'The server could not be reached. Check that the backend is running and try again.'
      : status === 401
      ? 'Your session is not authorized. Please sign in again.'
      : status === 404
      ? typeof detail === 'string' ? detail : 'The requested item was not found.'
      : status >= 500
      ? 'The server encountered an error. Please try again.'
      : typeof detail === 'string'
      ? detail
      : 'The request could not be completed. Check the submitted information.';
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error) {
  return error?.userMessage || error?.message || 'Something went wrong. Please try again.';
}

export default api;
