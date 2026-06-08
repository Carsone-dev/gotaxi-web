import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Package, Shield, Clock, CreditCard, ChevronRight } from "lucide-react";

const categories = [
  { label: "Documents", icon: "📄", coeff: "×0.8", desc: "Courriers, dossiers, contrats" },
  { label: "Vêtements", icon: "👕", coeff: "×1.0", desc: "Habits, tissus, chaussures" },
  { label: "Electronique", icon: "💻", coeff: "×1.5", desc: "Téléphones, ordinateurs" },
  { label: "Alimentaire", icon: "🥗", coeff: "×1.1", desc: "Produits non périssables" },
  { label: "Fragile", icon: "🫙", coeff: "×1.5", desc: "Verre, poteries, céramiques" },
  { label: "Autre", icon: "📦", coeff: "×1.0", desc: "Tout autre type de colis" },
];

const steps = [
  { num: "01", title: "Choisissez un trajet", desc: "Trouvez un chauffeur allant dans la même direction" },
  { num: "02", title: "Décrivez votre colis", desc: "Catégorie, poids, informations du destinataire" },
  { num: "03", title: "Le chauffeur confirme", desc: "Le chauffeur accepte votre colis avant le départ" },
  { num: "04", title: "Suivi en temps réel", desc: "Suivez votre colis avec le code GTX-XXXXXX" },
];

export default function ColisPage() {
  const navigate = useNavigate();
  const [reference, setReference] = useState("");

  return (
    <>
      <Helmet>
        <title>Envoyer un colis avec GoTaxi — Bénin & Togo</title>
        <meta name="description" content="Envoyez vos colis de ville en ville. Prix calculé automatiquement, suivi en temps réel, paiement Mobile Money." />
      </Helmet>

      <section className="bg-gradient-hero py-16 text-white">
        <div className="container-page text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent-yellow/40 bg-accent-yellow/20 px-4 py-1.5 text-xs font-semibold mb-4">
            📦 Livraison interurbaine disponible
          </span>
          <h1 className="text-4xl font-extrabold lg:text-5xl">
            Envoyez vos colis<br />
            <span className="text-accent-yellow">en toute sécurité</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-white/80 text-lg">
            Confiez vos colis à nos chauffeurs vérifiés. Prix transparent, suivi en temps réel, paiement à la livraison disponible.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/search")}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-600 transition-colors"
            >
              Envoyer un colis
            </button>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate(`/track/${reference}`);
              }}
              className="flex gap-2"
            >
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Code GTX-XXXXXX"
                className="rounded-xl bg-white/20 px-4 py-3 text-sm text-white placeholder-white/60 outline-none border border-white/30 focus:border-white"
              />
              <button
                type="submit"
                className="rounded-xl border border-white/50 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
              >
                Suivre
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page">
          <h2 className="text-2xl font-extrabold text-center mb-2">Comment ça marche ?</h2>
          <p className="text-center text-muted-foreground mb-10">4 étapes simples pour envoyer votre colis</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary-100 text-primary font-extrabold text-lg mb-3">
                  {step.num}
                </div>
                <h3 className="font-bold text-sm">{step.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="container-page">
          <h2 className="text-2xl font-extrabold text-center mb-2">Types de colis</h2>
          <p className="text-center text-muted-foreground mb-10">Le prix est calculé automatiquement selon la catégorie et le poids</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <div key={cat.label} className="flex items-start gap-4 rounded-2xl border border-border bg-white p-4">
                <span className="text-3xl">{cat.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm">{cat.label}</p>
                    <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-mono text-muted-foreground">{cat.coeff}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Prix = max(500, distance_km × 3 F × coefficient + poids × 100 F + supplément fragile)
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page max-w-2xl text-center">
          <h2 className="text-2xl font-extrabold mb-3">Prêt à envoyer ?</h2>
          <p className="text-muted-foreground mb-6">
            Téléchargez l'application GoTaxi pour envoyer vos colis depuis votre téléphone
          </p>
          <div className="flex justify-center gap-3">
            <a href="#" className="flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-3 hover:shadow-soft transition-shadow">
              <span className="text-2xl"></span>
              <div className="text-left">
                <p className="text-2xs text-muted-foreground">Disponible sur</p>
                <p className="text-sm font-extrabold">App Store</p>
              </div>
            </a>
            <a href="#" className="flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-3 hover:shadow-soft transition-shadow">
              <span className="text-2xl">▶</span>
              <div className="text-left">
                <p className="text-2xs text-muted-foreground">Disponible sur</p>
                <p className="text-sm font-extrabold">Google Play</p>
              </div>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
