import { get, post } from "@/lib/api";
import type { ColisRead, ColisCreate } from "@/types/domain";

export const colisApi = {
  create: (data: ColisCreate) => post<ColisRead>("/colis", data),
  me: () => get<ColisRead[]>("/colis/me"),
  byVoyage: (voyageId: string) => get<ColisRead[]>(`/colis/voyage/${voyageId}`),
  detail: (id: string) => get<ColisRead>(`/colis/${id}`),
  confirmer: (id: string) => post<ColisRead>(`/colis/${id}/confirmer`),
  enTransit: (id: string) => post<ColisRead>(`/colis/${id}/en_transit`),
  livrer: (id: string) => post<ColisRead>(`/colis/${id}/livrer`),
  annuler: (id: string) => post<ColisRead>(`/colis/${id}/annuler`),
  publicTrack: (reference: string) => get<ColisRead>(`/public/colis/${reference}`),
};
