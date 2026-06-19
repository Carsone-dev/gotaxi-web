import type { SuggestionVille as SuggestionVilleAdmin } from "@/types/domain";
import { get, post, patch, put, del } from "@/lib/api";
import type {
  UserRead, ChauffeurRead, ColisRead, AdminOverview, DashboardKPIs, RevenueData, TopRoute,
  ActivityEvent, MoMoStat, AdminChauffeurDetail, AdminVoyageDetail, AdminReservationDetail,
  AdminColisDetail, AvisRead, AdminAvisItem, PaginatedResponse, ReservationRead, TransactionRead,
  TransactionStats, VoyagesStats, ReservationsStats, AdminChauffeurItem, ChauffeurStats, UserStats,
  VoyageRead, VoyageCreate, ChauffeurRevenus, VilleRead, GareRead, TarifTrajetRead,
  ComptePayoutRead, PayoutOperateur, BeneficesData,
  DemandeChauffeur, DemandeChauffeurStats, TraiterDemandeResponse,
} from "@/types/domain";

export const adminApi = {
  overview: () => get<AdminOverview>("/admin/dashboard/overview"),

  kpis: () => get<DashboardKPIs>("/admin/dashboard/kpis"),

  revenus: (period: "7d" | "30d" | "90d") =>
    get<RevenueData>(`/admin/dashboard/revenus?period=${period}`),

  topRoutes: () => get<TopRoute[]>("/admin/dashboard/top-trajets"),

  activityFeed: () => get<ActivityEvent[]>("/admin/dashboard/activity-feed"),

  momoStats: () => get<MoMoStat[]>("/admin/dashboard/momo-stats"),

  benefices: (period: "7d" | "30d" | "90d" = "30d") =>
    get<BeneficesData>("/admin/dashboard/benefices", { period }),

  users: (params?: { page?: number; size?: number; statut?: string; role?: string; search?: string }) =>
    get<PaginatedResponse<UserRead>>("/admin/users", params),

  usersStats: () =>
    get<UserStats>("/admin/users/stats"),

  suspendUser: (userId: string, reason?: string) =>
    post<{ message: string }>(`/admin/users/${userId}/suspend`, reason ? { reason } : undefined),

  activateUser: (userId: string) =>
    post<{ message: string }>(`/admin/users/${userId}/activate`),

  allColis: (params?: { page?: number; size?: number; statut?: string }) =>
    get<PaginatedResponse<ColisRead>>("/admin/colis", params),

  colisDetail: (id: string) => get<AdminColisDetail>(`/admin/colis/${id}`),

  pendingColis: () => get<ColisRead[]>("/admin/colis/pending"),

  inTransitColis: () => get<ColisRead[]>("/admin/colis/in-transit"),

  validateColis: (colisId: string) =>
    post<{ message: string }>(`/admin/colis/${colisId}/validate`),

  rejectColis: (colisId: string, reason: string) =>
    post<{ message: string }>(`/admin/colis/${colisId}/reject`, { reason }),

  validateKyc: (chauffeurId: string) =>
    post<{ message: string }>(`/admin/chauffeurs/${chauffeurId}/validate-kyc`),

  rejectKyc: (chauffeurId: string, reason: string) =>
    post<{ message: string }>(`/admin/chauffeurs/${chauffeurId}/reject-kyc`, { reason }),

  userDetail: (userId: string) => get<UserRead>(`/admin/users/${userId}`),

  chauffeurs: (params?: { kyc_valide?: boolean; en_ligne?: boolean; search?: string; page?: number; size?: number }) =>
    get<PaginatedResponse<AdminChauffeurItem>>("/admin/chauffeurs", params),

  chauffeurStats: () =>
    get<ChauffeurStats>("/admin/chauffeurs/stats"),

  chauffeurDetail: (userId: string) => get<AdminChauffeurDetail>(`/admin/chauffeurs/${userId}`),

  masquerAvis: (avisId: string) => post<{ message: string }>(`/admin/avis/${avisId}/masquer`),

  adminAvis: (params?: { signale?: boolean; visible?: boolean; note?: number; page?: number; size?: number }) =>
    get<PaginatedResponse<AdminAvisItem>>("/admin/avis", params),

  auditLogs: (params?: { page?: number; size?: number; action?: string; entite?: string }) =>
    get<{ items: AuditLog[]; total: number; page: number; size: number; pages: number }>("/admin/audit", params),

  auditStats: () =>
    get<AuditStats>("/admin/audit/stats"),

  voyages: (params?: { page?: number; size?: number; statut?: string; search?: string; chauffeur_id?: string }) =>
    get<PaginatedResponse<VoyageRead>>("/admin/voyages", params),

  voyagesStats: () =>
    get<VoyagesStats>("/admin/voyages/stats"),

  voyage: (id: string) =>
    get<AdminVoyageDetail>(`/admin/voyages/${id}`),

  reservations: (params?: { page?: number; size?: number; statut?: string; voyage_id?: string; client_id?: string; search?: string }) =>
    get<PaginatedResponse<ReservationRead>>("/admin/reservations", params),

  reservationsStats: () =>
    get<ReservationsStats>("/admin/reservations/stats"),

  reservationDetail: (id: string) =>
    get<AdminReservationDetail>(`/admin/reservations/${id}`),

  allTransactions: (params?: { page?: number; size?: number; statut?: string; type?: string; operateur?: string; search?: string }) =>
    get<PaginatedResponse<TransactionRead>>("/admin/transactions", params),

  transactionsStats: (params?: { type?: string; operateur?: string }) =>
    get<TransactionStats>("/admin/transactions/stats", params),

  // Soft delete → statut SUPPRIME. Backend: DELETE /admin/users/:id (à implémenter)
  deleteUser: (userId: string) =>
    del<{ message: string }>(`/admin/users/${userId}`),

  // Réservations d'un client. Backend: ajouter param client_id sur GET /admin/reservations
  userReservations: (userId: string, params?: { page?: number; size?: number; statut?: string; search?: string }) =>
    get<PaginatedResponse<ReservationRead>>("/admin/reservations", { client_id: userId, ...params }),

  // Colis envoyés par un expéditeur. Backend: ajouter param expediteur_id sur GET /admin/colis
  userColis: (userId: string, params?: { page?: number; size?: number }) =>
    get<PaginatedResponse<ColisRead>>("/admin/colis", { expediteur_id: userId, ...params }),

  // Transactions d'un utilisateur. Backend: ajouter param user_id sur GET /admin/transactions
  userTransactions: (userId: string, params?: { page?: number; size?: number; statut?: string }) =>
    get<PaginatedResponse<TransactionRead>>("/admin/transactions", { user_id: userId, ...params }),

  // Voyages d'un chauffeur. Backend: ajouter param chauffeur_id sur GET /admin/voyages
  chauffeurVoyages: (userId: string, params?: { page?: number; size?: number; statut?: string }) =>
    get<PaginatedResponse<VoyageRead>>("/admin/voyages", { chauffeur_id: userId, ...params }),

  // Revenus ventilés. Backend: créer GET /admin/chauffeurs/:id/revenus
  chauffeurRevenus: (userId: string) =>
    get<ChauffeurRevenus>(`/admin/chauffeurs/${userId}/revenus`),

  // Toggle autorisation transfrontalière. Backend: accepter ce champ sur PATCH /admin/chauffeurs/:id
  updateChauffeur: (userId: string, data: { autorisation_transfrontaliere?: boolean }) =>
    patch<{ message: string }>(`/admin/chauffeurs/${userId}`, data),

  // Gestion des véhicules. Backend: créer PATCH + DELETE /admin/vehicules/:id
  toggleVehicule: (vehiculeId: string, actif: boolean) =>
    patch<{ message: string }>(`/admin/vehicules/${vehiculeId}`, { actif }),

  deleteVehicule: (vehiculeId: string) =>
    del<{ message: string }>(`/admin/vehicules/${vehiculeId}`),

  // Conversion CLIENT → CHAUFFEUR + création profil chauffeur vide + statut EN_ATTENTE_KYC
  convertToDriver: (userId: string) =>
    post<{ message: string }>(`/admin/users/${userId}/convert-to-chauffeur`),

  // Annulation admin d'une réservation. Backend: créer POST /admin/reservations/:id/cancel
  cancelReservation: (reservationId: string, reason: string) =>
    post<{ message: string }>(`/admin/reservations/${reservationId}/cancel`, { reason }),

  // Annulation admin d'un voyage (annule toutes les réservations liées). Backend: créer POST /admin/voyages/:id/cancel
  createVoyage: (data: VoyageCreate) =>
    post<VoyageRead>("/admin/voyages", data),

  cancelVoyage: (voyageId: string, reason: string) =>
    post<{ message: string }>(`/admin/voyages/${voyageId}/cancel`, { reason }),

  // Restaurer un avis masqué. Backend: créer POST /admin/avis/:id/restaurer
  restaurerAvis: (avisId: string) =>
    post<{ message: string }>(`/admin/avis/${avisId}/restaurer`),

  // ── Documents véhicule ──
  validerDocsVehicule: (vehiculeId: string) =>
    post<{ message: string }>(`/admin/vehicules/${vehiculeId}/valider-docs`),

  rejeterDocsVehicule: (vehiculeId: string, raison?: string) =>
    post<{ message: string }>(`/admin/vehicules/${vehiculeId}/rejeter-docs`, raison ? { raison } : undefined),

  // ── Payout Account ──
  getPayoutAccount: (chauffeurId: string) =>
    get<ComptePayoutRead>(`/admin/chauffeurs/${chauffeurId}/payout-account`),

  upsertPayoutAccount: (chauffeurId: string, data: { operateur: PayoutOperateur; telephone: string }) =>
    put<ComptePayoutRead>(`/admin/chauffeurs/${chauffeurId}/payout-account`, data),

  deletePayoutAccount: (chauffeurId: string) =>
    del<{ message: string }>(`/admin/chauffeurs/${chauffeurId}/payout-account`),

  // ── Tarifs ──
  tarifs: () => get<TarifTrajetRead[]>("/admin/tarifs"),
  createTarif: (d: { ville_depart_id: string; ville_arrivee_id: string; prix_recommande: number; prix_max: number }) =>
    post<TarifTrajetRead>("/admin/tarifs", d),
  updateTarif: (id: string, d: { prix_recommande?: number; prix_max?: number; actif?: boolean }) =>
    patch<TarifTrajetRead>(`/admin/tarifs/${id}`, d),
  deleteTarif: (id: string) => del<{ message: string }>(`/admin/tarifs/${id}`),

  // ── Villes ──
  villes: () => get<VilleRead[]>("/admin/villes"),
  createVille: (data: { nom: string }) => post<VilleRead>("/admin/villes", data),
  updateVille: (id: string, data: { nom?: string; actif?: boolean }) =>
    patch<VilleRead>(`/admin/villes/${id}`, data),
  deleteVille: (id: string) => del<{ message: string }>(`/admin/villes/${id}`),

  // ── Gares ──
  gares: (params?: { ville_id?: string }) => get<GareRead[]>("/admin/gares", params),
  createGare: (data: { nom: string; ville_id: string; adresse?: string; lat?: number; lng?: number }) =>
    post<GareRead>("/admin/gares", data),
  updateGare: (id: string, data: { nom?: string; adresse?: string; lat?: number; lng?: number; actif?: boolean }) =>
    patch<GareRead>(`/admin/gares/${id}`, data),
  deleteGare: (id: string) => del<{ message: string }>(`/admin/gares/${id}`),

  // ── Demandes d'inscription chauffeur ──
  demandes: (params?: { statut?: string; search?: string; page?: number; size?: number }) =>
    get<DemandeChauffeur[]>("/admin/demandes-chauffeur", params),

  demandesStats: () =>
    get<DemandeChauffeurStats>("/admin/demandes-chauffeur/stats"),

  traiterDemande: (id: string) =>
    post<TraiterDemandeResponse>(`/admin/demandes-chauffeur/${id}/traiter`),

  rejeterDemande: (id: string, motif?: string) =>
    post<{ message: string }>(`/admin/demandes-chauffeur/${id}/rejeter`, { motif }),

  // ── Suggestions de villes ──────────────────────────────────────────────────
  suggestionVilles: (params?: { traitee?: boolean }) =>
    get<SuggestionVilleAdmin[]>("/admin/suggestions-villes", params),

  updateSuggestionVille: (id: string, payload: { traitee?: boolean; notes_admin?: string | null }) =>
    patch<SuggestionVilleAdmin>(`/admin/suggestions-villes/${id}`, payload),
};

export interface AuditLog {
  id: string;
  action: string;
  admin_id: string;
  admin_nom: string | null;
  admin_prenom: string | null;
  target_type: string;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditStats {
  total: number;
  today: number;
  unique_admins: number;
  by_action: { action: string; count: number }[];
}
