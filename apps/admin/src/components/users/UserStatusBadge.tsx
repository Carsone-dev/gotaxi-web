import { StatusBadge } from "@/components/ui/StatusBadge";
import type { UserStatut } from "@/types/domain";

const config: Record<UserStatut, { label: string; variant: "success" | "error" | "warning" | "neutral" }> = {
  ACTIF: { label: "Actif", variant: "success" },
  SUSPENDU: { label: "Suspendu", variant: "error" },
  EN_ATTENTE_KYC: { label: "KYC en attente", variant: "warning" },
  SUPPRIME: { label: "Supprimé", variant: "neutral" },
};

export function UserStatusBadge({ statut }: { statut: UserStatut }) {
  const { label, variant } = config[statut] ?? { label: statut, variant: "neutral" as const };
  return <StatusBadge label={label} variant={variant} dot />;
}
