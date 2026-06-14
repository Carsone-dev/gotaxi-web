import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import {
  Eye, EyeOff, ArrowRight, Shield,
  BarChart3, Users, Package, TrendingUp,
} from "lucide-react";

const schema = z.object({
  telephone: z.string().min(8, "Numéro invalide"),
  password: z.string().min(6, "6 caractères minimum"),
});

type FormData = z.infer<typeof schema>;

const FEATURES = [
  { Icon: BarChart3, title: "Tableau de bord temps réel", desc: "KPIs, revenus et activité live" },
  { Icon: Users, title: "Gestion des utilisateurs", desc: "Chauffeurs, clients, KYC, suspensions" },
  { Icon: Package, title: "Voyages & colis", desc: "Suivi, validation, litiges" },
  { Icon: TrendingUp, title: "Rapports financiers", desc: "Mobile Money, transactions, revenus" },
];

export default function LoginPage() {
  const { login, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";
  const [showPw, setShowPw] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit = async (data: FormData) => {
    setLoginError(null);
    try {
      await login(data.telephone, data.password);
      toast.success("Connexion réussie");
      navigate(from, { replace: true });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Identifiants invalides";
      setLoginError(msg);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Panneau gauche — branding ─────────────────────────────────── */}
      <div className="relative hidden w-[500px] shrink-0 flex-col justify-between overflow-hidden bg-slate-950 p-12 lg:flex">
        {/* Blobs décoratifs */}
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-12 size-72 rounded-full bg-accent-yellow/10 blur-3xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-xl font-black text-white shadow-lg">
            G
          </div>
          <div>
            <p className="text-xl font-extrabold leading-none text-white">
              Go<span className="text-primary">Taxi</span>
            </p>
            <p className="mt-0.5 text-2xs font-bold uppercase tracking-[0.2em] text-white/35">
              Administration
            </p>
          </div>
        </div>

        {/* Accroche + features */}
        <div className="relative">
          <h2 className="text-[2rem] font-extrabold leading-tight text-white">
            Pilotez votre<br />
            plateforme<br />
            <span className="text-primary">en temps réel.</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/45">
            Tableau de bord complet pour gérer chauffeurs,<br />
            voyages et transactions au Bénin &amp; Togo.
          </p>

          <div className="mt-10 space-y-5">
            {FEATURES.map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <Icon className="size-4 text-white/60" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/85">{title}</p>
                  <p className="text-xs text-white/40">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative flex items-center gap-2">
          <Shield className="size-3.5 text-white/25" />
          <p className="text-xs text-white/25">
            Connexion chiffrée · Administrateurs uniquement
          </p>
        </div>
      </div>

      {/* ── Panneau droit — formulaire ────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-gray-50 px-6 py-12">
        {/* Logo mobile */}
        <div className="mb-10 flex items-center gap-3 lg:hidden">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-lg font-black text-white">
            G
          </div>
          <p className="text-xl font-extrabold">
            Go<span className="text-primary">Taxi</span>
            <span className="ml-2 text-sm font-semibold text-muted-foreground">Admin</span>
          </p>
        </div>

        <div className="w-full max-w-[380px]">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-ink">Connexion</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Entrez vos identifiants administrateur pour accéder au tableau de bord.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Téléphone */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                placeholder="+229 97 00 00 10"
                autoComplete="tel"
                className={[
                  "w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink placeholder:text-muted-foreground/60 outline-none transition-all",
                  "focus:border-primary focus:ring-2 focus:ring-primary/15",
                  errors.telephone
                    ? "border-error focus:border-error focus:ring-error/15"
                    : "border-border",
                ].join(" ")}
                {...register("telephone")}
              />
              {errors.telephone && (
                <p className="mt-1.5 text-xs font-medium text-error">
                  {errors.telephone.message}
                </p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={[
                    "w-full rounded-xl border bg-white px-4 py-3 pr-11 text-sm text-ink placeholder:text-muted-foreground/60 outline-none transition-all",
                    "focus:border-primary focus:ring-2 focus:ring-primary/15",
                    errors.password
                      ? "border-error focus:border-error focus:ring-error/15"
                      : "border-border",
                  ].join(" ")}
                  {...register("password")}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground transition-colors hover:text-ink"
                  aria-label={showPw ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs font-medium text-error">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Erreur de connexion inline */}
            {loginError && (
              <div className="rounded-xl border border-error/20 bg-error/5 px-4 py-3">
                <p className="text-sm font-medium text-error">{loginError}</p>
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isSubmitting ? (
                <>
                  <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connexion en cours…
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* Note de sécurité */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <Shield className="size-3.5 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground/50">
              Accès réservé aux administrateurs GoTaxi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
