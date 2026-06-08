import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Package, MapPin, Phone, User, CheckCircle, Truck, Clock } from "lucide-react";
import { colisApi } from "@/lib/api";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { ColisStatut } from "@/types/domain";

const TIMELINE: Array<{ statut: ColisStatut; label: string; desc: string; icon: typeof CheckCircle }> = [
  { statut: "EN_ATTENTE", label: "En attente", desc: "Votre colis attend le chauffeur", icon: Clock },
  { statut: "CONFIRME", label: "Confirmé", desc: "Chauffeur accepté, prêt à partir", icon: CheckCircle },
  { statut: "EN_TRANSIT", label: "En transit", desc: "Votre colis est en route", icon: Truck },
  { statut: "LIVRE", label: "Livré", desc: "Colis livré avec succès", icon: CheckCircle },
];

const ORDER: Partial<Record<ColisStatut, number>> = {
  EN_ATTENTE: 0, CONFIRME: 1, EN_TRANSIT: 2, LIVRE: 3,
};

function TrackingForm() {
  return (
    <div className="container-page py-16 text-center">
      <div className="mx-auto max-w-md">
        <div className="text-6xl mb-4">📦</div>
        <h1 className="text-2xl font-extrabold">Suivre un colis</h1>
        <p className="mt-2 text-muted-foreground mb-8">
          Entrez votre code de suivi pour suivre votre colis en temps réel
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            window.location.href = `/track/${fd.get("reference")}`;
          }}
          className="flex gap-2"
        >
          <input
            name="reference"
            placeholder="GTX-XXXXXX"
            className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-mono outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            required
          />
          <button
            type="submit"
            className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-600 transition-colors"
          >
            Suivre
          </button>
        </form>
      </div>
    </div>
  );
}

export default function TrackPage() {
  const { reference } = useParams<{ reference: string }>();

  const { data: colis, isLoading, isError } = useQuery({
    queryKey: ["public-track", reference],
    queryFn: () => colisApi.publicTrack(reference!),
    enabled: !!reference,
    refetchInterval: 30_000,
  });

  if (!reference) return <TrackingForm />;

  if (isLoading) {
    return (
      <div className="container-page py-20 text-center">
        <div className="mx-auto size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-muted-foreground">Chargement du suivi...</p>
      </div>
    );
  }

  if (isError || !colis) {
    return (
      <div className="container-page py-20 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-xl font-bold">Colis introuvable</h1>
        <p className="mt-2 text-muted-foreground">
          Vérifiez votre code de suivi et réessayez
        </p>
        <Link
          to="/track"
          className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-600"
        >
          Nouvelle recherche
        </Link>
      </div>
    );
  }

  const currentStep = ORDER[colis.statut] ?? -1;

  return (
    <>
      <Helmet>
        <title>Suivi colis {colis.code_suivi} — GoTaxi</title>
      </Helmet>

      <div className="container-page py-10">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">Code de suivi</p>
          <h1 className="text-2xl font-extrabold font-mono text-primary">{colis.code_suivi}</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {colis.statut !== "ANNULE" ? (
              <div className="rounded-2xl border border-border bg-white p-6">
                <h2 className="mb-6 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Progression
                </h2>
                <div className="relative">
                  <div className="absolute left-4 top-4 h-[calc(100%-2rem)] w-0.5 bg-border" />
                  <div className="space-y-6">
                    {TIMELINE.map((step, i) => {
                      const done = currentStep >= i;
                      const active = currentStep === i;
                      const Icon = step.icon;
                      return (
                        <div key={step.statut} className="relative flex items-start gap-4">
                          <div
                            className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ring-2 ring-white
                              ${done ? "bg-primary" : "bg-surface"}`}
                          >
                            <Icon
                              className={`size-4 ${done ? "text-white" : "text-muted-foreground"}`}
                            />
                          </div>
                          <div className={active ? "font-bold" : ""}>
                            <p className={`text-sm ${done ? "text-ink" : "text-muted-foreground"}`}>
                              {step.label}
                            </p>
                            <p className="text-xs text-muted-foreground">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-error/30 bg-error-bg p-6 text-center">
                <p className="text-xl font-bold text-error-text">Colis annulé</p>
                <p className="mt-1 text-sm text-error-text/80">Ce colis a été annulé</p>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-white p-5">
              <h2 className="mb-4 text-sm font-bold">Détails du colis</h2>
              <dl className="space-y-3">
                <Row icon={<Package className="size-4" />} label="Description" value={colis.description} />
                <Row icon={<MapPin className="size-4" />} label="Trajet" value={`${colis.ville_depart} → ${colis.ville_arrivee}`} />
                <Row icon={<User className="size-4" />} label="Destinataire" value={colis.destinataire_nom} />
                <Row icon={<Phone className="size-4" />} label="Téléphone" value={colis.destinataire_telephone} />
                {colis.poids_kg && (
                  <Row icon={<Package className="size-4" />} label="Poids" value={`${colis.poids_kg} kg`} />
                )}
              </dl>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Prix estimé</p>
              <p className="mt-2 text-2xl font-extrabold text-primary">
                {colis.prix.toLocaleString("fr-FR")} FCFA
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {colis.modalite_paiement === "A_LA_LIVRAISON" ? "Paiement à la livraison" : "Paiement à la confirmation"}
              </p>
            </div>

            {colis.fragile && (
              <div className="rounded-2xl border border-warning/40 bg-warning-bg p-4">
                <p className="text-sm font-semibold text-warning-text">⚠ Colis fragile</p>
                <p className="text-xs text-warning-text/70 mt-0.5">Manipuler avec précaution</p>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-xs text-muted-foreground">Dernière mise à jour</p>
              <p className="text-sm font-medium mt-1">
                {format(parseISO(colis.updated_at), "dd/MM/yyyy à HH:mm", { locale: fr })}
              </p>
            </div>

            <div className="rounded-2xl bg-surface p-4 text-center text-xs text-muted-foreground">
              <p>Cette page se rafraîchit automatiquement toutes les 30 secondes</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <dt className="w-28 shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}
