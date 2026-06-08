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
  return (
    <section className="bg-gradient-to-br from-primary-700 via-primary to-primary-600 py-20 text-white">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white/90">
              🚗 Chauffeurs partenaires
            </span>
            <h2 className="mt-4 text-3xl font-extrabold lg:text-4xl">
              Vous conduisez ?<br />
              Rejoignez GoTaxi et{" "}
              <span className="text-accent-yellow">multipliez vos revenus</span>
            </h2>
            <p className="mt-4 text-white/80 leading-relaxed">
              Plus de 1 200 chauffeurs font déjà confiance à GoTaxi pour remplir
              leurs trajets et augmenter leurs revenus. Rejoignez la communauté.
            </p>

            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent-yellow" />
                  <span className="text-sm text-white/85">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/chauffeur"
                className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary hover:bg-white/90 transition-colors"
              >
                Devenir chauffeur
              </Link>
              <Link
                to="/chauffeur#requirements"
                className="rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Voir les conditions
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
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
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm border border-white/10"
              >
                <span className="text-3xl">{card.icon}</span>
                <p className="mt-3 text-xs text-white/60 uppercase tracking-wider">{card.label}</p>
                <p className="mt-1 text-xl font-extrabold text-accent-yellow">{card.value}</p>
                <p className="mt-0.5 text-xs text-white/60">{card.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
