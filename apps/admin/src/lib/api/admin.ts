import { get, post } from "@/lib/api";
import type { UserRead, ColisRead, AdminOverview, DashboardKPIs, RevenueData, TopRoute, ActivityEvent, MoMoStat, AdminChauffeurDetail, AvisRead } from "@/types/domain";

export const adminApi = {
  overview: () => get<AdminOverview>("/admin/dashboard/overview"),

  kpis: () => get<DashboardKPIs>("/admin/dashboard/kpis"),

  revenus: (period: "7d" | "30d" | "90d") =>
    get<RevenueData>(`/admin/dashboard/revenus?period=${period}`),

  topRoutes: () => get<TopRoute[]>("/admin/dashboard/top-trajets"),

  activityFeed: () => get<ActivityEvent[]>("/admin/dashboard/activity-feed"),

  momoStats: () => get<MoMoStat[]>("/admin/dashboard/momo-stats"),

  users: (params?: { page?: number; size?: number; statut?: string; role?: string; search?: string }) =>
    get<UserRead[]>("/admin/users", params),

  suspendUser: (userId: string, reason?: string) =>
    post<{ message: string }>(`/admin/users/${userId}/suspend`, reason ? { reason } : undefined),

  activateUser: (userId: string) =>
    post<{ message: string }>(`/admin/users/${userId}/activate`),

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

  chauffeurs: (params?: { kyc_valide?: boolean; en_ligne?: boolean; page?: number; size?: number }) =>
    get<UserRead[]>("/admin/chauffeurs", params),

  chauffeurDetail: (userId: string) => get<AdminChauffeurDetail>(`/admin/chauffeurs/${userId}`),

  masquerAvis: (avisId: string) => post<{ message: string }>(`/admin/avis/${avisId}/masquer`),

  adminAvis: (params?: { signale?: boolean; page?: number; size?: number }) =>
    get<AvisRead[]>("/admin/avis", params),

  auditLogs: (params?: { page?: number; size?: number }) =>
    get<{ items: AuditLog[]; total: number; page: number; size: number; pages: number }>("/admin/audit", params),

  reservations: (params?: { page?: number; size?: number; statut?: string; voyage_id?: string }) =>
    get<{ items: import("@/types/domain").ReservationRead[]; total: number; page: number; size: number; pages: number }>("/admin/reservations", params),

  allTransactions: (params?: { page?: number; size?: number; statut?: string; type?: string }) =>
    get<{ items: import("@/types/domain").TransactionRead[]; total: number; page: number; size: number; pages: number }>("/admin/transactions", params),
};

export interface AuditLog {
  id: string;
  action: string;
  admin_id: string;
  target_type: string;
  target_id: string;
  details: Record<string, unknown>;
  created_at: string;
}
