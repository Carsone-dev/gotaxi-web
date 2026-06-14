import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { UserPlus, Search, Phone, MapPin, Car, Calendar, CheckCircle, XCircle, Clock, Copy, Check } from "lucide-react";
import { useAdminDemandes, useAdminDemandesStats, useTraiterDemande, useRejeterDemande } from "@/hooks/useAdmin";
import type { DemandeChauffeur, TraiterDemandeCredentials, DemandeChauffeurStatut } from "@/types/domain";
import { formatDate } from "@/lib/format";

const STATUTS: { value: DemandeChauffeurStatut | ""; label: string }[] = [
  { value: "", label: "Toutes" },
  { value: "NOUVELLE", label: "Nouvelles" },
  { value: "TRAITEE", label: "Traitées" },
  { value: "REJETEE", label: "Rejetées" },
];

const statutStyle: Record<DemandeChauffeurStatut, string> = {
  NOUVELLE: "bg-blue-100 text-blue-700",
  EN_COURS: "bg-amber-100 text-amber-700",
  TRAITEE: "bg-emerald-100 text-emerald-700",
  REJETEE: "bg-red-100 text-red-700",
};

const statutLabel: Record<DemandeChauffeurStatut, string> = {
  NOUVELLE: "Nouvelle",
  EN_COURS: "En cours",
  TRAITEE: "Traitée",
  REJETEE: "Rejetée",
};

export default function DemandesPage() {
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState<DemandeChauffeurStatut | "">("");
  const [credentials, setCredentials] = useState<TraiterDemandeCredentials | null>(null);
  const [rejectTarget, setRejectTarget] = useState<DemandeChauffeur | null>(null);
  const [motifRejet, setMotifRejet] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: stats } = useAdminDemandesStats();
  const { data: demandes = [], isLoading } = useAdminDemandes(
    { statut: statut || undefined, search: search || undefined, size: 100 }
  );

  const traiter = useTraiterDemande();
  const rejeter = useRejeterDemande();

  const handleTraiter = async (d: DemandeChauffeur) => {
    if (!confirm(`Créer le compte chauffeur pour ${d.prenom} ${d.nom} (${d.telephone}) ?`)) return;
    try {
      const res = await traiter.mutateAsync(d.id);
      setCredentials(res.credentials);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      alert(msg || "Erreur lors de la création du compte");
    }
  };

  const handleRejeter = async () => {
    if (!rejectTarget) return;
    await rejeter.mutateAsync({ id: rejectTarget.id, motif: motifRejet || undefined });
    setRejectTarget(null);
    setMotifRejet("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Helmet><title>Demandes chauffeur — GoTaxi Admin</title></Helmet>

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-ink flex items-center gap-2">
              <UserPlus className="size-6 text-primary" />
              Demandes d'inscription chauffeur
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Candidatures reçues via le site public
            </p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Nouvelles" value={stats.nouvelle} color="text-blue-600" icon={<Clock className="size-4" />} />
            <StatCard label="Traitées" value={stats.traitee} color="text-emerald-600" icon={<CheckCircle className="size-4" />} />
            <StatCard label="Rejetées" value={stats.rejetee} color="text-red-600" icon={<XCircle className="size-4" />} />
            <StatCard label="Total" value={stats.total} color="text-ink" icon={<UserPlus className="size-4" />} />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom, téléphone, ville..."
              className="h-9 w-64 rounded-xl border border-border bg-white pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-1 rounded-xl border border-border bg-white p-1">
            {STATUTS.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatut(s.value as DemandeChauffeurStatut | "")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                  statut === s.value
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-surface"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground text-sm">Chargement...</div>
          ) : demandes.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">Aucune demande trouvée</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Candidat</th>
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">Véhicule</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {demandes.map((d) => (
                  <tr key={d.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{d.prenom} {d.nom}</p>
                      {d.message && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{d.message}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="size-3" /> {d.telephone}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="size-3" /> {d.ville}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Car className="size-3" /> {d.vehicule}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="size-3" /> {formatDate(d.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statutStyle[d.statut]}`}>
                        {statutLabel[d.statut]}
                      </span>
                      {d.statut === "REJETEE" && d.motif_rejet && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{d.motif_rejet}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {d.statut === "NOUVELLE" || d.statut === "EN_COURS" ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleTraiter(d)}
                            disabled={traiter.isPending}
                            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-60 transition-colors"
                          >
                            Créer le compte
                          </button>
                          <button
                            onClick={() => setRejectTarget(d)}
                            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-surface transition-colors"
                          >
                            Rejeter
                          </button>
                        </div>
                      ) : d.statut === "TRAITEE" && d.user_id ? (
                        <span className="text-xs text-emerald-600 font-medium">Compte créé</span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal credentials */}
      {credentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100">
                <CheckCircle className="size-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-extrabold text-ink">Compte créé avec succès</h2>
                <p className="text-xs text-muted-foreground">Transmettez ces identifiants au chauffeur</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-4 space-y-3 mb-4">
              <CredRow label="Téléphone" value={credentials.telephone} />
              <CredRow label="Mot de passe" value={credentials.password} />
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              Le chauffeur peut se connecter à l'application mobile avec ces identifiants et compléter son profil KYC.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => copyToClipboard(`Téléphone : ${credentials.telephone}\nMot de passe : ${credentials.password}`)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-semibold hover:bg-surface transition-colors"
              >
                {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                {copied ? "Copié !" : "Copier"}
              </button>
              <button
                onClick={() => setCredentials(null)}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal rejet */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="font-extrabold text-ink mb-1">Rejeter la demande</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {rejectTarget.prenom} {rejectTarget.nom} — {rejectTarget.telephone}
            </p>
            <textarea
              value={motifRejet}
              onChange={(e) => setMotifRejet(e.target.value)}
              placeholder="Motif du rejet (optionnel)"
              rows={3}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setRejectTarget(null); setMotifRejet(""); }}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold hover:bg-surface transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleRejeter}
                disabled={rejeter.isPending}
                className="flex-1 rounded-xl bg-error py-2.5 text-sm font-semibold text-white hover:bg-error/90 disabled:opacity-60 transition-colors"
              >
                Rejeter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4 flex items-center gap-3">
      <div className={`${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-xl font-extrabold ${color}`}>{value}</p>
      </div>
    </div>
  );
}

function CredRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-sm font-bold text-ink">{value}</span>
    </div>
  );
}
