import { Link } from "react-router-dom";
import { Package, Truck, Shield, Clock } from "lucide-react";

const advantages = [
  {
    icon: <Package className="size-5" />,
    title: "Tout type de colis",
    desc: "Documents, vêtements, électronique, alimentaire — nous transportons tout.",
  },
  {
    icon: <Truck className="size-5" />,
    title: "Livraison rapide",
    desc: "Expédition le jour même sur les trajets disponibles. Arrivée sous 24-48h.",
  },
  {
    icon: <Shield className="size-5" />,
    title: "Colis assurés",
    desc: "Chaque colis est assuré pendant le transport. Zéro risque pour vous.",
  },
  {
    icon: <Clock className="size-5" />,
    title: "Suivi en temps réel",
    desc: "Suivez votre colis avec votre numéro de référence à tout moment.",
  },
];

export function ColisSection() {
  return (
    <section className="bg-ink py-20 text-white">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-xs font-semibold text-primary-300">
              📦 Envoi de colis
            </span>
            <h2 className="mt-4 text-3xl font-extrabold lg:text-4xl">
              Envoyez vos colis partout
              <br />
              <span className="text-accent-yellow">en Afrique de l'Ouest</span>
            </h2>
            <p className="mt-4 text-white/70 leading-relaxed">
              Profitez du réseau GoTaxi pour envoyer vos colis avec nos chauffeurs
              lors de leurs trajets interurbains. Rapide, sécurisé et abordable.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {advantages.map((adv) => (
                <div key={adv.title} className="flex gap-3">
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-primary-300">
                    {adv.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{adv.title}</p>
                    <p className="mt-0.5 text-xs text-white/60 leading-relaxed">{adv.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/colis"
                className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-600 transition-colors"
              >
                Envoyer un colis
              </Link>
              <Link
                to="/track"
                className="rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Suivre mon colis
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl bg-white/5 p-8 backdrop-blur-sm border border-white/10">
              <p className="mb-6 text-sm font-bold uppercase tracking-wider text-white/40">
                Tarif estimatif
              </p>
              <div className="space-y-4">
                {[
                  { route: "Cotonou → Parakou", weight: "1 kg", price: "1 500 FCFA" },
                  { route: "Cotonou → Natitingou", weight: "5 kg", price: "6 000 FCFA" },
                  { route: "Cotonou → Lomé", weight: "2 kg", price: "3 500 FCFA" },
                  { route: "Parakou → Lomé", weight: "10 kg", price: "14 000 FCFA" },
                ].map((item) => (
                  <div
                    key={item.route}
                    className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold">{item.route}</p>
                      <p className="text-xs text-white/50">{item.weight}</p>
                    </div>
                    <span className="text-sm font-extrabold text-accent-yellow">{item.price}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-xs text-white/40">
                * Tarifs indicatifs. Le prix final dépend du poids et de la catégorie.
              </p>
            </div>

            <div className="absolute -right-4 -top-4 size-24 rounded-full bg-primary/20 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 size-32 rounded-full bg-accent-yellow/10 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
