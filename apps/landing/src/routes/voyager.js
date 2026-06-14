import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Shield, MapPin, CreditCard, Clock, ChevronRight } from "lucide-react";
const advantages = [
    {
        icon: _jsx(Shield, { className: "size-6 text-primary" }),
        title: "Chauffeurs vérifiés",
        desc: "Tous nos chauffeurs passent par un processus KYC rigoureux : CIN, permis, casier judiciaire.",
    },
    {
        icon: _jsx(MapPin, { className: "size-6 text-primary" }),
        title: "Suivi GPS temps réel",
        desc: "Suivez votre chauffeur en temps réel sur la carte. Partagez votre position avec vos proches.",
    },
    {
        icon: _jsx(CreditCard, { className: "size-6 text-primary" }),
        title: "Paiement sécurisé",
        desc: "MTN Money, Moov Money, Orange Money ou wallet GoTaxi. Payez comme vous voulez.",
    },
    {
        icon: _jsx(Clock, { className: "size-6 text-primary" }),
        title: "Ponctualité garantie",
        desc: "Nos chauffeurs s'engagent sur des horaires précis. Alertes SMS en cas de retard.",
    },
];
const faq = [
    {
        q: "Comment réserver un trajet ?",
        a: "Recherchez votre trajet, choisissez un chauffeur, confirmez la réservation et payez en Mobile Money. Vous recevez un code de confirmation.",
    },
    {
        q: "Puis-je annuler ma réservation ?",
        a: "Oui, vous pouvez annuler votre réservation jusqu'à 2h avant le départ sans frais.",
    },
    {
        q: "Que faire si le chauffeur ne se présente pas ?",
        a: "Contactez notre support 24/7. Vous serez remboursé intégralement et nous vous trouverons une alternative.",
    },
    {
        q: "Peut-on voyager avec des bagages ?",
        a: "Oui, discutez directement avec votre chauffeur des bagages supplémentaires via l'application.",
    },
];
export default function VoyagerPage() {
    const navigate = useNavigate();
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [openFaq, setOpenFaq] = useState(null);
    return (_jsxs(_Fragment, { children: [_jsxs(Helmet, { children: [_jsx("title", { children: "Voyager avec GoTaxi \u2014 Transport interurbain B\u00E9nin & Togo" }), _jsx("meta", { name: "description", content: "R\u00E9servez votre trajet interurbain avec des chauffeurs v\u00E9rifi\u00E9s. Paiement Mobile Money, suivi GPS, s\u00E9curit\u00E9 garantie." })] }), _jsx("section", { className: "bg-gradient-hero py-16 text-white", children: _jsxs("div", { className: "container-page text-center", children: [_jsx("h1", { className: "text-4xl font-extrabold lg:text-5xl", children: "Voyager avec GoTaxi" }), _jsx("p", { className: "mt-4 max-w-2xl mx-auto text-white/80 text-lg", children: "Des milliers de trajets disponibles chaque jour entre les grandes villes du B\u00E9nin et du Togo." }), _jsxs("form", { onSubmit: (e) => {
                                e.preventDefault();
                                navigate(`/search?from=${from}&to=${to}`);
                            }, className: "mt-8 flex flex-col sm:flex-row gap-2 max-w-xl mx-auto bg-white rounded-2xl p-3 shadow-elevated", children: [_jsx("input", { value: from, onChange: (e) => setFrom(e.target.value), placeholder: "D\u00E9part (ex: Cotonou)", className: "flex-1 rounded-xl bg-surface px-4 py-2.5 text-sm text-ink outline-none", required: true }), _jsx("input", { value: to, onChange: (e) => setTo(e.target.value), placeholder: "Arriv\u00E9e (ex: Parakou)", className: "flex-1 rounded-xl bg-surface px-4 py-2.5 text-sm text-ink outline-none", required: true }), _jsx("button", { type: "submit", className: "rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-600 transition-colors", children: "Rechercher" })] })] }) }), _jsx("section", { className: "py-16", children: _jsxs("div", { className: "container-page", children: [_jsx("h2", { className: "text-2xl font-extrabold text-center mb-10", children: "Pourquoi choisir GoTaxi ?" }), _jsx("div", { className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-4", children: advantages.map((adv) => (_jsxs("div", { className: "rounded-2xl border border-border bg-white p-5 hover:shadow-card transition-shadow", children: [_jsx("div", { className: "mb-3", children: adv.icon }), _jsx("h3", { className: "font-bold text-sm", children: adv.title }), _jsx("p", { className: "mt-1.5 text-xs text-muted-foreground leading-relaxed", children: adv.desc })] }, adv.title))) })] }) }), _jsx("section", { className: "bg-surface py-16", children: _jsxs("div", { className: "container-page max-w-3xl", children: [_jsx("h2", { className: "text-2xl font-extrabold text-center mb-10", children: "Questions fr\u00E9quentes" }), _jsx("div", { className: "space-y-3", children: faq.map((item, i) => (_jsxs("div", { className: "rounded-2xl border border-border bg-white overflow-hidden", children: [_jsxs("button", { onClick: () => setOpenFaq(openFaq === i ? null : i), className: "flex w-full items-center justify-between px-5 py-4 text-left font-semibold text-sm hover:bg-surface transition-colors", children: [item.q, _jsx(ChevronRight, { className: `size-4 shrink-0 transition-transform text-muted-foreground ${openFaq === i ? "rotate-90" : ""}` })] }), openFaq === i && (_jsx("div", { className: "px-5 pb-4 text-sm text-muted-foreground", children: item.a }))] }, i))) })] }) })] }));
}
