import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const steps = [
    {
        num: "01",
        emoji: "🔍",
        title: "Recherchez",
        desc: "Entrez votre ville de départ, d'arrivée et la date souhaitée.",
    },
    {
        num: "02",
        emoji: "✅",
        title: "Réservez",
        desc: "Choisissez votre chauffeur et payez en Mobile Money ou wallet.",
    },
    {
        num: "03",
        emoji: "📍",
        title: "Suivez",
        desc: "Suivez votre chauffeur en temps réel sur la carte.",
    },
    {
        num: "04",
        emoji: "🎉",
        title: "Voyagez",
        desc: "Profitez de votre voyage en toute sécurité et confort.",
    },
];
export function HowItWorks() {
    return (_jsx("section", { className: "bg-surface py-20", children: _jsxs("div", { className: "container-page", children: [_jsxs("div", { className: "mb-12 text-center", children: [_jsx("h2", { className: "text-3xl font-extrabold lg:text-4xl", children: "Comment \u00E7a marche ?" }), _jsx("p", { className: "mt-3 text-muted-foreground", children: "R\u00E9servez votre trajet en 4 \u00E9tapes simples" })] }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-x-0 top-8 hidden h-0.5 bg-border lg:block" }), _jsx("div", { className: "grid gap-8 lg:grid-cols-4", children: steps.map((step, i) => (_jsxs("div", { className: "relative text-center", children: [_jsx("div", { className: "relative z-10 mx-auto flex size-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-card", children: step.emoji }), _jsx("div", { className: "absolute left-1/2 top-4 -translate-x-1/2 -translate-y-1/2 z-20", children: _jsx("span", { className: "rounded-full bg-primary px-2 py-0.5 text-2xs font-bold text-white", children: step.num }) }), _jsx("h3", { className: "mt-4 text-base font-bold", children: step.title }), _jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: step.desc })] }, step.num))) })] })] }) }));
}
