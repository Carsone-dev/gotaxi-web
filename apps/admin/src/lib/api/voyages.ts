import { get, post, patch } from "@/lib/api";
import type {
  VoyageRead,
  VoyageCreate,
  VoyageUpdate,
  VoyageSearchParams,
  ColisSearchParams,
  PaginatedResponse,
  ReservationRead,
  ReservationStatut,
} from "@/types/domain";

export const voyagesApi = {
  create: (data: VoyageCreate) => post<VoyageRead>("/voyages", data),
  search: (params: VoyageSearchParams) =>
    get<PaginatedResponse<VoyageRead>>("/voyages/search", params),
  colisSearch: (params: ColisSearchParams) =>
    get<PaginatedResponse<VoyageRead>>("/voyages/colis-search", params),
  popular: () => get<VoyageRead[]>("/voyages/popular"),
  me: () => get<VoyageRead[]>("/voyages/me"),
  detail: (id: string) => get<VoyageRead>(`/voyages/${id}`),
  update: (id: string, data: VoyageUpdate) => patch<VoyageRead>(`/voyages/${id}`, data),
  start: (id: string) => post<{ message: string }>(`/voyages/${id}/start`),
  end: (id: string) => post<{ message: string }>(`/voyages/${id}/end`),
  cancel: (id: string) => post<{ message: string }>(`/voyages/${id}/cancel`),
  passagers: (id: string) => get<ReservationRead[]>(`/voyages/${id}/passagers`),
  reservations: (id: string, statut?: ReservationStatut) =>
    get<ReservationRead[]>(`/voyages/${id}/reservations`, statut ? { statut } : undefined),
};
