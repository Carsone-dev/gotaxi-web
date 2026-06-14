import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Helmet } from "react-helmet-async";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesGrid } from "@/components/home/FeaturesGrid";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ColisSection } from "@/components/home/ColisSection";
import { Testimonials } from "@/components/home/Testimonials";
import { DriverCTA } from "@/components/home/DriverCTA";
import { DownloadApp } from "@/components/home/DownloadApp";
export default function HomePage() {
    return (_jsxs(_Fragment, { children: [_jsxs(Helmet, { children: [_jsx("title", { children: "GoTaxi \u2014 Votre course. Votre colis. En un clic." }), _jsx("meta", { name: "description", content: "Plateforme de transport interurbain et livraison de colis au B\u00E9nin et au Togo. Chauffeurs v\u00E9rifi\u00E9s, paiement Mobile Money, suivi GPS temps r\u00E9el." }), _jsx("meta", { property: "og:title", content: "GoTaxi \u2014 Transport interurbain B\u00E9nin & Togo" }), _jsx("meta", { property: "og:type", content: "website" })] }), _jsx(HeroSection, {}), _jsx(FeaturesGrid, {}), _jsx(HowItWorks, {}), _jsx(ColisSection, {}), _jsx(Testimonials, {}), _jsx(DriverCTA, {}), _jsx(DownloadApp, {})] }));
}
