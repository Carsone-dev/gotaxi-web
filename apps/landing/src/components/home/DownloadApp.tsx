const features = [
  { emoji: "📍", text: "Suivi GPS en temps réel" },
  { emoji: "💳", text: "Paiement Mobile Money" },
  { emoji: "🔔", text: "Notifications instantanées" },
  { emoji: "⭐", text: "Notation des chauffeurs" },
  { emoji: "📦", text: "Suivi de colis intégré" },
  { emoji: "🌙", text: "Mode hors-ligne disponible" },
];

export function DownloadApp() {
  return (
    <section id="download" className="bg-surface py-20">
      <div className="container-page">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-ink via-ink to-primary-900">
          <div className="grid gap-8 p-8 lg:grid-cols-2 lg:items-center lg:p-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-xs font-semibold text-primary-300">
                📱 Application mobile
              </span>
              <h2 className="mt-4 text-3xl font-extrabold text-white lg:text-4xl">
                Téléchargez l'app
                <br />
                <span className="text-accent-yellow">GoTaxi gratuitement</span>
              </h2>
              <p className="mt-4 text-white/70 leading-relaxed">
                Disponible sur iOS et Android. Réservez, payez et suivez votre
                trajet depuis votre smartphone en quelques secondes.
              </p>

              <ul className="mt-6 grid grid-cols-2 gap-2">
                {features.map((f) => (
                  <li key={f.text} className="flex items-center gap-2 text-sm text-white/75">
                    <span>{f.emoji}</span>
                    {f.text}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#"
                  className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3.5 hover:bg-white/90 transition-colors"
                >
                  <span className="text-2xl"></span>
                  <div>
                    <p className="text-2xs text-ink/60">Télécharger sur</p>
                    <p className="text-sm font-extrabold text-ink">App Store</p>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3.5 hover:bg-white/90 transition-colors"
                >
                  <span className="text-2xl">▶</span>
                  <div>
                    <p className="text-2xs text-ink/60">Disponible sur</p>
                    <p className="text-sm font-extrabold text-ink">Google Play</p>
                  </div>
                </a>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {["AK", "KM", "FB", "SD"].map((initials) => (
                    <div
                      key={initials}
                      className="flex size-8 items-center justify-center rounded-full border-2 border-ink bg-primary text-xs font-bold text-white"
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-white/70">
                  <span className="font-bold text-white">50 000+</span> utilisateurs actifs
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center lg:justify-end">
              <div className="relative">
                <div className="h-80 w-48 rounded-3xl border border-white/20 bg-white/5 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-6">
                  <div className="size-16 rounded-2xl bg-primary flex items-center justify-center">
                    <span className="text-2xl font-extrabold text-white">GT</span>
                  </div>
                  <p className="text-center text-white font-extrabold text-xl">GoTaxi</p>
                  <div className="w-full space-y-2">
                    {["★★★★★", "4.9 / 5", "50K+ avis"].map((line) => (
                      <div key={line} className="rounded-xl bg-white/10 px-3 py-2 text-center text-xs text-white/70">
                        {line}
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white w-full text-center">
                    Installer
                  </div>
                </div>

                <div className="absolute -right-6 -top-6 size-24 rounded-full bg-accent-yellow/20 blur-2xl" />
                <div className="absolute -bottom-6 -left-6 size-20 rounded-full bg-primary/30 blur-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
