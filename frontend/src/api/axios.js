// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // ← cookies httpOnly
});

// Redirección a login si el token expira
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.location = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
