import axios from "axios";

// Use relative /api/v1 in client browser to leverage Next.js rewrites proxy
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    return "/api/v1";
  }
  return "http://127.0.0.1:8000/api/v1";
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true, // Automatically attach HttpOnly cookies to cross-origin / proxy requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization Token if present in localStorage as fallback
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("khan_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export function getImageUrl(
  url?: string | null,
  fallback = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop"
): string {
  if (!url || typeof url !== "string" || !url.trim()) {
    return fallback;
  }
  const cleanUrl = url.trim();
  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://") || cleanUrl.startsWith("data:")) {
    return cleanUrl;
  }
  return cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;
}

export default api;
