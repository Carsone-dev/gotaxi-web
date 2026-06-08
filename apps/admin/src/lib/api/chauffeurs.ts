import { get, patch, post, del, apiClient } from "@/lib/api";
import type { ChauffeurRead, ChauffeurStats, ChauffeurRevenus, VehiculeRead, VehiculeCreate, VoyageRead } from "@/types/domain";

export const chauffeursApi = {
  me: () => get<ChauffeurRead>("/chauffeurs/me"),
  updateMe: (data: Partial<ChauffeurRead>) => patch<ChauffeurRead>("/chauffeurs/me", data),
  uploadDocuments: (files: { cin?: File; permis?: File; casier_judiciaire?: File }) => {
    const form = new FormData();
    if (files.cin) form.append("cin", files.cin);
    if (files.permis) form.append("permis", files.permis);
    if (files.casier_judiciaire) form.append("casier_judiciaire", files.casier_judiciaire);
    return apiClient
      .post<ChauffeurRead>("/chauffeurs/me/documents", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
  goOnline: () => post<{ message: string }>("/chauffeurs/me/online"),
  goOffline: () => post<{ message: string }>("/chauffeurs/me/offline"),
  updatePosition: (lat: number, lng: number, vitesse?: number, heading?: number) =>
    post<void>("/chauffeurs/me/position", { lat, lng, vitesse, heading }),
  stats: () => get<ChauffeurStats>("/chauffeurs/me/stats"),
  revenus: () => get<ChauffeurRevenus>("/chauffeurs/me/revenus"),
  vehicules: () => get<VehiculeRead[]>("/chauffeurs/me/vehicules"),
  addVehicule: (data: VehiculeCreate) => post<VehiculeRead>("/chauffeurs/me/vehicules", data),
  updateVehicule: (id: string, data: Partial<VehiculeCreate>) =>
    patch<VehiculeRead>(`/chauffeurs/me/vehicules/${id}`, data),
  deleteVehicule: (id: string) => del<{ message: string }>(`/chauffeurs/me/vehicules/${id}`),
  publicProfile: (id: string) => get<ChauffeurRead>(`/chauffeurs/${id}`),
  voyages: (id: string) => get<VoyageRead[]>(`/chauffeurs/${id}/voyages`),
};
