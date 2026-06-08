import { get, post } from "@/lib/api";
import type { AvisRead, AvisCreate, PaginatedResponse } from "@/types/domain";

export const avisApi = {
  create: (data: AvisCreate) => post<AvisRead>("/avis", data),
  byChauffeur: (id: string, page = 1, size = 20) =>
    get<PaginatedResponse<AvisRead>>(`/avis/chauffeur/${id}`, { page, size }),
  me: () => get<AvisRead[]>("/avis/me/recus"),
  signaler: (id: string) => post<{ message: string }>(`/avis/${id}/signaler`),
};
