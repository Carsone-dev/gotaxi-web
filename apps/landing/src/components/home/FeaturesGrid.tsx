import { MapPin, CreditCard, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: <MapPin className="size-6" />,
    color: "bg-primary-100 text-primary",
    title: "Suivi GPS temps réel",
    desc: "Suivez votre chauffeur en direct sur la carte. Partagez votre position avec vos proches pour plus de sécurité.",
  },
  {
    icon: <CreditCard className="size-6" />,
    color: "bg-accent-yellow/20 text-accent-yellow-dark",
    title: "Mobile Money",
    desc: "MTN, Moov, Orange ou wallet GoTaxi. Payez comme vous voulez, en toute sécurité.",
  },
  {
    icon: <Shield className="size-6" />,
    color: "bg-success-bg text-success-text",
    title: "Chauffeurs vérifiés",
    desc: "Chaque chauffeur passe par un processus KYC complet : identité, permis, casier judiciaire.",
  },
  {
    icon: <Zap className="size-6" />,
    color: "bg-info-bg text-info-text",
    title: "Réservation rapide",
    desc: "Réservez votre trajet en moins de 2 minutes. Confirmation instantanée par SMS.",
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-20">
      <div className="container-page">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold lg:text-4xl">
            Tout ce dont vous avez besoin
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
            GoTaxi réinvente le transport interurbain avec des fonctionnalités pensées pour l'Afrique.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-white p-6 hover:shadow-card transition-shadow"
            >
              <div className={`inline-flex size-12 items-center justify-center rounded-2xl ${feature.color} mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-base font-bold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
