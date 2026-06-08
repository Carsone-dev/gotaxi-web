import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, DollarSign, Shield, Clock } from "lucide-react";

const schema = z.object({
  nom: z.string().min(2, "Nom trop court"),
  prenom: z.string().min(2, "Prénom trop court"),
  telephone: z.string().regex(/^\+?[0-9]{8,15}$/, "Numéro invalide"),
  ville: z.string().min(2, "Ville trop courte"),
  vehicule: z.string().min(5, "Décrivez votre véhicule"),
  message: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const benefits = [
  { icon: <DollarSign className="size-5 text-primary" />, title: "Revenus attractifs", desc: "Gagnez entre 150 000 et 500 000 FCFA par mois selon votre activité" },
  { icon: <Clock className="size-5 text-primary" />, title: "Horaires flexibles", desc: "Travaillez quand vous voulez. Vous êtes votre propre patron" },
  { icon: <Shield className="size-5 text-primary" />, title: "Assurance incluse", desc: "Couverture assurance pour vous et vos passagers pendant les courses" },
  { icon: <CheckCircle className="size-5 text-primary" />, title: "Support 24/7", desc: "Notre équipe est disponible en permanence pour vous accompagner" },
];

export default function ChauffeurPage() {
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (_data: FormData) => {
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
  };

  return (
    <>
      <Helmet>
        <title>Devenir chauffeur GoTaxi — Rejoignez notre réseau</title>
        <meta name="description" content="Rejoignez le réseau GoTaxi. Gagnez votre vie à votre rythme avec des revenus attractifs et des horaires flexibles." />
      </Helmet>

      <section className="bg-gradient-hero py-16 text-white">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-yellow/40 bg-accent-yellow/20 px-4 py-1.5 text-xs font-semibold mb-4">
              🚗 1 200+ chauffeurs nous font confiance
            </span>
            <h1 className="text-4xl font-extrabold lg:text-5xl">
              Devenez chauffeur<br />
              <span className="text-accent-yellow">GoTaxi</span>
            </h1>
            <p className="mt-4 text-white/80 text-lg">
              Rejoignez notre réseau et gagnez votre vie en faisant ce que vous aimez. Travaillez à votre rythme, sur vos propres horaires.
            </p>
            <div className="mt-6 flex gap-6">
              <Stat value="150K+" label="Revenus min/mois" />
              <Stat value="⭐ 4.9" label="Note moyenne" />
              <Stat value="24h" label="Activation KYC" />
            </div>
          </div>

          <div className="rounded-2xl bg-white/10 p-1 backdrop-blur-sm">
            <div className="rounded-xl bg-white p-6">
              {submitted ? (
                <div className="text-center py-6">
                  <CheckCircle className="size-12 text-primary mx-auto mb-3" />
                  <h2 className="text-xl font-extrabold text-ink">Candidature reçue !</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Notre équipe vous contactera dans les 24h pour valider votre dossier.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-extrabold text-ink mb-5">Candidater maintenant</h2>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Prénom" error={errors.prenom?.message}>
                        <input {...register("prenom")} placeholder="Kouassi" className={inputCls} />
                      </Field>
                      <Field label="Nom" error={errors.nom?.message}>
                        <input {...register("nom")} placeholder="Adjovi" className={inputCls} />
                      </Field>
                    </div>
                    <Field label="Téléphone" error={errors.telephone?.message}>
                      <input {...register("telephone")} placeholder="+229 97 00 00 00" className={inputCls} />
                    </Field>
                    <Field label="Ville principale" error={errors.ville?.message}>
                      <input {...register("ville")} placeholder="Cotonou" className={inputCls} />
                    </Field>
                    <Field label="Votre véhicule" error={errors.vehicule?.message}>
                      <input {...register("vehicule")} placeholder="Toyota Corolla 2019, 4 places" className={inputCls} />
                    </Field>
                    <Field label="Message (optionnel)">
                      <textarea
                        {...register("message")}
                        rows={2}
                        placeholder="Expériences, disponibilités..."
                        className={`${inputCls} resize-none`}
                      />
                    </Field>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary-600 transition-colors disabled:opacity-60"
                    >
                      {isSubmitting ? "Envoi en cours..." : "Envoyer ma candidature"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page">
          <h2 className="text-2xl font-extrabold text-center mb-10">Vos avantages</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-2xl border border-border bg-white p-5 hover:shadow-card transition-shadow">
                <div className="mb-3">{b.icon}</div>
                <h3 className="font-bold text-sm">{b.title}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="container-page max-w-3xl">
          <h2 className="text-2xl font-extrabold text-center mb-2">Conditions requises</h2>
          <p className="text-center text-muted-foreground mb-8">Pour rejoindre notre réseau, vous devez avoir :</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Permis de conduire valide (minimum 2 ans)",
              "Véhicule en bon état (2010 ou plus récent)",
              "Casier judiciaire vierge",
              "CIN ou passeport valide",
              "Smartphone Android ou iOS",
              "Compte Mobile Money actif",
            ].map((req) => (
              <div key={req} className="flex items-center gap-3 rounded-xl border border-border bg-white p-3">
                <CheckCircle className="size-4 shrink-0 text-primary" />
                <span className="text-sm">{req}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const inputCls = "w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-extrabold text-accent-yellow">{value}</p>
      <p className="text-xs text-white/80">{label}</p>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-ink">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-error-text">{error}</p>}
    </div>
  );
}
