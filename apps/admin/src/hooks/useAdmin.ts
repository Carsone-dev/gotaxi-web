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
    queryFn: () => adminApi.users({ size: 25, ...params }),
  });

export const useAdminUsersStats = () =>
  useQuery({
    queryKey: keys.admin.usersStats(),
    queryFn: adminApi.usersStats,
    staleTime: 60_000,
  });

export const useAdminChauffeurs = (params?: { kyc_valide?: boolean; en_ligne?: boolean; search?: string; page?: number; size?: number }) =>
  useQuery({
    queryKey: keys.admin.chauffeurs(params),
    queryFn: () => adminApi.chauffeurs({ size: 25, ...params }),
  });

export const useAdminChauffeurStats = () =>
  useQuery({
    queryKey: keys.admin.chauffeurStats(),
    queryFn: adminApi.chauffeurStats,
    staleTime: 60_000,
  });

export const useAdminColis = (params?: { page?: number; size?: number; statut?: string }) =>
  useQuery({
    queryKey: keys.admin.colis(params),
    queryFn: () => adminApi.allColis({ ...params, size: params?.size ?? 50 }),
  });

export const useAdminColisDetail = (id: string) =>
  useQuery({
    queryKey: keys.admin.colisDetail(id),
    queryFn: () => adminApi.colisDetail(id),
    enabled: !!id,
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["admin", "chauffeurs"] });
    },
  });
};

export const useActivateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminApi.activateUser(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["admin", "chauffeurs"] });
    },
  });
};

export const useValidateColis = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (colisId: string) => adminApi.validateColis(colisId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "colis"] });
    },
  });
};

export const useRejectColis = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ colisId, reason }: { colisId: string; reason: string }) =>
      adminApi.rejectColis(colisId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "colis"] });
    },
  });
};

export const useValidateKyc = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (chauffeurId: string) => adminApi.validateKyc(chauffeurId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["admin", "chauffeurs"] });
    },
  });
};

export const useAuditLogs = (params?: { page?: number; size?: number; action?: string; entite?: string }) =>
  useQuery({
    queryKey: keys.admin.auditLogs(params),
    queryFn: () => adminApi.auditLogs(params),
  });

export const useAuditStats = () =>
  useQuery({
    queryKey: keys.admin.auditStats(),
    queryFn: adminApi.auditStats,
    staleTime: 60_000,
  });

export const useAdminVoyages = (params?: { page?: number; size?: number; statut?: string; search?: string }) =>
  useQuery({
    queryKey: keys.admin.voyages(params),
    queryFn: () => adminApi.voyages({ size: 25, ...params }),
  });

export const useAdminVoyagesStats = () =>
  useQuery({
    queryKey: keys.admin.voyagesStats(),
    queryFn: adminApi.voyagesStats,
    staleTime: 60_000,
  });

export const useAdminVoyageDetail = (id: string) =>
  useQuery({
    queryKey: keys.admin.voyageDetail(id),
    queryFn: () => adminApi.voyage(id),
    enabled: !!id,
  });

export const useAdminReservations = (params?: { page?: number; size?: number; statut?: string; voyage_id?: string; client_id?: string; search?: string }) =>
  useQuery({
    queryKey: keys.admin.reservations(params),
    queryFn: () => adminApi.reservations(params),
  });

export const useAdminReservationsStats = () =>
  useQuery({
    queryKey: keys.admin.reservationsStats(),
    queryFn: adminApi.reservationsStats,
    staleTime: 60_000,
  });

export const useAdminReservationDetail = (id: string) =>
  useQuery({
    queryKey: keys.admin.reservationDetail(id),
    queryFn: () => adminApi.reservationDetail(id),
    enabled: !!id,
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

export const useAdminTransactions = (
  params?: { page?: number; size?: number; statut?: string; type?: string; operateur?: string; search?: string },
) =>
  useQuery({
    queryKey: keys.admin.transactions(params),
    queryFn: () => adminApi.allTransactions(params),
  });

export const useAdminTransactionsStats = (params?: { type?: string; operateur?: string }) =>
  useQuery({
    queryKey: keys.admin.transactionsStats(params),
    queryFn: () => adminApi.transactionsStats(params),
    staleTime: 60_000,
  });

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
};

export const useAdminUserReservations = (userId: string, enabled: boolean) =>
  useQuery({
    queryKey: keys.admin.userReservations(userId),
    queryFn: () => adminApi.userReservations(userId, { size: 50 }),
    enabled: enabled && !!userId,
  });

export const useAdminUserColis = (userId: string, enabled: boolean) =>
  useQuery({
    queryKey: keys.admin.userColis(userId),
    queryFn: () => adminApi.userColis(userId, { size: 50 }),
    enabled: enabled && !!userId,
  });

export const useAdminUserTransactions = (userId: string, enabled: boolean) =>
  useQuery({
    queryKey: keys.admin.userTransactions(userId),
    queryFn: () => adminApi.userTransactions(userId, { size: 50 }),
    enabled: enabled && !!userId,
  });

export const useAdminChauffeurVoyages = (userId: string, enabled: boolean) =>
  useQuery({
    queryKey: keys.admin.chauffeurVoyages(userId),
    queryFn: () => adminApi.chauffeurVoyages(userId, { size: 30 }),
    enabled: enabled && !!userId,
  });

export const useAdminChauffeurRevenus = (userId: string, enabled: boolean) =>
  useQuery({
    queryKey: keys.admin.chauffeurRevenus(userId),
    queryFn: () => adminApi.chauffeurRevenus(userId),
    enabled: enabled && !!userId,
  });

export const useUpdateChauffeur = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: { autorisation_transfrontaliere?: boolean } }) =>
      adminApi.updateChauffeur(userId, data),
    onSuccess: (_data, { userId }) => {
      qc.invalidateQueries({ queryKey: keys.admin.chauffeurDetail(userId) });
    },
  });
};

export const useToggleVehicule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ vehiculeId, actif }: { vehiculeId: string; actif: boolean }) =>
      adminApi.toggleVehicule(vehiculeId, actif),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "chauffeurs"] });
    },
  });
};

export const useDeleteVehicule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vehiculeId: string) => adminApi.deleteVehicule(vehiculeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "chauffeurs"] });
    },
  });
};

export const useAdminAvis = (params?: { signale?: boolean; visible?: boolean; note?: number; page?: number; size?: number }) =>
  useQuery({
    queryKey: keys.admin.avis(params),
    queryFn: () => adminApi.adminAvis({ size: 50, ...params }),
  });

export const useMasquerAvis = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (avisId: string) => adminApi.masquerAvis(avisId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "avis"] }),
  });
};

export const useConvertToDriver = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminApi.convertToDriver(userId),
    onSuccess: (_data, userId) => {
      qc.invalidateQueries({ queryKey: keys.admin.userDetail(userId) });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["admin", "chauffeurs"] });
    },
  });
};

export const useCancelReservation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reservationId, reason }: { reservationId: string; reason: string }) =>
      adminApi.cancelReservation(reservationId, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "reservations"] }),
  });
};

export const useCancelVoyage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ voyageId, reason }: { voyageId: string; reason: string }) =>
      adminApi.cancelVoyage(voyageId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "voyages"] });
      qc.invalidateQueries({ queryKey: ["voyages"] });
    },
  });
};

export const useRestaureAvis = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (avisId: string) => adminApi.restaurerAvis(avisId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "avis"] }),
  });
};

export const useCreateAdminVoyage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createVoyage,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "voyages"] }),
  });
};

// ── Payout Account ───────────────────────────────────────────────────────────

export const useAdminPayoutAccount = (chauffeurId: string) =>
  useQuery({
    queryKey: keys.admin.payoutAccount(chauffeurId),
    queryFn: () => adminApi.getPayoutAccount(chauffeurId),
    enabled: !!chauffeurId,
    retry: false,
  });

export const useAdminUpsertPayoutAccount = (chauffeurId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { operateur: import("@/types/domain").PayoutOperateur; telephone: string }) =>
      adminApi.upsertPayoutAccount(chauffeurId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.admin.payoutAccount(chauffeurId) });
    },
  });
};

export const useAdminDeletePayoutAccount = (chauffeurId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.deletePayoutAccount(chauffeurId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.admin.payoutAccount(chauffeurId) });
    },
  });
};

// ── Tarifs ──────────────────────────────────────────────────────────────────

export const useAdminTarifs = () =>
  useQuery({ queryKey: keys.admin.tarifs(), queryFn: adminApi.tarifs });

export const useCreateTarif = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createTarif,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.admin.tarifs() }),
  });
};

export const useUpdateTarif = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...d }: { id: string; prix_recommande?: number; prix_max?: number; actif?: boolean }) =>
      adminApi.updateTarif(id, d),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.admin.tarifs() }),
  });
};

export const useDeleteTarif = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteTarif,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.admin.tarifs() }),
  });
};

// ── Villes ──────────────────────────────────────────────────────────────────

export const useAdminVilles = () =>
  useQuery({ queryKey: ["admin", "villes"], queryFn: adminApi.villes });

export const useCreateVille = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createVille,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "villes"] }),
  });
};

export const useUpdateVille = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; nom?: string; actif?: boolean }) =>
      adminApi.updateVille(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "villes"] }),
  });
};

export const useDeleteVille = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteVille,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "villes"] }),
  });
};

// ── Gares ────────────────────────────────────────────────────────────────────

export const useAdminGares = (villeId?: string) =>
  useQuery({
    queryKey: ["admin", "gares", villeId],
    queryFn: () => adminApi.gares(villeId ? { ville_id: villeId } : undefined),
  });

export const useCreateGare = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createGare,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "gares"] }),
  });
};

export const useUpdateGare = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; nom?: string; adresse?: string; lat?: number; lng?: number; actif?: boolean }) =>
      adminApi.updateGare(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "gares"] }),
  });
};

export const useDeleteGare = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteGare,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "gares"] }),
  });
};

// ── Demandes d'inscription chauffeur ─────────────────────────────────────────

export const useAdminDemandes = (params?: { statut?: string; search?: string; page?: number; size?: number }) =>
  useQuery({
    queryKey: keys.admin.demandes(params),
    queryFn: () => adminApi.demandes(params),
    refetchInterval: 60_000,
  });

export const useAdminDemandesStats = () =>
  useQuery({
    queryKey: keys.admin.demandesStats(),
    queryFn: adminApi.demandesStats,
    refetchInterval: 60_000,
  });

export const useTraiterDemande = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.traiterDemande(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "demandes"] });
      qc.invalidateQueries({ queryKey: ["admin", "chauffeurs"] });
    },
  });
};

export const useRejeterDemande = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motif }: { id: string; motif?: string }) =>
      adminApi.rejeterDemande(id, motif),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "demandes"] });
    },
  });
};
