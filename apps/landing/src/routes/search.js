import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Calendar, Users, Snowflake, Package, ArrowRight } from "lucide-react";
import { voyagesApi } from "@/lib/api";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
function VoyageCard({ voyage }) {
    return (_jsx("div", { className: "rounded-2xl border border-border bg-white p-5 shadow-soft hover:shadow-card transition-shadow", children: _jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 text-base font-bold", children: [_jsx("span", { children: voyage.ville_depart }), _jsx(ArrowRight, { className: "size-4 text-muted-foreground" }), _jsx("span", { children: voyage.ville_arrivee })] }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: voyage.point_depart }), _jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "size-3.5" }), format(parseISO(voyage.date_depart), "dd MMM yyyy à HH:mm", { locale: fr })] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Users, { className: "size-3.5" }), voyage.nombre_places_restantes, " place(s) disponible(s)"] })] }), _jsxs("div", { className: "mt-2 flex flex-wrap gap-1.5", children: [voyage.climatise && (_jsxs("span", { className: "flex items-center gap-1 rounded-full bg-info-bg px-2.5 py-0.5 text-xs font-semibold text-info-text", children: [_jsx(Snowflake, { className: "size-3" }), " Climatis\u00E9"] })), voyage.accepte_colis && (_jsxs("span", { className: "flex items-center gap-1 rounded-full bg-success-bg px-2.5 py-0.5 text-xs font-semibold text-success-text", children: [_jsx(Package, { className: "size-3" }), " Colis accept\u00E9s"] })), voyage.non_fumeur && (_jsx("span", { className: "rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground", children: "Non-fumeur" }))] })] }), _jsxs("div", { className: "text-right shrink-0", children: [_jsx("p", { className: "text-2xl font-extrabold text-ink", children: voyage.prix_par_place.toLocaleString("fr-FR") }), _jsx("p", { className: "text-xs text-muted-foreground", children: "FCFA / place" }), _jsx("button", { className: "mt-3 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-600 transition-colors", children: "R\u00E9server" })] })] }) }));
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
    return (_jsxs(_Fragment, { children: [_jsx(Helmet, { children: _jsx("title", { children: params.ville_depart && params.ville_arrivee
                        ? `${params.ville_depart} → ${params.ville_arrivee} — GoTaxi`
                        : "Recherche de trajets — GoTaxi" }) }), _jsxs("div", { className: "container-page py-10", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-2xl font-extrabold", children: params.ville_depart && params.ville_arrivee
                                    ? `${params.ville_depart} → ${params.ville_arrivee}`
                                    : "Recherche de trajets" }), data && (_jsxs("p", { className: "mt-1 text-muted-foreground", children: [data.total, " trajet(s) trouv\u00E9(s)"] }))] }), isLoading ? (_jsx("div", { className: "space-y-4", children: Array.from({ length: 3 }).map((_, i) => (_jsx("div", { className: "h-36 animate-pulse rounded-2xl bg-surface" }, i))) })) : voyages.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center gap-4 py-20 text-center", children: [_jsx("div", { className: "text-6xl", children: "\uD83D\uDE97" }), _jsx("p", { className: "text-xl font-bold", children: "Aucun trajet disponible" }), _jsx("p", { className: "text-muted-foreground", children: "Essayez une autre date ou d'autres villes" })] })) : (_jsx("div", { className: "space-y-4", children: voyages.map((voyage) => (_jsx(VoyageCard, { voyage: voyage }, voyage.id))) }))] })] }));
}
