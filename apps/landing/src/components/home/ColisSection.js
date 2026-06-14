import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { Package, Truck, Shield, Clock } from "lucide-react";
const advantages = [
    {
        icon: _jsx(Package, { className: "size-5" }),
        title: "Tout type de colis",
        desc: "Documents, vêtements, électronique, alimentaire — nous transportons tout.",
    },
    {
        icon: _jsx(Truck, { className: "size-5" }),
        title: "Livraison rapide",
        desc: "Expédition le jour même sur les trajets disponibles. Arrivée sous 24-48h.",
    },
    {
        icon: _jsx(Shield, { className: "size-5" }),
        title: "Colis assurés",
        desc: "Chaque colis est assuré pendant le transport. Zéro risque pour vous.",
    },
    {
        icon: _jsx(Clock, { className: "size-5" }),
        title: "Suivi en temps réel",
        desc: "Suivez votre colis avec votre numéro de référence à tout moment.",
    },
];
export function ColisSection() {
    return (_jsx("section", { className: "bg-ink py-20 text-white", children: _jsx("div", { className: "container-page", children: _jsxs("div", { className: "grid gap-12 lg:grid-cols-2 lg:items-center", children: [_jsxs("div", { children: [_jsx("span", { className: "inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-xs font-semibold text-primary-300", children: "\uD83D\uDCE6 Envoi de colis" }), _jsxs("h2", { className: "mt-4 text-3xl font-extrabold lg:text-4xl", children: ["Envoyez vos colis partout", _jsx("br", {}), _jsx("span", { className: "text-accent-yellow", children: "en Afrique de l'Ouest" })] }), _jsx("p", { className: "mt-4 text-white/70 leading-relaxed", children: "Profitez du r\u00E9seau GoTaxi pour envoyer vos colis avec nos chauffeurs lors de leurs trajets interurbains. Rapide, s\u00E9curis\u00E9 et abordable." }), _jsx("div", { className: "mt-8 grid gap-4 sm:grid-cols-2", children: advantages.map((adv) => (_jsxs("div", { className: "flex gap-3", children: [_jsx("div", { className: "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-primary-300", children: adv.icon }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold", children: adv.title }), _jsx("p", { className: "mt-0.5 text-xs text-white/60 leading-relaxed", children: adv.desc })] })] }, adv.title))) }), _jsxs("div", { className: "mt-8 flex flex-wrap gap-3", children: [_jsx(Link, { to: "/colis", className: "rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-600 transition-colors", children: "Envoyer un colis" }), _jsx(Link, { to: "/track", className: "rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors", children: "Suivre mon colis" })] })] }), _jsxs("div", { className: "relative", children: [_jsxs("div", { className: "rounded-3xl bg-white/5 p-8 backdrop-blur-sm border border-white/10", children: [_jsx("p", { className: "mb-6 text-sm font-bold uppercase tracking-wider text-white/40", children: "Tarif estimatif" }), _jsx("div", { className: "space-y-4", children: [
                                            { route: "Cotonou → Parakou", weight: "1 kg", price: "1 500 FCFA" },
                                            { route: "Cotonou → Natitingou", weight: "5 kg", price: "6 000 FCFA" },
                                            { route: "Cotonou → Lomé", weight: "2 kg", price: "3 500 FCFA" },
                                            { route: "Parakou → Lomé", weight: "10 kg", price: "14 000 FCFA" },
                                        ].map((item) => (_jsxs("div", { className: "flex items-center justify-between rounded-xl bg-white/5 px-4 py-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold", children: item.route }), _jsx("p", { className: "text-xs text-white/50", children: item.weight })] }), _jsx("span", { className: "text-sm font-extrabold text-accent-yellow", children: item.price })] }, item.route))) }), _jsx("p", { className: "mt-4 text-center text-xs text-white/40", children: "* Tarifs indicatifs. Le prix final d\u00E9pend du poids et de la cat\u00E9gorie." })] }), _jsx("div", { className: "absolute -right-4 -top-4 size-24 rounded-full bg-primary/20 blur-2xl" }), _jsx("div", { className: "absolute -bottom-4 -left-4 size-32 rounded-full bg-accent-yellow/10 blur-2xl" })] })] }) }) }));
}
