import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
const links = {
    Produit: [
        { to: "/voyager", label: "Voyager" },
        { to: "/colis", label: "Envoyer un colis" },
        { to: "/chauffeur", label: "Devenir chauffeur" },
        { to: "/search", label: "Rechercher un trajet" },
    ],
    Support: [
        { to: "/track", label: "Suivre un colis" },
        { to: "/help", label: "Centre d'aide" },
        { to: "/contact", label: "Contact" },
    ],
    Légal: [
        { to: "/legal/cgu", label: "CGU" },
        { to: "/legal/privacy", label: "Confidentialité" },
        { to: "/legal/cookies", label: "Cookies" },
    ],
};
export function Footer() {
    return (_jsx("footer", { className: "border-t border-border bg-ink text-white", children: _jsxs("div", { className: "container-page py-12", children: [_jsxs("div", { className: "grid gap-8 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]", children: [_jsxs("div", { children: [_jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [_jsx("div", { className: "flex size-8 items-center justify-center rounded-xl bg-primary font-extrabold text-white text-sm", children: "GT" }), _jsx("span", { className: "text-lg font-extrabold", children: "GoTaxi" })] }), _jsx("p", { className: "mt-3 max-w-xs text-sm text-white/60 leading-relaxed", children: "La plateforme de transport interurbain et de livraison de colis de confiance en Afrique de l'Ouest." }), _jsxs("div", { className: "mt-4 flex gap-2", children: [_jsx("span", { className: "rounded-full border border-white/20 px-3 py-1 text-xs text-white/60", children: "\uD83C\uDDE7\uD83C\uDDEF B\u00E9nin" }), _jsx("span", { className: "rounded-full border border-white/20 px-3 py-1 text-xs text-white/60", children: "\uD83C\uDDF9\uD83C\uDDEC Togo" })] })] }), Object.entries(links).map(([section, items]) => (_jsxs("div", { children: [_jsx("p", { className: "mb-3 text-xs font-bold uppercase tracking-wider text-white/40", children: section }), _jsx("ul", { className: "space-y-2", children: items.map((item) => (_jsx("li", { children: _jsx(Link, { to: item.to, className: "text-sm text-white/60 hover:text-white transition-colors", children: item.label }) }, item.to))) })] }, section)))] }), _jsxs("div", { className: "mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row", children: [_jsxs("p", { className: "text-xs text-white/40", children: ["\u00A9 ", new Date().getFullYear(), " GoTaxi. Tous droits r\u00E9serv\u00E9s."] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("a", { href: "#", className: "flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20 transition-colors", children: [_jsx("span", {}), " App Store"] }), _jsxs("a", { href: "#", className: "flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20 transition-colors", children: [_jsx("span", { children: "\u25B6" }), " Google Play"] })] })] })] }) }));
}
