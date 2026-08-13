import axios from "axios";

const normalizeApiBaseUrl = (value) => {
  const base = (value || "http://127.0.0.1:8000").replace(/\/+$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
};

const api = axios.create({
  baseURL: normalizeApiBaseUrl(
    import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL,
  ),
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData && config.headers) {
    if (typeof config.headers.delete === "function") {
      config.headers.delete("Content-Type");
      config.headers.delete("content-type");
    }
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  }

  return config;
});

export default api;
