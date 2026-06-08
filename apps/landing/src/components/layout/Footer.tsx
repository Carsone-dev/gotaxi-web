import { Link } from "react-router-dom";

const links = {
  Produit: [
    { to: "/voyager", label: "Voyager" },
    { to: "/colis", label: "Envoyer un colis" },
    { to: "/chauffeur", label: "Devenir chauffeur" },
    { to: "/search", label: "Rechercher un trajet" },
  ],
  Support: [
    { to: "/track", label: "Suivre un colis" },
    { to: "/help", label: "Centre d'aide" },
    { to: "/contact", label: "Contact" },
  ],
  Légal: [
    { to: "/legal/cgu", label: "CGU" },
    { to: "/legal/privacy", label: "Confidentialité" },
    { to: "/legal/cookies", label: "Cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-ink text-white">
      <div className="container-page py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-primary font-extrabold text-white text-sm">
                GT
              </div>
              <span className="text-lg font-extrabold">GoTaxi</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-white/60 leading-relaxed">
              La plateforme de transport interurbain et de livraison de colis de confiance en Afrique de l'Ouest.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/60">🇧🇯 Bénin</span>
              <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/60">🇹🇬 Togo</span>
            </div>
          </div>

          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/40">{section}</p>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} GoTaxi. Tous droits réservés.
          </p>
          <div className="flex gap-3">
            <a href="#" className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20 transition-colors">
              <span></span> App Store
            </a>
            <a href="#" className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20 transition-colors">
              <span>▶</span> Google Play
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
