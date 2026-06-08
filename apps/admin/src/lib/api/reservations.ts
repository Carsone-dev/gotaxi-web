import { get, post } from "@/lib/api";
import type { ReservationRead, ReservationCreate } from "@/types/domain";

export const reservationsApi = {
  create: (data: ReservationCreate) => post<ReservationRead>("/reservations", data),
  me: () => get<ReservationRead[]>("/reservations/me"),
  incoming: () => get<ReservationRead[]>("/reservations/me/incoming"),
  detail: (id: string) => get<ReservationRead>(`/reservations/${id}`),
  accept: (id: string) => post<ReservationRead>(`/reservations/${id}/accept`),
  reject: (id: string) => post<ReservationRead>(`/reservations/${id}/reject`),
  cancel: (id: string) => post<ReservationRead>(`/reservations/${id}/cancel`),
};
