import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
const benefits = [
    "Revenus 40% supérieurs à la moyenne",
    "Paiements instantanés sur votre wallet",
    "Liberté de choisir vos horaires",
    "Accès à une flotte de clients vérifiés",
    "Support 24/7 dédié aux chauffeurs",
    "Assurance couvrant tous vos trajets",
];
export function DriverCTA() {
    return (_jsx("section", { className: "bg-gradient-to-br from-primary-700 via-primary to-primary-600 py-20 text-white", children: _jsx("div", { className: "container-page", children: _jsxs("div", { className: "grid gap-12 lg:grid-cols-2 lg:items-center", children: [_jsxs("div", { children: [_jsx("span", { className: "inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white/90", children: "\uD83D\uDE97 Chauffeurs partenaires" }), _jsxs("h2", { className: "mt-4 text-3xl font-extrabold lg:text-4xl", children: ["Vous conduisez ?", _jsx("br", {}), "Rejoignez GoTaxi et", " ", _jsx("span", { className: "text-accent-yellow", children: "multipliez vos revenus" })] }), _jsx("p", { className: "mt-4 text-white/80 leading-relaxed", children: "Plus de 1 200 chauffeurs font d\u00E9j\u00E0 confiance \u00E0 GoTaxi pour remplir leurs trajets et augmenter leurs revenus. Rejoignez la communaut\u00E9." }), _jsx("ul", { className: "mt-6 grid gap-2 sm:grid-cols-2", children: benefits.map((benefit) => (_jsxs("li", { className: "flex items-start gap-2", children: [_jsx(CheckCircle2, { className: "mt-0.5 size-4 shrink-0 text-accent-yellow" }), _jsx("span", { className: "text-sm text-white/85", children: benefit })] }, benefit))) }), _jsxs("div", { className: "mt-8 flex flex-wrap gap-3", children: [_jsx(Link, { to: "/chauffeur", className: "rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary hover:bg-white/90 transition-colors", children: "Devenir chauffeur" }), _jsx(Link, { to: "/chauffeur#requirements", className: "rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors", children: "Voir les conditions" })] })] }), _jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: [
                            {
                                icon: "💰",
                                label: "Revenu moyen / mois",
                                value: "250 000 FCFA",
                                sub: "Pour un chauffeur full-time",
                            },
                            {
                                icon: "📅",
                                label: "Trajets / semaine",
                                value: "15 – 20",
                                sub: "En moyenne par chauffeur",
                            },
                            {
                                icon: "⏱️",
                                label: "Temps d'inscription",
                                value: "< 48h",
                                sub: "Validation du dossier",
                            },
                            {
                                icon: "🌍",
                                label: "Villes couvertes",
                                value: "12+",
                                sub: "Bénin & Togo",
                            },
                        ].map((card) => (_jsxs("div", { className: "rounded-2xl bg-white/10 p-5 backdrop-blur-sm border border-white/10", children: [_jsx("span", { className: "text-3xl", children: card.icon }), _jsx("p", { className: "mt-3 text-xs text-white/60 uppercase tracking-wider", children: card.label }), _jsx("p", { className: "mt-1 text-xl font-extrabold text-accent-yellow", children: card.value }), _jsx("p", { className: "mt-0.5 text-xs text-white/60", children: card.sub })] }, card.label))) })] }) }) }));
}
