/* ------------- axios instance con control de 401 y 429 ------------- */
import axios from 'axios';
import * as authApi from './auth';

// 👉 Si tu backend devuelve “Retry-After” respétalo, si no, 1 seg por defecto
const RETRY_DEFAULT_MS   = 1000;
const MAX_RETRY_429      = 1;   // sólo un reintento por request
const MAX_RETRY_401      = 1;

const api = axios.create({
  baseURL       :  process.env.REACT_APP_API_URL,
  withCredentials: true,
});

/* ------------------------------------------------------------------ */
/* ------------------- helpers internos (privados) ------------------ */
/* ------------------------------------------------------------------ */
let isRefreshing   = false;
let refreshQueue   = [];

const runRefreshQueue = (error) => {
  refreshQueue.forEach(p => (error ? p.reject(error) : p.resolve()));
  refreshQueue = [];
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));


/* ------------------------------------------------------------------ */
/* ----------------------- interceptor global ----------------------- */
/* ------------------------------------------------------------------ */
api.interceptors.response.use(
  res => res,                    // ✅ OK → pasa directo
  async (error) => {
    const { config: req, response: res } = error;
    if (!res) return Promise.reject(error);          // timeout, offline, etc.

    /* ============ 1) MANEJO DEL 401 (refresh-token) ============ */
    if (res.status === 401 &&
        !req.url.includes('/auth/') &&              // evitamos loop
        (req._retry401 || 0) < MAX_RETRY_401) {

      req._retry401 = (req._retry401 || 0) + 1;

      // ↻ Si otro refresh está en curso, nos encolamos
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then(() => api(req));
      }

      isRefreshing = true;

      try {
        const rf = await authApi.refresh();  // ⇐ llama /auth/refresh
        if (rf.status === 200) {
          runRefreshQueue(null);
          return api(req);                   // ← re-lanza el original
        }
      } catch (e) {
        runRefreshQueue(e);
      } finally {
        isRefreshing = false;
      }
      // Si llegamos acá la sesión expiró => logout forzado
      window.location = '/login';
      return Promise.reject(error);
    }

    /* ============ 2) MANEJO DEL 429 (rate-limit) ============ */
    if (res.status === 429 && (req._retry429 || 0) < MAX_RETRY_429) {
      req._retry429 = (req._retry429 || 0) + 1;

      // ⏲️ esperamos el tiempo indicado por el servidor o 1 seg.
      const retryAfter =
        (parseInt(res.headers?.['retry-after'], 10) || 0) * 1000
        || RETRY_DEFAULT_MS;

      await sleep(retryAfter);
      return api(req);   // ← re-lanza una sola vez
    }

    /* ============ 3) Cualquier otro error ↓ se propaga ============ */
    return Promise.reject(error);
  }
);

export default api;
