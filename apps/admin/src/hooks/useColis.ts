import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { keys } from "@/lib/query-keys";
import { colisApi } from "@/lib/api/colis";

export const useMyColis = () =>
  useQuery({ queryKey: keys.colis.me(), queryFn: colisApi.me });

export const useColisByVoyage = (voyageId: string) =>
  useQuery({
    queryKey: keys.colis.byVoyage(voyageId),
    queryFn: () => colisApi.byVoyage(voyageId),
    enabled: !!voyageId,
  });

export const useColisDetail = (id: string) =>
  useQuery({
    queryKey: keys.colis.detail(id),
    queryFn: () => colisApi.detail(id),
    enabled: !!id,
  });

export const useConfirmerColis = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => colisApi.confirmer(id),
    onSuccess: (data) => {
      qc.setQueryData(keys.colis.detail(data.id), data);
      qc.invalidateQueries({ queryKey: keys.colis.byVoyage(data.voyage_id) });
    },
  });
};

export const useAnnulerColis = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => colisApi.annuler(id),
    onSuccess: (data) => {
      qc.setQueryData(keys.colis.detail(data.id), data);
      qc.invalidateQueries({ queryKey: keys.colis.me() });
    },
  });
};
