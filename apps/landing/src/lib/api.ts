import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

const get = <T>(url: string, params?: object) =>
  apiClient.get<T>(url, { params }).then((r) => r.data);

export const publicApi = {
  villes: () => get<{ villes: string[] }>("/public/villes"),
  stats: () => get<{ total_voyages: number; villes_desservies: number }>("/public/stats"),
  health: () => get<{ status: string }>("/public/health"),
};

export const voyagesApi = {
  popular: () => get<import("@/types/domain").VoyageRead[]>("/voyages/popular"),
  search: (params: import("@/types/domain").VoyageSearchParams) =>
    get<import("@/types/domain").PaginatedResponse<import("@/types/domain").VoyageRead>>("/public/voyages/search", params),
};

export const colisApi = {
  publicTrack: (reference: string) =>
    get<import("@/types/domain").ColisRead>(`/public/colis/${reference.toUpperCase()}`),
};
