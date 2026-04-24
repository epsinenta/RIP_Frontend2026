import axios, { type AxiosInstance } from "axios";

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
    (error) => Promise.reject(error),
  );
}

export function createPublicApiAxios(): AxiosInstance {
  const instance = axios.create({ baseURL: resolveBaseURL() });
  attachAuthInterceptors(instance);
  return instance;
}

export const publicApiAxios = createPublicApiAxios();
