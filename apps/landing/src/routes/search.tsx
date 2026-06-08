import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { MapPin, Calendar, Users, Snowflake, Package, ArrowRight } from "lucide-react";
import { voyagesApi } from "@/lib/api";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { VoyageRead } from "@/types/domain";

function VoyageCard({ voyage }: { voyage: VoyageRead }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-soft hover:shadow-card transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 text-base font-bold">
            <span>{voyage.ville_depart}</span>
            <ArrowRight className="size-4 text-muted-foreground" />
            <span>{voyage.ville_arrivee}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{voyage.point_depart}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              {format(parseISO(voyage.date_depart), "dd MMM yyyy à HH:mm", { locale: fr })}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
              {voyage.nombre_places_restantes} place(s) disponible(s)
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {voyage.climatise && (
              <span className="flex items-center gap-1 rounded-full bg-info-bg px-2.5 py-0.5 text-xs font-semibold text-info-text">
                <Snowflake className="size-3" /> Climatisé
              </span>
            )}
            {voyage.accepte_colis && (
              <span className="flex items-center gap-1 rounded-full bg-success-bg px-2.5 py-0.5 text-xs font-semibold text-success-text">
                <Package className="size-3" /> Colis acceptés
              </span>
            )}
            {voyage.non_fumeur && (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                Non-fumeur
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-extrabold text-ink">
            {voyage.prix_par_place.toLocaleString("fr-FR")}
          </p>
          <p className="text-xs text-muted-foreground">FCFA / place</p>
          <button className="mt-3 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-600 transition-colors">
            Réserver
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [date, setDate] = useState(searchParams.get("date") ?? new Date().toISOString().split("T")[0]);

  const params = {
    ville_depart: searchParams.get("from") ?? "",
    ville_arrivee: searchParams.get("to") ?? "",
    date_depart: date,
    nombre_places: Number(searchParams.get("places") ?? 1),
  };

  const enabled = !!(params.ville_depart && params.ville_arrivee && params.date_depart);

  const { data, isLoading } = useQuery({
    queryKey: ["voyages", "search", params],
    queryFn: () => voyagesApi.search(params),
    enabled,
  });

  const voyages = data?.items ?? [];

  return (
    <>
      <Helmet>
        <title>
          {params.ville_depart && params.ville_arrivee
            ? `${params.ville_depart} → ${params.ville_arrivee} — GoTaxi`
            : "Recherche de trajets — GoTaxi"}
        </title>
      </Helmet>

      <div className="container-page py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold">
            {params.ville_depart && params.ville_arrivee
              ? `${params.ville_depart} → ${params.ville_arrivee}`
              : "Recherche de trajets"}
          </h1>
          {data && (
            <p className="mt-1 text-muted-foreground">{data.total} trajet(s) trouvé(s)</p>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl bg-surface" />
            ))}
          </div>
        ) : voyages.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="text-6xl">🚗</div>
            <p className="text-xl font-bold">Aucun trajet disponible</p>
            <p className="text-muted-foreground">
              Essayez une autre date ou d'autres villes
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {voyages.map((voyage) => (
              <VoyageCard key={voyage.id} voyage={voyage} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
