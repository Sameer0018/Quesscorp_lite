import axios from 'axios';

// Dev: use relative /api so Vite proxy forwards to Django (6008). Build: set VITE_API_URL to your backend URL.
const baseURL = import.meta.env.VITE_API_URL
  ? `${String(import.meta.env.VITE_API_URL).replace(/\/$/, '')}/api`
  : '/api';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err.response?.data;
    const message =
      (data && (data.error || data.detail)) ||
      err.message ||
      'Request failed';
    return Promise.reject(new Error(typeof message === 'string' ? message : JSON.stringify(message)));
  }
);

export default api;
