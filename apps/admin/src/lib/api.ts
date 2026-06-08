import axios, { type AxiosInstance } from "axios";
import { useAuthStore } from "@/stores/authStore";

export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await useAuthStore.getState().refresh();
          pendingQueue.forEach(({ resolve }) => resolve(null));
        } catch (e) {
          pendingQueue.forEach(({ reject }) => reject(e));
          useAuthStore.getState().logout();
        } finally {
          isRefreshing = false;
          pendingQueue = [];
        }
      } else {
        await new Promise((resolve, reject) => pendingQueue.push({ resolve, reject }));
      }
      return apiClient(original);
    }
    return Promise.reject(error);
  },
);

export const get = <T>(url: string, params?: object) =>
  apiClient.get<T>(url, { params }).then((r) => r.data);

export const post = <T>(url: string, data?: object) =>
  apiClient.post<T>(url, data).then((r) => r.data);

export const patch = <T>(url: string, data?: object) =>
  apiClient.patch<T>(url, data).then((r) => r.data);

export const del = <T>(url: string) =>
  apiClient.delete<T>(url).then((r) => r.data);
