import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { keys } from "@/lib/query-keys";
import { adminApi } from "@/lib/api/admin";

export const useAdminOverview = () =>
  useQuery({
    queryKey: keys.admin.overview(),
    queryFn: adminApi.overview,
    refetchInterval: 30_000,
  });

export const useAdminKPIs = () =>
  useQuery({
    queryKey: keys.admin.kpis(),
    queryFn: adminApi.kpis,
    refetchInterval: 30_000,
  });

export const useRevenuesTrend = (period: "7d" | "30d" | "90d" = "7d") =>
  useQuery({
    queryKey: keys.admin.revenus(period),
    queryFn: () => adminApi.revenus(period),
    staleTime: 5 * 60_000,
  });

export const useTopRoutes = () =>
  useQuery({
    queryKey: keys.admin.topRoutes(),
    queryFn: adminApi.topRoutes,
    staleTime: 5 * 60_000,
  });

export const useActivityFeed = () =>
  useQuery({
    queryKey: keys.admin.activity(),
    queryFn: adminApi.activityFeed,
    refetchInterval: 10_000,
  });

export const useMoMoStats = () =>
  useQuery({
    queryKey: keys.admin.momoStats(),
    queryFn: adminApi.momoStats,
    staleTime: 5 * 60_000,
  });

export const useAdminUsers = (params?: { page?: number; size?: number; statut?: string; role?: string; search?: string }) =>
  useQuery({
    queryKey: keys.admin.users(params),
    queryFn: () => adminApi.users(params),
  });

export const useAdminPendingColis = () =>
  useQuery({
    queryKey: keys.admin.pendingColis(),
    queryFn: adminApi.pendingColis,
    refetchInterval: 60_000,
  });

export const useAdminInTransitColis = () =>
  useQuery({
    queryKey: keys.admin.inTransitColis(),
    queryFn: adminApi.inTransitColis,
    refetchInterval: 60_000,
  });

export const useSuspendUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      adminApi.suspendUser(userId, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
};

export const useActivateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminApi.activateUser(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
};

export const useValidateColis = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (colisId: string) => adminApi.validateColis(colisId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.admin.pendingColis() });
      qc.invalidateQueries({ queryKey: keys.admin.inTransitColis() });
    },
  });
};

export const useRejectColis = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ colisId, reason }: { colisId: string; reason: string }) =>
      adminApi.rejectColis(colisId, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.admin.pendingColis() }),
  });
};

export const useValidateKyc = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (chauffeurId: string) => adminApi.validateKyc(chauffeurId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
};

export const useAuditLogs = (page = 1) =>
  useQuery({
    queryKey: keys.admin.auditLogs(page),
    queryFn: () => adminApi.auditLogs({ page }),
  });

export const useAdminReservations = (params?: { page?: number; size?: number; statut?: string; voyage_id?: string }) =>
  useQuery({
    queryKey: keys.admin.reservations(params),
    queryFn: () => adminApi.reservations(params),
  });

export const useAdminUserDetail = (userId: string) =>
  useQuery({
    queryKey: keys.admin.userDetail(userId),
    queryFn: () => adminApi.userDetail(userId),
    enabled: !!userId,
  });

export const useAdminChauffeurDetail = (userId: string) =>
  useQuery({
    queryKey: keys.admin.chauffeurDetail(userId),
    queryFn: () => adminApi.chauffeurDetail(userId),
    enabled: !!userId,
  });

export const useRejectKyc = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ chauffeurId, reason }: { chauffeurId: string; reason: string }) =>
      adminApi.rejectKyc(chauffeurId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["admin", "chauffeurs"] });
    },
  });
};

export const useMasquerAvis = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (avisId: string) => adminApi.masquerAvis(avisId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "avis"] }),
  });
};
