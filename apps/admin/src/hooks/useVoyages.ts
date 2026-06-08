import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { keys } from "@/lib/query-keys";
import { voyagesApi } from "@/lib/api/voyages";
import type { VoyageSearchParams, ColisSearchParams, ReservationStatut } from "@/types/domain";

export const useVoyagesPopular = () =>
  useQuery({ queryKey: keys.voyages.popular(), queryFn: voyagesApi.popular });

export const useVoyagesSearch = (params: VoyageSearchParams, enabled = true) =>
  useQuery({
    queryKey: keys.voyages.search(params),
    queryFn: () => voyagesApi.search(params),
    enabled,
  });

export const useColisSearch = (params: ColisSearchParams, enabled = true) =>
  useQuery({
    queryKey: keys.voyages.colisSearch(params),
    queryFn: () => voyagesApi.colisSearch(params),
    enabled,
  });

export const useMyVoyages = () =>
  useQuery({ queryKey: keys.voyages.me(), queryFn: voyagesApi.me });

export const useVoyage = (id: string) =>
  useQuery({
    queryKey: keys.voyages.detail(id),
    queryFn: () => voyagesApi.detail(id),
    enabled: !!id,
  });

export const useVoyageReservations = (id: string, statut?: ReservationStatut) =>
  useQuery({
    queryKey: keys.voyages.reservations(id, statut),
    queryFn: () => voyagesApi.reservations(id, statut),
    enabled: !!id,
  });

export const useVoyagePassagers = (id: string) =>
  useQuery({
    queryKey: keys.voyages.passagers(id),
    queryFn: () => voyagesApi.passagers(id),
    enabled: !!id,
  });

export const useStartVoyage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => voyagesApi.start(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: keys.voyages.detail(id) });
      qc.invalidateQueries({ queryKey: keys.voyages.me() });
    },
  });
};

export const useEndVoyage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => voyagesApi.end(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: keys.voyages.detail(id) });
      qc.invalidateQueries({ queryKey: keys.voyages.me() });
    },
  });
};

export const useCancelVoyage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => voyagesApi.cancel(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: keys.voyages.detail(id) });
      qc.invalidateQueries({ queryKey: keys.voyages.me() });
    },
  });
};
