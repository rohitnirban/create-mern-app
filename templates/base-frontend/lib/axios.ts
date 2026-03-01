import axios from "axios";
import Cookies from "js-cookie";

const MUTATION_METHODS = ["post", "put", "patch", "delete"];

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Attach CSRF token header on every mutation request
api.interceptors.request.use((config) => {
  if (config.method && MUTATION_METHODS.includes(config.method)) {
    const csrfToken = Cookies.get("csrf_token");
    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }
  }
  return config;
});

// Track whether a refresh is already in-flight to avoid duplicate calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown | null) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401 and not already retried
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh the refresh endpoint itself
    if (originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => api(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await api.post("/auth/refresh");
      processQueue(null);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);

      // Don't redirect for /auth/me — let the app handle "not logged in" (e.g. set user to null).
      // Redirect only when a protected request failed (e.g. user was on dashboard, token expired).
      const isInitialAuthCheck = originalRequest.url?.includes("/auth/me");
      if (!isInitialAuthCheck && typeof window !== "undefined") {
        Cookies.remove("logged_in");
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
