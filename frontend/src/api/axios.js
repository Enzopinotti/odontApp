import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const { config, response } = err;

    // 🌐 Error de red o sin respuesta del servidor
    if (!response) return Promise.reject(err);

    // 🔐 Si es 401 y viene de /auth/me => lo maneja AuthProvider
    if (response.status === 401 && config?.url?.startsWith('/auth/me')) {
      return Promise.reject(err);
    }

    // ⚠️ Redirigir solo si es 401 y no estamos en login/register
    if (
      response.status === 401 &&
      !['/login', '/register'].includes(window.location.pathname)
    ) {
      window.location = '/login';
    }
    console.log('🔥 Axios interceptor error:', err?.response?.data);
    // ✅ Devolver error para que lo maneje handleApiError (incluye 403 y otros)
    return Promise.reject(err);
  }
);

export default api;
