import axios from "axios";
import toast from "react-hot-toast";

export const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // If running on production hostname (not local development)
    if (host !== "localhost" && host !== "127.0.0.1") {
      if (!process.env.NEXT_PUBLIC_API || process.env.NEXT_PUBLIC_API.includes("localhost")) {
        return "https://api.guttalks.in";
      }
    }
  }
  return (process.env.NEXT_PUBLIC_API || "https://api.guttalks.in").replace(/\/$/, "");
};

const api = axios.create({
  baseURL: `${getApiBaseUrl()}/api`,
});

export const getImageUrl = (path) => {
  if (!path) return "";
  if (typeof path !== "string") return "";
  // Absolute URLs (http, https, data, blob)
  if (/^(https?:|data:|blob:)/i.test(path)) {
    return path;
  }
  // Backend uploaded files (/uploads/... or uploads/...)
  if (path.startsWith("/uploads/") || path.startsWith("uploads/")) {
    const backendUrl = getApiBaseUrl();
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${backendUrl}${cleanPath}`;
  }
  // Frontend public static files (/logo.png, /guts_p1.png, /program-blueprint.png, etc.)
  return path.startsWith("/") ? path : `/${path}`;
};

// Attach token & dynamic baseURL in every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    config.baseURL = `${getApiBaseUrl()}/api`;
    const isAdminRoute = window.location.pathname.startsWith("/admin");
    const isAdminApiCall = config.url?.includes("/admin");

    let token = null;
    if (isAdminRoute || isAdminApiCall) {
      token = localStorage.getItem("adminToken");
    }

    if (!token) {
      token = localStorage.getItem("token");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// MAIN PART — CHECK TOKEN EXPIRY
api.interceptors.response.use(
  (response) => response,
  
  (error) => {
    // If token expired or unauthorized
    if (error.response && error.response.status === 401) {
      const message = error.response.data?.message || "";

      if (
        message.includes("expired") ||
        message.includes("invalid token") ||
        message.includes("jwt") ||
        message.includes("Token") ||
        error.response.status === 401
      ) {
        // Detect whether we're on an admin page and redirect accordingly
        const isAdminRoute =
          typeof window !== "undefined" &&
          window.location.pathname.startsWith("/admin");

        // Don't treat it as a session failure if it's an auth request failing
        const isAuthRequest =
          error.config?.url?.includes("/admin/login") ||
          error.config?.url?.includes("/admin/reset-password") ||
          error.config?.url?.includes("/auth/login") ||
          error.config?.url?.includes("/auth/requestotp") ||
          error.config?.url?.includes("/auth/verifyotp");

        const isLoginPage =
          typeof window !== "undefined" &&
          (window.location.pathname === "/login" || window.location.pathname === "/admin/login");

        if (isAdminRoute && !isAuthRequest && !isLoginPage) {
          // Clear admin session
          localStorage.removeItem("adminToken");
          localStorage.removeItem("_agi");
          window.location.href = "/admin/login";
        } else if (!isAdminRoute && !isAuthRequest && !isLoginPage && localStorage.getItem("token")) {
          // Clear user session only if a token was present and expired
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
