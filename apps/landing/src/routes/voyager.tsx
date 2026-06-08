import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Shield, MapPin, CreditCard, Clock, Star, ChevronRight } from "lucide-react";

const advantages = [
  {
    icon: <Shield className="size-6 text-primary" />,
    title: "Chauffeurs vérifiés",
    desc: "Tous nos chauffeurs passent par un processus KYC rigoureux : CIN, permis, casier judiciaire.",
  },
  {
    icon: <MapPin className="size-6 text-primary" />,
    title: "Suivi GPS temps réel",
    desc: "Suivez votre chauffeur en temps réel sur la carte. Partagez votre position avec vos proches.",
  },
  {
    icon: <CreditCard className="size-6 text-primary" />,
    title: "Paiement sécurisé",
    desc: "MTN Money, Moov Money, Orange Money ou wallet GoTaxi. Payez comme vous voulez.",
  },
  {
    icon: <Clock className="size-6 text-primary" />,
    title: "Ponctualité garantie",
    desc: "Nos chauffeurs s'engagent sur des horaires précis. Alertes SMS en cas de retard.",
  },
];

const faq = [
  {
    q: "Comment réserver un trajet ?",
    a: "Recherchez votre trajet, choisissez un chauffeur, confirmez la réservation et payez en Mobile Money. Vous recevez un code de confirmation.",
  },
  {
    q: "Puis-je annuler ma réservation ?",
    a: "Oui, vous pouvez annuler votre réservation jusqu'à 2h avant le départ sans frais.",
  },
  {
    q: "Que faire si le chauffeur ne se présente pas ?",
    a: "Contactez notre support 24/7. Vous serez remboursé intégralement et nous vous trouverons une alternative.",
  },
  {
    q: "Peut-on voyager avec des bagages ?",
    a: "Oui, discutez directement avec votre chauffeur des bagages supplémentaires via l'application.",
  },
];

export default function VoyagerPage() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Helmet>
        <title>Voyager avec GoTaxi — Transport interurbain Bénin & Togo</title>
        <meta name="description" content="Réservez votre trajet interurbain avec des chauffeurs vérifiés. Paiement Mobile Money, suivi GPS, sécurité garantie." />
      </Helmet>

      <section className="bg-gradient-hero py-16 text-white">
        <div className="container-page text-center">
          <h1 className="text-4xl font-extrabold lg:text-5xl">Voyager avec GoTaxi</h1>
          <p className="mt-4 max-w-2xl mx-auto text-white/80 text-lg">
            Des milliers de trajets disponibles chaque jour entre les grandes villes du Bénin et du Togo.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/search?from=${from}&to=${to}`);
            }}
            className="mt-8 flex flex-col sm:flex-row gap-2 max-w-xl mx-auto bg-white rounded-2xl p-3 shadow-elevated"
          >
            <input
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="Départ (ex: Cotonou)"
              className="flex-1 rounded-xl bg-surface px-4 py-2.5 text-sm text-ink outline-none"
              required
            />
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Arrivée (ex: Parakou)"
              className="flex-1 rounded-xl bg-surface px-4 py-2.5 text-sm text-ink outline-none"
              required
            />
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-600 transition-colors"
            >
              Rechercher
            </button>
          </form>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page">
          <h2 className="text-2xl font-extrabold text-center mb-10">Pourquoi choisir GoTaxi ?</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map((adv) => (
              <div key={adv.title} className="rounded-2xl border border-border bg-white p-5 hover:shadow-card transition-shadow">
                <div className="mb-3">{adv.icon}</div>
                <h3 className="font-bold text-sm">{adv.title}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{adv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="container-page max-w-3xl">
          <h2 className="text-2xl font-extrabold text-center mb-10">Questions fréquentes</h2>
          <div className="space-y-3">
            {faq.map((item, i) => (
              <div key={i} className="rounded-2xl border border-border bg-white overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold text-sm hover:bg-surface transition-colors"
                >
                  {item.q}
                  <ChevronRight
                    className={`size-4 shrink-0 transition-transform text-muted-foreground ${openFaq === i ? "rotate-90" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-muted-foreground">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
