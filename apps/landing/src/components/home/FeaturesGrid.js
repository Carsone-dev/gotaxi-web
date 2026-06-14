import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MapPin, CreditCard, Shield, Zap } from "lucide-react";
const features = [
    {
        icon: _jsx(MapPin, { className: "size-6" }),
        color: "bg-primary-100 text-primary",
        title: "Suivi GPS temps réel",
        desc: "Suivez votre chauffeur en direct sur la carte. Partagez votre position avec vos proches pour plus de sécurité.",
    },
    {
        icon: _jsx(CreditCard, { className: "size-6" }),
        color: "bg-accent-yellow/20 text-accent-yellow-dark",
        title: "Mobile Money",
        desc: "MTN, Moov, Orange ou wallet GoTaxi. Payez comme vous voulez, en toute sécurité.",
    },
    {
        icon: _jsx(Shield, { className: "size-6" }),
        color: "bg-success-bg text-success-text",
        title: "Chauffeurs vérifiés",
        desc: "Chaque chauffeur passe par un processus KYC complet : identité, permis, casier judiciaire.",
    },
    {
        icon: _jsx(Zap, { className: "size-6" }),
        color: "bg-info-bg text-info-text",
        title: "Réservation rapide",
        desc: "Réservez votre trajet en moins de 2 minutes. Confirmation instantanée par SMS.",
    },
];
export function FeaturesGrid() {
    return (_jsx("section", { className: "py-20", children: _jsxs("div", { className: "container-page", children: [_jsxs("div", { className: "mb-12 text-center", children: [_jsx("h2", { className: "text-3xl font-extrabold lg:text-4xl", children: "Tout ce dont vous avez besoin" }), _jsx("p", { className: "mt-3 max-w-xl mx-auto text-muted-foreground", children: "GoTaxi r\u00E9invente le transport interurbain avec des fonctionnalit\u00E9s pens\u00E9es pour l'Afrique." })] }), _jsx("div", { className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-4", children: features.map((feature) => (_jsxs("div", { className: "group rounded-2xl border border-border bg-white p-6 hover:shadow-card transition-shadow", children: [_jsx("div", { className: `inline-flex size-12 items-center justify-center rounded-2xl ${feature.color} mb-4`, children: feature.icon }), _jsx("h3", { className: "text-base font-bold", children: feature.title }), _jsx("p", { className: "mt-2 text-sm text-muted-foreground leading-relaxed", children: feature.desc })] }, feature.title))) })] }) }));
}
