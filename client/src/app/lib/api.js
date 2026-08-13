import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  // NEXT_PUBLIC_API = http://localhost:5000 (local) or https://api.guttalks.in (prod)
  baseURL: process.env.NEXT_PUBLIC_API
    ? `${process.env.NEXT_PUBLIC_API.replace(/\/$/, "")}/api`
    : "https://api.guttalks.in/api",
});

// Attach token in every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
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

        // Don't treat it as a session failure if it's the auth request itself (login/reset) failing
        const isAuthRequest =
          error.config?.url?.includes("/admin/login") ||
          error.config?.url?.includes("/admin/reset-password");

        if (isAdminRoute && !isAuthRequest) {
          // Clear admin session
          localStorage.removeItem("adminToken");
          localStorage.removeItem("_agi");
          window.location.href = "/admin/login";
        } else if (!isAdminRoute) {
          // Clear user session
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
