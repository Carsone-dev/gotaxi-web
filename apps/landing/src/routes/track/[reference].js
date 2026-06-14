import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Package, MapPin, Phone, User, CheckCircle, Truck, Clock } from "lucide-react";
import { colisApi } from "@/lib/api";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
const TIMELINE = [
    { statut: "EN_ATTENTE", label: "En attente", desc: "Votre colis attend le chauffeur", icon: Clock },
    { statut: "CONFIRME", label: "Confirmé", desc: "Chauffeur accepté, prêt à partir", icon: CheckCircle },
    { statut: "EN_TRANSIT", label: "En transit", desc: "Votre colis est en route", icon: Truck },
    { statut: "LIVRE", label: "Livré", desc: "Colis livré avec succès", icon: CheckCircle },
];
const ORDER = {
    EN_ATTENTE: 0, CONFIRME: 1, EN_TRANSIT: 2, LIVRE: 3,
};
function TrackingForm() {
    return (_jsx("div", { className: "container-page py-16 text-center", children: _jsxs("div", { className: "mx-auto max-w-md", children: [_jsx("div", { className: "text-6xl mb-4", children: "\uD83D\uDCE6" }), _jsx("h1", { className: "text-2xl font-extrabold", children: "Suivre un colis" }), _jsx("p", { className: "mt-2 text-muted-foreground mb-8", children: "Entrez votre code de suivi pour suivre votre colis en temps r\u00E9el" }), _jsxs("form", { onSubmit: (e) => {
                        e.preventDefault();
                        const fd = new FormData(e.currentTarget);
                        window.location.href = `/track/${fd.get("reference")}`;
                    }, className: "flex gap-2", children: [_jsx("input", { name: "reference", placeholder: "GTX-XXXXXX", className: "flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-mono outline-none focus:border-primary focus:ring-2 focus:ring-primary/20", required: true }), _jsx("button", { type: "submit", className: "rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-600 transition-colors", children: "Suivre" })] })] }) }));
}
export default function TrackPage() {
    const { reference } = useParams();
    const { data: colis, isLoading, isError } = useQuery({
        queryKey: ["public-track", reference],
        queryFn: () => colisApi.publicTrack(reference),
        enabled: !!reference,
        refetchInterval: 30_000,
    });
    if (!reference)
        return _jsx(TrackingForm, {});
    if (isLoading) {
        return (_jsxs("div", { className: "container-page py-20 text-center", children: [_jsx("div", { className: "mx-auto size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" }), _jsx("p", { className: "mt-4 text-muted-foreground", children: "Chargement du suivi..." })] }));
    }
    if (isError || !colis) {
        return (_jsxs("div", { className: "container-page py-20 text-center", children: [_jsx("div", { className: "text-6xl mb-4", children: "\u274C" }), _jsx("h1", { className: "text-xl font-bold", children: "Colis introuvable" }), _jsx("p", { className: "mt-2 text-muted-foreground", children: "V\u00E9rifiez votre code de suivi et r\u00E9essayez" }), _jsx(Link, { to: "/track", className: "mt-6 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-600", children: "Nouvelle recherche" })] }));
    }
    const currentStep = ORDER[colis.statut] ?? -1;
    return (_jsxs(_Fragment, { children: [_jsx(Helmet, { children: _jsxs("title", { children: ["Suivi colis ", colis.code_suivi, " \u2014 GoTaxi"] }) }), _jsxs("div", { className: "container-page py-10", children: [_jsxs("div", { className: "mb-6", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Code de suivi" }), _jsx("h1", { className: "text-2xl font-extrabold font-mono text-primary", children: colis.code_suivi })] }), _jsxs("div", { className: "grid gap-6 md:grid-cols-[1fr_320px]", children: [_jsxs("div", { className: "space-y-4", children: [colis.statut !== "ANNULE" ? (_jsxs("div", { className: "rounded-2xl border border-border bg-white p-6", children: [_jsx("h2", { className: "mb-6 text-sm font-bold uppercase tracking-wider text-muted-foreground", children: "Progression" }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute left-4 top-4 h-[calc(100%-2rem)] w-0.5 bg-border" }), _jsx("div", { className: "space-y-6", children: TIMELINE.map((step, i) => {
                                                            const done = currentStep >= i;
                                                            const active = currentStep === i;
                                                            const Icon = step.icon;
                                                            return (_jsxs("div", { className: "relative flex items-start gap-4", children: [_jsx("div", { className: `relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ring-2 ring-white
                              ${done ? "bg-primary" : "bg-surface"}`, children: _jsx(Icon, { className: `size-4 ${done ? "text-white" : "text-muted-foreground"}` }) }), _jsxs("div", { className: active ? "font-bold" : "", children: [_jsx("p", { className: `text-sm ${done ? "text-ink" : "text-muted-foreground"}`, children: step.label }), _jsx("p", { className: "text-xs text-muted-foreground", children: step.desc })] })] }, step.statut));
                                                        }) })] })] })) : (_jsxs("div", { className: "rounded-2xl border border-error/30 bg-error-bg p-6 text-center", children: [_jsx("p", { className: "text-xl font-bold text-error-text", children: "Colis annul\u00E9" }), _jsx("p", { className: "mt-1 text-sm text-error-text/80", children: "Ce colis a \u00E9t\u00E9 annul\u00E9" })] })), _jsxs("div", { className: "rounded-2xl border border-border bg-white p-5", children: [_jsx("h2", { className: "mb-4 text-sm font-bold", children: "D\u00E9tails du colis" }), _jsxs("dl", { className: "space-y-3", children: [_jsx(Row, { icon: _jsx(Package, { className: "size-4" }), label: "Description", value: colis.description }), _jsx(Row, { icon: _jsx(MapPin, { className: "size-4" }), label: "Trajet", value: `${colis.ville_depart} → ${colis.ville_arrivee}` }), _jsx(Row, { icon: _jsx(User, { className: "size-4" }), label: "Destinataire", value: colis.destinataire_nom }), _jsx(Row, { icon: _jsx(Phone, { className: "size-4" }), label: "T\u00E9l\u00E9phone", value: colis.destinataire_telephone }), colis.poids_kg && (_jsx(Row, { icon: _jsx(Package, { className: "size-4" }), label: "Poids", value: `${colis.poids_kg} kg` }))] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "rounded-2xl border border-border bg-white p-5", children: [_jsx("p", { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground", children: "Prix estim\u00E9" }), _jsxs("p", { className: "mt-2 text-2xl font-extrabold text-primary", children: [colis.prix.toLocaleString("fr-FR"), " FCFA"] }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: colis.modalite_paiement === "A_LA_LIVRAISON" ? "Paiement à la livraison" : "Paiement à la confirmation" })] }), colis.fragile && (_jsxs("div", { className: "rounded-2xl border border-warning/40 bg-warning-bg p-4", children: [_jsx("p", { className: "text-sm font-semibold text-warning-text", children: "\u26A0 Colis fragile" }), _jsx("p", { className: "text-xs text-warning-text/70 mt-0.5", children: "Manipuler avec pr\u00E9caution" })] })), _jsxs("div", { className: "rounded-2xl border border-border bg-white p-4", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Derni\u00E8re mise \u00E0 jour" }), _jsx("p", { className: "text-sm font-medium mt-1", children: format(parseISO(colis.updated_at), "dd/MM/yyyy à HH:mm", { locale: fr }) })] }), _jsx("div", { className: "rounded-2xl bg-surface p-4 text-center text-xs text-muted-foreground", children: _jsx("p", { children: "Cette page se rafra\u00EEchit automatiquement toutes les 30 secondes" }) })] })] })] })] }));
}
function Row({ icon, label, value }) {
    return (_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("span", { className: "mt-0.5 text-muted-foreground", children: icon }), _jsx("dt", { className: "w-28 shrink-0 text-sm text-muted-foreground", children: label }), _jsx("dd", { className: "text-sm font-medium", children: value })] }));
}
