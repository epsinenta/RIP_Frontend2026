import axios, { type AxiosInstance } from "axios";

const LOCAL_API_FALLBACK_ORIGIN = "http://192.168.56.1:8080";

export function resolveBaseURL(): string {
  const apiOrigin = (import.meta.env.VITE_API_ORIGIN as string | undefined)?.replace(/\/$/, "") ?? "";
  const path = import.meta.env.VITE_API_BASE_URL ?? "/api";
  return apiOrigin ? `${apiOrigin}${path}` : path;
}

export function attachAuthInterceptors(instance: AxiosInstance): void {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  instance.interceptors.response.use(
    (response) => {
      const data = response.data;
      if (data && typeof data === "object" && "token" in data && data.token) {
        localStorage.setItem("token", String(data.token));
      }
      return response;
    },
    async (error) => {
      const original = error?.config as
        | (import("axios").InternalAxiosRequestConfig & { __fallbackRetried?: boolean })
        | undefined;
      const status = error?.response?.status as number | undefined;
      const hasNetworkLikeFailure = !error?.response || status === 502 || status === 503 || status === 504;

      if (
        original &&
        !original.__fallbackRetried &&
        hasNetworkLikeFailure &&
        typeof original.baseURL === "string" &&
        original.baseURL.includes("192.168.56.1")
      ) {
        original.__fallbackRetried = true;
        const path = import.meta.env.VITE_API_BASE_URL ?? "/api";
        original.baseURL = `${LOCAL_API_FALLBACK_ORIGIN}${path}`;
        return instance.request(original);
      }

      return Promise.reject(error);
    },
  );
}

export function createPublicApiAxios(): AxiosInstance {
  const instance = axios.create({ baseURL: resolveBaseURL() });
  attachAuthInterceptors(instance);
  return instance;
}

export const publicApiAxios = createPublicApiAxios();
