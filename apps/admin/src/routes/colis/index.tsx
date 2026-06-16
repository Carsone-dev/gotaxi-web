import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, Clock, CheckCircle, Truck, Gift, XCircle, ChevronLeft, ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable } from "@/components/ui/DataTable";
import { useAdminColis, useAdminPendingColis, useAdminInTransitColis } from "@/hooks/useAdmin";
import { formatDateTime, formatCurrency, getMediaUrl } from "@/lib/format";
import type { ColisRead, ColisStatut } from "@/types/domain";
import { type ColumnDef } from "@tanstack/react-table";

type StatutFilter = ColisStatut | "";

const STATUT_CONFIG: Record<ColisStatut, {
  label: string;
  variant: "success" | "error" | "warning" | "info" | "neutral";
  icon: React.ReactNode;
  cardBg: string;
  cardText: string;
  cardBorder: string;
}> = {
  EN_ATTENTE_PAIEMENT: { label: "Paiement en attente", variant: "warning", icon: <Clock className="size-4" />, cardBg: "bg-warning-bg", cardText: "text-warning-text", cardBorder: "border-warning/30" },
  EN_ATTENTE: { label: "En attente", variant: "warning",  icon: <Clock className="size-4" />,        cardBg: "bg-warning-bg",    cardText: "text-warning-text",   cardBorder: "border-warning/30"  },
  CONFIRME:   { label: "Confirmé",   variant: "info",     icon: <CheckCircle className="size-4" />,  cardBg: "bg-info-bg",       cardText: "text-info-text",      cardBorder: "border-info/30"     },
  EN_TRANSIT: { label: "En transit", variant: "info",     icon: <Truck className="size-4" />,        cardBg: "bg-blue-50",       cardText: "text-blue-700",       cardBorder: "border-blue-200"    },
  LIVRE:      { label: "Livré",      variant: "success",  icon: <Gift className="size-4" />,         cardBg: "bg-success-bg",    cardText: "text-success-text",   cardBorder: "border-success/30"  },
  ANNULE:     { label: "Annulé",     variant: "neutral",  icon: <XCircle className="size-4" />,      cardBg: "bg-surface",       cardText: "text-muted-foreground", cardBorder: "border-border"    },
};

const CATEGORIE_LABELS: Record<string, string> = {
  DOCUMENTS:    "Documents",
  VETEMENTS:    "Vêtements",
  ELECTRONIQUE: "Électronique",
  ALIMENTAIRE:  "Alimentaire",
  FRAGILE:      "Fragile",
  AUTRE:        "Autre",
};

export default function ColisPage() {
  const navigate = useNavigate();
  const [page, setPage]     = useState(1);
  const [statut, setStatut] = useState<StatutFilter>("");

  const { data, isLoading } = useAdminColis({
    page,
    size: 50,
    ...(statut ? { statut } : {}),
  });

  const { data: pending }   = useAdminPendingColis();
  const { data: inTransit } = useAdminInTransitColis();

  const colis = data?.items ?? [];

  const statCounts: Partial<Record<ColisStatut, number>> = {
    EN_ATTENTE: pending?.length ?? 0,
    EN_TRANSIT: inTransit?.length ?? 0,
  };

  const columns: ColumnDef<ColisRead, unknown>[] = [
    {
      id: "ref",
      header: "Référence",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-2.5">
            {c.photo_url ? (
              <img src={getMediaUrl(c.photo_url) ?? ""} alt="" className="size-8 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface">
                <Package className="size-4 text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="font-mono text-xs font-bold text-primary">{c.code_suivi}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[140px]">{c.description}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: "trajet",
      header: "Trajet",
      cell: ({ row }) => {
        const c = row.original;
        return <span className="text-sm">{c.ville_depart} → {c.ville_arrivee}</span>;
      },
    },
    {
      id: "destinataire",
      header: "Destinataire",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div>
            <p className="text-sm font-medium">{c.destinataire_nom}</p>
            <p className="text-xs text-muted-foreground">{c.destinataire_telephone}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "categorie",
      header: "Catégorie",
      cell: ({ getValue }) => {
        const cat = getValue() as string;
        return (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            {CATEGORIE_LABELS[cat] ?? cat}
            {cat === "FRAGILE" && <span className="text-warning-text">⚠</span>}
          </span>
        );
      },
    },
    {
      accessorKey: "prix",
      header: "Prix",
      cell: ({ getValue }) => (
        <span className="text-sm font-semibold">{formatCurrency(getValue() as number | null ?? 0)}</span>
      ),
    },
    {
      accessorKey: "statut",
      header: "Statut",
      cell: ({ getValue }) => {
        const s = getValue() as ColisStatut;
        const conf = STATUT_CONFIG[s] ?? { label: s, variant: "neutral" as const };
        return <StatusBadge label={conf.label} variant={conf.variant} dot />;
      },
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">{formatDateTime(getValue() as string)}</span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Colis"
        subtitle={`${data?.total ?? 0} colis au total`}
      />

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {(Object.entries(STATUT_CONFIG) as [ColisStatut, typeof STATUT_CONFIG[ColisStatut]][]).map(([key, conf]) => (
          <button
            key={key}
            type="button"
            onClick={() => { setStatut(statut === key ? "" : key); setPage(1); }}
            className={[
              "rounded-2xl border p-4 text-left transition-all hover:opacity-90",
              conf.cardBg, conf.cardBorder,
              statut === key ? "ring-2 ring-primary" : "",
            ].join(" ")}
          >
            <div className={`mb-1 ${conf.cardText}`}>{conf.icon}</div>
            <p className={`text-xl font-extrabold ${conf.cardText}`}>
              {statCounts[key] !== undefined ? statCounts[key] : "—"}
            </p>
            <p className={`text-xs font-medium ${conf.cardText} opacity-80`}>{conf.label}</p>
          </button>
        ))}
      </div>

      {/* ── Filtres pills ────────────────────────────────────────────────────── */}
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => { setStatut(""); setPage(1); }}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition-colors ${
            statut === "" ? "bg-ink text-white border-ink" : "border-border text-muted-foreground hover:bg-surface"
          }`}
        >
          Tous
        </button>
        {(Object.entries(STATUT_CONFIG) as [ColisStatut, typeof STATUT_CONFIG[ColisStatut]][]).map(([key, conf]) => (
          <button
            key={key}
            type="button"
            onClick={() => { setStatut(statut === key ? "" : key); setPage(1); }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-colors ${
              statut === key ? "bg-ink text-white border-ink" : "border-border text-muted-foreground hover:bg-surface"
            }`}
          >
            {conf.icon}
            {conf.label}
          </button>
        ))}
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="mt-4">
        <DataTable
          data={colis}
          columns={columns}
          searchPlaceholder="Rechercher par référence, description, destinataire…"
          onRowClick={(c) => navigate(`/colis/${c.id}`)}
          loading={isLoading}
          emptyMessage="Aucun colis"
        />
      </div>

      {/* ── Pagination ──────────────────────────────────────────────────────── */}
      {data && data.pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-surface disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="size-4" /> Précédent
          </button>
          <span className="px-4 text-sm text-muted-foreground">
            Page <strong>{data.page}</strong> / {data.pages}
          </span>
          <button
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-surface disabled:opacity-40 transition-colors"
          >
            Suivant <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </>
  );
}
