import type { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PhoneInput, { type Value as PhoneValue, isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, DollarSign, Shield, Clock, Star,
  ChevronDown, Car, Users, Zap, FileText, Award,
  ArrowRight, ChevronLeft, Lock, Timer,
} from "lucide-react";
import { chauffeurApi, publicApi } from "@/lib/api";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  prenom: z.string().min(2, "Prénom trop court"),
  nom: z.string().min(2, "Nom trop court"),
  telephone: z
    .string({ required_error: "Numéro requis" })
    .min(1, "Numéro requis")
    .refine((v) => isValidPhoneNumber(v), "Numéro de téléphone invalide"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  ville: z.string().min(1, "Choisissez une ville"),
  disponibilite: z.string().min(1, "Choisissez votre disponibilité"),
});

const step2Schema = z.object({
  type_vehicule: z.string().min(1, "Type de véhicule requis"),
  vehicule: z.string().min(5, "Ex: Toyota Corolla 2020, 4 places"),
  experience: z.string().min(1, "Indiquez votre expérience"),
  message: z.string().optional(),
});

type Step1Fields = z.infer<typeof step1Schema>;
type Step2Fields = z.infer<typeof step2Schema>;

// ─── Data ─────────────────────────────────────────────────────────────────────

const TYPES_VEHICULE = [
  { value: "berline", label: "Berline", icon: "🚗", desc: "Citadine, sedan" },
  { value: "suv", label: "SUV / 4x4", icon: "🚙", desc: "Tout-terrain" },
  { value: "minibus", label: "Minibus", icon: "🚐", desc: "7–15 places" },
  { value: "tricycle", label: "Tricycle", icon: "🛺", desc: "Keke, taxi-moto" },
];

const DISPONIBILITES = [
  { value: "full_time", label: "Temps plein", icon: "🕐", desc: "40h+ / semaine" },
  { value: "part_time", label: "Temps partiel", icon: "⏰", desc: "20–40h / semaine" },
  { value: "weekends", label: "Week-ends", icon: "📅", desc: "Sam. & dim." },
  { value: "flexible", label: "Flexible", icon: "🔄", desc: "Selon dispo" },
];

const EXPERIENCES = [
  { value: "< 1 an", label: "Débutant" },
  { value: "1 – 3 ans", label: "1 – 3 ans" },
  { value: "3 – 5 ans", label: "3 – 5 ans" },
  { value: "5+ ans", label: "5+ ans" },
];

const benefits = [
  { Icon: DollarSign, title: "Revenus attractifs", desc: "150 000 – 500 000 FCFA par mois selon votre disponibilité", color: "bg-emerald-50 text-emerald-600 ring-emerald-100" },
  { Icon: Clock, title: "100% flexible", desc: "Travaillez quand vous voulez, vous êtes votre propre patron", color: "bg-blue-50 text-blue-600 ring-blue-100" },
  { Icon: Shield, title: "Assurance incluse", desc: "Couverture complète pour vous et vos passagers à chaque course", color: "bg-violet-50 text-violet-600 ring-violet-100" },
  { Icon: Zap, title: "Paiements rapides", desc: "Versement Mobile Money chaque semaine, sans frais cachés", color: "bg-amber-50 text-amber-600 ring-amber-100" },
  { Icon: Users, title: "Communauté solide", desc: "1 200+ chauffeurs, entraide, astuces et événements réguliers", color: "bg-orange-50 text-orange-600 ring-orange-100" },
  { Icon: Award, title: "Bonus fidélité", desc: "Programmes de récompense selon votre note et votre activité", color: "bg-rose-50 text-rose-600 ring-rose-100" },
];

const steps = [
  { num: 1, Icon: FileText, title: "Candidature en ligne", desc: "Remplissez le formulaire en 3 minutes. Gratuit, sans engagement." },
  { num: 2, Icon: Shield, title: "Vérification KYC", desc: "Notre équipe vérifie vos documents en moins de 24h ouvrables." },
  { num: 3, Icon: Zap, title: "Activation & démarrage", desc: "Compte activé ! Téléchargez l'app GoTaxi Driver et commencez à gagner." },
];

const testimonials = [
  { name: "Kofi Mensah", ville: "Cotonou", since: "2 ans", avatar: "KM", courses: "3 200+", text: "Depuis que j'ai rejoint GoTaxi, mes revenus ont doublé. Le support est réactif et les paiements toujours à temps." },
  { name: "Adama Traoré", ville: "Parakou", since: "1 an", avatar: "AT", courses: "1 800+", text: "La flexibilité est incroyable. Je travaille le matin et reste disponible pour ma famille l'après-midi." },
  { name: "Sèmèvo Dossou", ville: "Lomé", since: "8 mois", avatar: "SD", courses: "950+", text: "L'inscription était super simple. J'hésitais mais je ne regrette absolument pas. Je recommande à tous." },
];

const faqs = [
  { q: "Combien coûte l'inscription ?", a: "L'inscription est totalement gratuite. GoTaxi prend uniquement une commission sur les courses effectuées." },
  { q: "Quel type de véhicule est accepté ?", a: "Berlines, SUV et minibus de 2010 ou plus récent en bon état. Le véhicule passe une inspection technique avant activation." },
  { q: "Combien de temps prend la validation KYC ?", a: "En général 24h ouvrables. En période de forte demande, cela peut aller jusqu'à 48h." },
  { q: "Comment sont calculés mes gains ?", a: "Vous gardez 80% de chaque course. Les paiements sont effectués chaque semaine sur votre compte Mobile Money." },
  { q: "Puis-je travailler dans plusieurs villes ?", a: "Oui ! Votre compte est actif partout où GoTaxi est présent : Bénin, Togo, et bientôt Côte d'Ivoire." },
];

// ─── Composant principal ───────────────────────────────────────────────────────

export default function ChauffeurPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [step1Data, setStep1Data] = useState<Step1Fields | null>(null);

  const form1 = useForm<Step1Fields>({ resolver: zodResolver(step1Schema) });
  const form2 = useForm<Step2Fields>({ resolver: zodResolver(step2Schema) });

  const driverFirstName = form1.watch("prenom") || step1Data?.prenom || "";

  const handleStep1 = form1.handleSubmit((data) => {
    setStep1Data(data);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const handleStep2 = form2.handleSubmit(async (data) => {
    if (!step1Data) return;
    const { disponibilite, email: _email, ...step1Rest } = step1Data;
    const details = [
      `Type: ${data.type_vehicule}`,
      `Expérience: ${data.experience}`,
      `Disponibilité: ${disponibilite}`,
      data.message,
    ].filter(Boolean).join(" | ");

    await chauffeurApi.submitDemande({
      ...step1Rest,
      vehicule: data.vehicule,
      message: details,
    });
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  return (
    <>
      <Helmet>
        <title>Devenir chauffeur GoTaxi — Rejoignez notre réseau</title>
        <meta name="description" content="Rejoignez le réseau GoTaxi. Gagnez entre 150 000 et 500 000 FCFA par mois avec des horaires flexibles au Bénin et au Togo." />
      </Helmet>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-hero py-16 text-white lg:py-24">
        <div className="absolute -right-24 -top-24 size-[500px] rounded-full bg-primary/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-24 size-80 rounded-full bg-accent-yellow/15 blur-3xl pointer-events-none" />

        <div className="container-page relative z-10 grid items-start gap-12 lg:grid-cols-2">
          {/* Left */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-yellow/40 bg-accent-yellow/20 px-4 py-1.5 text-xs font-semibold">
              🚗 1 200+ chauffeurs nous font confiance
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-tight lg:text-5xl">
              Devenez chauffeur<br />
              <span className="text-accent-yellow">GoTaxi</span> et gagnez<br />
              à votre rythme
            </h1>

            <p className="mt-4 max-w-md text-lg text-white/80">
              Rejoignez le réseau de transport le plus fiable d'Afrique de l'Ouest. Travaillez quand vous voulez, soyez payé chaque semaine.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4">
              <HeroStat value="150K+" label="FCFA min/mois" />
              <HeroStat value="⭐ 4.9" label="Note moyenne" />
              <HeroStat value="24h" label="Activation KYC" />
            </div>

            <div className="mt-8 hidden lg:flex flex-col gap-3">
              {steps.map((s, i) => (
                <motion.div
                  key={s.num}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-yellow/20 text-xs font-extrabold text-accent-yellow ring-1 ring-accent-yellow/30">
                    {s.num}
                  </span>
                  <span className="text-sm text-white/80">{s.title}</span>
                  {i < steps.length - 1 && <div className="mx-2 h-px flex-1 bg-white/10" />}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — Formulaire */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="rounded-2xl bg-white/10 p-1"
          >
            <div className="rounded-xl overflow-hidden text-ink shadow-2xl ring-1 ring-black/5">
              {/* Branded header */}
              <div className="bg-primary px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                    <Car className="size-4 text-white" />
                  </div>
                  <div className="leading-none">
                    <p className="text-sm font-extrabold text-white">GoTaxi Driver</p>
                    <p className="mt-0.5 text-[10px] text-white/60">Candidature chauffeur</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Inscriptions ouvertes
                </span>
              </div>

              {/* Form body */}
              <div className="bg-white p-6">
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <SuccessState key="success" />
                  ) : (
                    <motion.div
                      key={`step-${step}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      {/* Progress */}
                      <div className="mb-5">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-muted-foreground">Étape {step} sur 2</p>
                          <p className="text-xs text-muted-foreground">{step === 1 ? "Vos coordonnées" : "Votre véhicule"}</p>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-surface overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-primary"
                            initial={{ width: step === 1 ? "0%" : "50%" }}
                            animate={{ width: step === 1 ? "50%" : "100%" }}
                            transition={{ duration: 0.4 }}
                          />
                        </div>
                      </div>

                      {step === 1 ? (
                        <Step1Form form={form1} onSubmit={handleStep1} />
                      ) : (
                        <Step2Form
                          form={form2}
                          onSubmit={handleStep2}
                          driverName={driverFirstName}
                          onBack={() => setStep(1)}
                        />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Trust footer */}
              {!submitted && (
                <div className="border-t border-border bg-surface px-5 py-2.5 flex items-center justify-center gap-5">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="size-3 text-primary" /> Données sécurisées
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle className="size-3 text-primary" /> 100% gratuit
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Timer className="size-3 text-primary" /> Réponse en 24h
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section className="py-20">
        <div className="container-page">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-3">Simple & rapide</span>
            <h2 className="text-2xl font-extrabold lg:text-3xl">Comment ça marche ?</h2>
            <p className="mt-2 text-muted-foreground">Rejoignez notre réseau en 3 étapes simples</p>
          </motion.div>

          <div className="relative grid gap-6 sm:grid-cols-3">
            <div className="absolute top-8 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary/20 via-primary/60 to-primary/20 hidden sm:block" />
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-border hover:shadow-card transition-shadow"
              >
                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 ring-4 ring-primary/5">
                  <s.Icon className="size-6 text-primary" />
                </div>
                <span className="absolute -top-3 -right-3 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-white shadow">
                  {s.num}
                </span>
                <h3 className="font-bold text-sm">{s.title}</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Avantages ── */}
      <section className="bg-surface py-20">
        <div className="container-page">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-3">Pourquoi nous rejoindre</span>
            <h2 className="text-2xl font-extrabold lg:text-3xl">Vos avantages</h2>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="group flex gap-4 rounded-2xl bg-white border border-border p-5 hover:shadow-card transition-all hover:-translate-y-0.5"
              >
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ring-4 ${b.color}`}>
                  <b.Icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{b.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Témoignages ── */}
      <section className="py-20">
        <div className="container-page">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-3">Ils l'ont fait</span>
            <h2 className="text-2xl font-extrabold lg:text-3xl">Nos chauffeurs témoignent</h2>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="flex flex-col rounded-2xl border border-border bg-white p-6 hover:shadow-card transition-shadow"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="flex-1 text-sm text-muted-foreground leading-relaxed italic">"{t.text}"</p>
                <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-extrabold text-primary">
                    {t.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.ville} · {t.since} de service</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-extrabold text-primary">{t.courses}</p>
                    <p className="text-xs text-muted-foreground">courses</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Conditions ── */}
      <section className="bg-surface py-20">
        <div className="container-page max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-3">Prérequis</span>
            <h2 className="text-2xl font-extrabold lg:text-3xl">Conditions requises</h2>
            <p className="mt-2 text-muted-foreground">Pour rejoindre notre réseau, vous devez avoir :</p>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Permis de conduire valide (minimum 2 ans d'ancienneté)",
              "Véhicule en bon état général (2010 ou plus récent)",
              "Casier judiciaire vierge",
              "CIN ou passeport en cours de validité",
              "Smartphone Android ou iOS compatible",
              "Compte Mobile Money actif (MTN, Moov, etc.)",
            ].map((req, i) => (
              <motion.div
                key={req}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-3 rounded-xl border border-border bg-white p-4"
              >
                <CheckCircle className="size-4 shrink-0 text-primary" />
                <span className="text-sm">{req}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20">
        <div className="container-page max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-3">FAQ</span>
            <h2 className="text-2xl font-extrabold lg:text-3xl">Questions fréquentes</h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="rounded-2xl border border-border bg-white overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-semibold hover:bg-surface transition-colors"
                >
                  {faq.q}
                  <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="bg-gradient-hero py-20 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="container-page text-center max-w-2xl"
        >
          <span className="text-4xl">🚗</span>
          <h2 className="mt-4 text-3xl font-extrabold lg:text-4xl">
            Prêt à rejoindre<br />
            <span className="text-accent-yellow">GoTaxi</span> ?
          </h2>
          <p className="mt-4 text-white/80">
            Plus de 1 200 chauffeurs gagnent déjà leur vie avec nous. Ne laissez pas passer cette opportunité.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent-yellow px-8 py-4 text-sm font-extrabold text-ink hover:bg-accent-yellow/90 transition-colors shadow-lg"
          >
            Candidater maintenant <ArrowRight className="size-4" />
          </button>
          <p className="mt-3 text-xs text-white/60">Gratuit · Sans engagement · Réponse sous 24h</p>
        </motion.div>
      </section>
    </>
  );
}

// ─── Composants ────────────────────────────────────────────────────────────────

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-white/10 px-4 py-3 text-center backdrop-blur-sm">
      <p className="text-xl font-extrabold text-accent-yellow">{value}</p>
      <p className="mt-0.5 text-xs text-white/70">{label}</p>
    </div>
  );
}

function SuccessState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
        className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-emerald-50 ring-4 ring-emerald-100"
      >
        <CheckCircle className="size-8 text-emerald-500" />
      </motion.div>
      <h2 className="text-xl font-extrabold text-ink">Candidature reçue !</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
        Notre équipe vous contactera dans les <strong>24h</strong> pour valider votre dossier. Vérifiez votre téléphone !
      </p>
      <div className="mt-6 flex flex-col items-center gap-2">
        {[
          { label: "Candidature soumise", done: true },
          { label: "Vérification KYC", done: false },
          { label: "Activation compte", done: false },
        ].map((s) => (
          <div key={s.label} className={`flex items-center gap-2 text-xs ${s.done ? "text-primary font-semibold" : "text-muted-foreground opacity-50"}`}>
            {s.done ? <CheckCircle className="size-3.5" /> : <Clock className="size-3.5" />}
            {s.label}
          </div>
        ))}
      </div>
      <p className="mt-5 text-xs text-muted-foreground">Besoin d'aide ? WhatsApp: <strong>+229 01 XX XX XX</strong></p>
    </motion.div>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-shadow";

// ── PhoneField ─────────────────────────────────────────────────────────────────

function PhoneField({ form }: { form: ReturnType<typeof useForm<Step1Fields>> }) {
  const hasError = !!form.formState.errors.telephone;
  return (
    <Field label="Numéro de téléphone" error={form.formState.errors.telephone?.message}>
      <div
        className={`gotaxi-phone flex h-11 w-full overflow-hidden rounded-xl border bg-white transition-all focus-within:ring-2 focus-within:ring-primary/20 ${
          hasError ? "border-red-400" : "border-border focus-within:border-primary"
        }`}
      >
        <Controller
          name="telephone"
          control={form.control}
          render={({ field: { onChange, value } }) => (
            <PhoneInput
              defaultCountry="BJ"
              international
              countryCallingCodeEditable={false}
              value={value as PhoneValue}
              onChange={(val) => onChange(val ?? "")}
              placeholder="01 97 00 00 00"
            />
          )}
        />
      </div>
    </Field>
  );
}

// ── Step1Form ──────────────────────────────────────────────────────────────────

function Step1Form({
  form,
  onSubmit,
}: {
  form: ReturnType<typeof useForm<Step1Fields>>;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const selectedDispo = form.watch("disponibilite");
  const [villes, setVilles] = useState<string[]>([]);
  const [villesLoading, setVillesLoading] = useState(true);

  useEffect(() => {
    const fallback = ["Cotonou", "Porto-Novo", "Abomey-Calavi", "Parakou", "Natitingou", "Lomé", "Sokodé", "Kara"];
    publicApi
      .villes()
      .then((data) => setVilles(data.villes?.length ? data.villes : fallback))
      .catch(() => setVilles(fallback))
      .finally(() => setVillesLoading(false));
  }, []);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-base font-extrabold">Vos coordonnées</h2>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Prénom" error={form.formState.errors.prenom?.message}>
          <input {...form.register("prenom")} placeholder="Kouassi" className={inputCls} />
        </Field>
        <Field label="Nom" error={form.formState.errors.nom?.message}>
          <input {...form.register("nom")} placeholder="Adjovi" className={inputCls} />
        </Field>
      </div>

      <PhoneField form={form} />

      <Field label="Email (optionnel)" error={form.formState.errors.email?.message}>
        <input {...form.register("email")} type="email" placeholder="vous@exemple.com" className={inputCls} />
      </Field>

      <Field label="Ville principale" error={form.formState.errors.ville?.message}>
        <div className="relative">
          <select
            {...form.register("ville")}
            defaultValue=""
            disabled={villesLoading}
            className={`w-full appearance-none cursor-pointer rounded-xl border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-shadow disabled:opacity-50 disabled:cursor-wait ${
              form.formState.errors.ville ? "border-red-400" : "border-border"
            }`}
          >
            <option value="" disabled>
              {villesLoading ? "Chargement..." : "🏙 Choisir une ville"}
            </option>
            {villes.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        </div>
      </Field>

      <Field label="Votre disponibilité" error={form.formState.errors.disponibilite?.message}>
        <div className="grid grid-cols-2 gap-2">
          {DISPONIBILITES.map((d) => {
            const selected = selectedDispo === d.value;
            return (
              <label
                key={d.value}
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 transition-all
                  ${selected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border hover:border-primary/40 hover:bg-surface"
                  }`}
              >
                <input
                  type="radio"
                  {...form.register("disponibilite")}
                  value={d.value}
                  className="sr-only"
                />
                <span className="text-base leading-none">{d.icon}</span>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold leading-tight ${selected ? "text-primary" : "text-ink"}`}>
                    {d.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight truncate">{d.desc}</p>
                </div>
                {selected && <CheckCircle className="ml-auto size-3.5 shrink-0 text-primary" />}
              </label>
            );
          })}
        </div>
      </Field>

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-extrabold text-white hover:bg-primary-600 transition-colors shadow-lg shadow-primary/20"
      >
        Continuer <ArrowRight className="size-4" />
      </button>
    </form>
  );
}

// ── Step2Form ──────────────────────────────────────────────────────────────────

function Step2Form({
  form,
  onSubmit,
  driverName,
  onBack,
}: {
  form: ReturnType<typeof useForm<Step2Fields>>;
  onSubmit: (e: React.FormEvent) => void;
  driverName: string;
  onBack: () => void;
}) {
  const selectedType = form.watch("type_vehicule");
  const selectedExp = form.watch("experience");

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-start gap-2 mb-1">
        <button
          type="button"
          onClick={onBack}
          className="mt-0.5 text-muted-foreground hover:text-ink transition-colors shrink-0"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div>
          <h2 className="text-base font-extrabold leading-tight">Votre véhicule</h2>
          {driverName && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Parfait, <span className="font-semibold text-primary">{driverName}</span> ! Plus qu'une étape 🚗
            </p>
          )}
        </div>
      </div>

      <Field label="Type de véhicule" error={form.formState.errors.type_vehicule?.message}>
        <div className="grid grid-cols-2 gap-2">
          {TYPES_VEHICULE.map((t) => {
            const selected = selectedType === t.value;
            return (
              <label
                key={t.value}
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 transition-all
                  ${selected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border hover:border-primary/40 hover:bg-surface"
                  }`}
              >
                <input
                  type="radio"
                  {...form.register("type_vehicule")}
                  value={t.value}
                  className="sr-only"
                />
                <span className="text-2xl leading-none">{t.icon}</span>
                <div>
                  <p className={`text-xs font-semibold leading-tight ${selected ? "text-primary" : "text-ink"}`}>
                    {t.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                </div>
                {selected && <CheckCircle className="ml-auto size-3.5 shrink-0 text-primary" />}
              </label>
            );
          })}
        </div>
      </Field>

      <Field label="Marque, modèle & année" error={form.formState.errors.vehicule?.message}>
        <div className="relative">
          <Car className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            {...form.register("vehicule")}
            placeholder="Ex: Toyota Corolla 2019, 4 places"
            className={`${inputCls} pl-8`}
          />
        </div>
      </Field>

      <Field label="Années d'expérience en conduite" error={form.formState.errors.experience?.message}>
        <div className="flex gap-2 flex-wrap">
          {EXPERIENCES.map((e) => {
            const selected = selectedExp === e.value;
            return (
              <label
                key={e.value}
                className={`flex cursor-pointer items-center rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all
                  ${selected
                    ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
                    : "border-border text-ink hover:border-primary/40 hover:bg-surface"
                  }`}
              >
                <input
                  type="radio"
                  {...form.register("experience")}
                  value={e.value}
                  className="sr-only"
                />
                {e.label}
              </label>
            );
          })}
        </div>
      </Field>

      <Field label="Message / infos complémentaires (optionnel)">
        <textarea
          {...form.register("message")}
          rows={2}
          placeholder="Questions, disponibilités particulières, infos supplémentaires..."
          className={`${inputCls} resize-none`}
        />
      </Field>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-extrabold text-white hover:bg-primary-600 transition-colors disabled:opacity-60 shadow-lg shadow-primary/20"
      >
        {form.formState.isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Envoi en cours...
          </span>
        ) : (
          <><CheckCircle className="size-4" /> Envoyer ma candidature</>
        )}
      </button>
    </form>
  );
}

// ── Field ──────────────────────────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-ink">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-error-text">{error}</p>}
    </div>
  );
}
