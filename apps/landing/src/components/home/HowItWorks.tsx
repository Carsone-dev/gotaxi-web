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
  return (
    <section className="bg-surface py-20">
      <div className="container-page">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold lg:text-4xl">Comment ça marche ?</h2>
          <p className="mt-3 text-muted-foreground">Réservez votre trajet en 4 étapes simples</p>
        </div>

        <div className="relative">
          <div className="absolute inset-x-0 top-8 hidden h-0.5 bg-border lg:block" />

          <div className="grid gap-8 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.num} className="relative text-center">
                <div className="relative z-10 mx-auto flex size-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-card">
                  {step.emoji}
                </div>
                <div className="absolute left-1/2 top-4 -translate-x-1/2 -translate-y-1/2 z-20">
                  <span className="rounded-full bg-primary px-2 py-0.5 text-2xs font-bold text-white">
                    {step.num}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
