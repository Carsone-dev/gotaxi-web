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

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-accent-yellow text-sm">★</span>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="py-20">
      <div className="container-page">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold lg:text-4xl">Ce que disent nos utilisateurs</h2>
          <p className="mt-3 text-muted-foreground">
            Plus de 50 000 voyageurs et expéditeurs nous font confiance
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 shadow-sm hover:shadow-card transition-shadow"
            >
              <StarRating count={t.rating} />
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full ${t.color} text-xs font-bold text-white`}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
          {[
            { value: "4.9/5", label: "Note App Store" },
            { value: "4.8/5", label: "Note Google Play" },
            { value: "50K+", label: "Avis vérifiés" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-extrabold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
