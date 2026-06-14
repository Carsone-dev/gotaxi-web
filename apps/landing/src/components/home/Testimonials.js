import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const testimonials = [
    {
        name: "Adjoavi K.",
        role: "Commerçante, Cotonou",
        avatar: "AK",
        color: "bg-primary",
        rating: 5,
        text: "J'envoie mes marchandises à Parakou chaque semaine avec GoTaxi. C'est rapide, le chauffeur est toujours à l'heure et je suis informée en temps réel. Je ne peux plus m'en passer !",
    },
    {
        name: "Kofi M.",
        role: "Étudiant, Lomé",
        avatar: "KM",
        color: "bg-accent-yellow-dark",
        rating: 5,
        text: "J'ai découvert GoTaxi pour rentrer chez mes parents à Natitingou. L'application est simple, j'ai trouvé un trajet en 2 minutes et le paiement Mobile Money est super pratique.",
    },
    {
        name: "Fatima B.",
        role: "Infirmière, Parakou",
        avatar: "FB",
        color: "bg-info-text",
        rating: 5,
        text: "Le suivi GPS en temps réel me rassure énormément. Ma famille peut voir où j'en suis pendant le voyage. Les chauffeurs sont professionnels et courtois.",
    },
    {
        name: "Séraphin D.",
        role: "Chauffeur GoTaxi",
        avatar: "SD",
        color: "bg-success-text",
        rating: 5,
        text: "Depuis que j'ai rejoint GoTaxi, mes revenus ont augmenté de 40%. La plateforme me connecte avec des clients sérieux et les paiements sont directs dans mon wallet.",
    },
    {
        name: "Marie-Claire A.",
        role: "Mère de famille, Abomey",
        avatar: "MA",
        color: "bg-error",
        rating: 5,
        text: "J'ai envoyé des médicaments à ma mère à Natitingou via GoTaxi Colis. Arrivés le soir même, en parfait état. Le système de référence pour suivre le colis est excellent.",
    },
    {
        name: "Théodore N.",
        role: "Entrepreneur, Cotonou",
        avatar: "TN",
        color: "bg-primary-600",
        rating: 5,
        text: "GoTaxi a révolutionné mes déplacements d'affaires. Je réserve depuis mon bureau, le chauffeur arrive à l'heure et je peux travailler dans le véhicule. Très professionnel.",
    },
];
function StarRating({ count }) {
    return (_jsx("div", { className: "flex gap-0.5", children: Array.from({ length: count }).map((_, i) => (_jsx("span", { className: "text-accent-yellow text-sm", children: "\u2605" }, i))) }));
}
export function Testimonials() {
    return (_jsx("section", { className: "py-20", children: _jsxs("div", { className: "container-page", children: [_jsxs("div", { className: "mb-12 text-center", children: [_jsx("h2", { className: "text-3xl font-extrabold lg:text-4xl", children: "Ce que disent nos utilisateurs" }), _jsx("p", { className: "mt-3 text-muted-foreground", children: "Plus de 50 000 voyageurs et exp\u00E9diteurs nous font confiance" })] }), _jsx("div", { className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3", children: testimonials.map((t) => (_jsxs("div", { className: "flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 shadow-sm hover:shadow-card transition-shadow", children: [_jsx(StarRating, { count: t.rating }), _jsxs("p", { className: "flex-1 text-sm leading-relaxed text-muted-foreground", children: ["\"", t.text, "\""] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `flex size-10 shrink-0 items-center justify-center rounded-full ${t.color} text-xs font-bold text-white`, children: t.avatar }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-bold", children: t.name }), _jsx("p", { className: "text-xs text-muted-foreground", children: t.role })] })] })] }, t.name))) }), _jsx("div", { className: "mt-10 flex flex-wrap items-center justify-center gap-8", children: [
                        { value: "4.9/5", label: "Note App Store" },
                        { value: "4.8/5", label: "Note Google Play" },
                        { value: "50K+", label: "Avis vérifiés" },
                    ].map((stat) => (_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-2xl font-extrabold text-primary", children: stat.value }), _jsx("p", { className: "text-sm text-muted-foreground", children: stat.label })] }, stat.label))) })] }) }));
}
