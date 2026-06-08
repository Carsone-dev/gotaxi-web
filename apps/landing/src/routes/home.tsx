import { Helmet } from "react-helmet-async";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesGrid } from "@/components/home/FeaturesGrid";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ColisSection } from "@/components/home/ColisSection";
import { Testimonials } from "@/components/home/Testimonials";
import { DriverCTA } from "@/components/home/DriverCTA";
import { DownloadApp } from "@/components/home/DownloadApp";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>GoTaxi — Votre course. Votre colis. En un clic.</title>
        <meta
          name="description"
          content="Plateforme de transport interurbain et livraison de colis au Bénin et au Togo. Chauffeurs vérifiés, paiement Mobile Money, suivi GPS temps réel."
        />
        <meta property="og:title" content="GoTaxi — Transport interurbain Bénin & Togo" />
        <meta property="og:type" content="website" />
      </Helmet>
      <HeroSection />
      <FeaturesGrid />
      <HowItWorks />
      <ColisSection />
      <Testimonials />
      <DriverCTA />
      <DownloadApp />
    </>
  );
}
