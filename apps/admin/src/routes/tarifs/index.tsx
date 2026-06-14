import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Check, X, Search, ArrowRight, Route } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Spinner } from "@gotaxi/ui";
import {
  useAdminTarifs, useCreateTarif, useUpdateTarif, useDeleteTarif, useAdminVilles,
} from "@/hooks/useAdmin";
import { formatCurrency } from "@/lib/format";
import type { TarifTrajetRead, VilleRead } from "@/types/domain";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TarifsPage() {
  const { data: tarifs = [], isLoading } = useAdminTarifs();
  const { data: villes = [] } = useAdminVilles();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<TarifTrajetRead | null>(null);

  const createTarif = useCreateTarif();
  const updateTarif = useUpdateTarif();
  const deleteTarif = useDeleteTarif();

  const filtered = useMemo(() => {
    if (!search.trim()) return tarifs;
    const q = search.toLowerCase();
    return tarifs.filter(
      (t) =>
        t.ville_depart.nom.toLowerCase().includes(q) ||
        t.ville_arrivee.nom.toLowerCase().includes(q),
    );
  }, [tarifs, search]);

  const stats = useMemo(
    () => ({
      total: tarifs.length,
      actifs: tarifs.filter((t) => t.actif).length,
      inactifs: tarifs.filter((t) => !t.actif).length,
    }),
    [tarifs],
  );

  async function handleCreate(
    d: { ville_depart_id: string; ville_arrivee_id: string; prix_recommande: number; prix_max: number },
    bidirectionnel: boolean,
  ) {
    try {
      await createTarif.mutateAsync(d);
      if (bidirectionnel) {
        await createTarif.mutateAsync({
          ville_depart_id: d.ville_arrivee_id,
          ville_arrivee_id: d.ville_depart_id,
          prix_recommande: d.prix_recommande,
          prix_max: d.prix_max,
        });
        toast.success("2 tarifs créés (aller + retour)");
      } else {
        toast.success("Tarif créé");
      }
      setShowForm(false);
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail ?? "Erreur lors de la création");
    }
  }

  async function handleUpdate(
    d: { prix_recommande?: number; prix_max?: number; actif?: boolean },
  ) {
    if (!editTarget) return;
    try {
      await updateTarif.mutateAsync({ id: editTarget.id, ...d });
      toast.success("Tarif mis à jour");
      setEditTarget(null);
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail ?? "Erreur");
    }
  }

  async function handleToggle(t: TarifTrajetRead) {
    try {
      await updateTarif.mutateAsync({ id: t.id, actif: !t.actif });
    } catch {
      toast.error("Erreur");
    }
  }

  async function handleDelete(t: TarifTrajetRead) {
    if (!confirm(`Supprimer le tarif ${t.ville_depart.nom} → ${t.ville_arrivee.nom} ?`)) return;
    try {
      await deleteTarif.mutateAsync(t.id);
      toast.success("Tarif supprimé");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  }

  return (
    <>
      <PageHeader
        title="Tarifs des trajets"
        subtitle="Prix recommandés et plafonds par route"
        actions={
          <Button
            size="sm"
            leftIcon={<Plus className="size-4" />}
            onClick={() => { setShowForm(true); setEditTarget(null); }}
          >
            Nouveau tarif
          </Button>
        }
      />

      {/* Stats */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          {
            label: "Routes totales",
            value: stats.total,
            icon: <Route className="size-5 text-primary" />,
            bg: "bg-primary/10",
          },
          {
            label: "Actives",
            value: stats.actifs,
            icon: <Check className="size-5 text-success" />,
            bg: "bg-success-bg",
          },
          {
            label: "Inactives",
            value: stats.inactifs,
            icon: <X className="size-5 text-muted-foreground" />,
            bg: "bg-surface",
          },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4">
            <div className={`flex size-10 items-center justify-center rounded-xl ${s.bg}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xl font-bold text-ink">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Formulaire création / édition */}
      {(showForm || editTarget) && (
        <TarifForm
          initial={editTarget ?? undefined}
          villes={villes}
          onSave={editTarget
            ? (d) => handleUpdate(d)
            : (d, bi) => handleCreate(d as { ville_depart_id: string; ville_arrivee_id: string; prix_recommande: number; prix_max: number }, bi)}
          onCancel={() => { setShowForm(false); setEditTarget(null); }}
          isPending={createTarif.isPending || updateTarif.isPending}
          isEdit={!!editTarget}
        />
      )}

      {/* Barre de recherche */}
      <div className="mt-5 relative">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filtrer par ville…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Tableau */}
      <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-white">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Route className="mx-auto size-10 text-muted" />
            <p className="mt-3 font-semibold text-ink">
              {search ? "Aucun tarif trouvé" : "Aucun tarif configuré"}
            </p>
            {!search && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-1 text-sm text-primary underline underline-offset-2"
              >
                Créer le premier
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt">
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Route</th>
                <th className="px-5 py-3 text-right font-semibold text-muted-foreground">Recommandé</th>
                <th className="px-5 py-3 text-right font-semibold text-muted-foreground">Maximum</th>
                <th className="px-5 py-3 text-center font-semibold text-muted-foreground w-28">Ratio</th>
                <th className="px-5 py-3 text-center font-semibold text-muted-foreground">Statut</th>
                <th className="px-5 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const ratio = Math.round((t.prix_recommande / t.prix_max) * 100);
                return (
                  <tr
                    key={t.id}
                    className={`border-b border-border last:border-0 transition-colors ${
                      t.actif ? "hover:bg-surface-alt/50" : "bg-surface/40 opacity-60 hover:opacity-80"
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{t.ville_depart.nom}</span>
                        <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="font-semibold">{t.ville_arrivee.nom}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-primary">
                      {formatCurrency(t.prix_recommande)}
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-ink">
                      {formatCurrency(t.prix_max)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-semibold text-muted-foreground">{ratio}%</span>
                        <div className="h-1.5 w-20 rounded-full bg-border">
                          <div
                            className={`h-full rounded-full ${
                              ratio >= 90 ? "bg-success" : ratio >= 70 ? "bg-warning" : "bg-error"
                            }`}
                            style={{ width: `${ratio}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggle(t)}
                        disabled={updateTarif.isPending}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                          t.actif
                            ? "bg-success/10 text-success hover:bg-success/20"
                            : "bg-surface text-muted-foreground hover:bg-border"
                        }`}
                      >
                        {t.actif ? <Check className="size-3" /> : <X className="size-3" />}
                        {t.actif ? "Actif" : "Inactif"}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => { setEditTarget(t); setShowForm(false); }}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface hover:text-ink transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(t)}
                          disabled={deleteTarif.isPending}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-error/10 hover:text-error transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {filtered.length > 0 && (
        <p className="mt-2 text-right text-xs text-muted-foreground">
          {filtered.length} route{filtered.length !== 1 ? "s" : ""}
          {search ? ` sur ${tarifs.length}` : ""}
        </p>
      )}
    </>
  );
}

// ─── Formulaire ───────────────────────────────────────────────────────────────

interface TarifFormProps {
  initial?: TarifTrajetRead;
  villes: VilleRead[];
  onSave: (d: { ville_depart_id?: string; ville_arrivee_id?: string; prix_recommande: number; prix_max: number }, bidirectionnel: boolean) => void;
  onCancel: () => void;
  isPending: boolean;
  isEdit: boolean;
}

function TarifForm({ initial, villes, onSave, onCancel, isPending, isEdit }: TarifFormProps) {
  const [villeDepartId, setVilleDepartId] = useState(initial?.ville_depart_id ?? "");
  const [villeArriveeId, setVilleArriveeId] = useState(initial?.ville_arrivee_id ?? "");
  const [prixReco, setPrixReco] = useState(String(initial?.prix_recommande ?? ""));
  const [prixMax, setPrixMax] = useState(String(initial?.prix_max ?? ""));
  const [bidirectionnel, setBidirectionnel] = useState(false);
  const [error, setError] = useState("");

  const activeVilles = villes.filter((v) => v.actif);

  const recoNum = Number(prixReco);
  const maxNum = Number(prixMax);
  const ratio = recoNum > 0 && maxNum > 0 ? Math.round((recoNum / maxNum) * 100) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isEdit && (!villeDepartId || !villeArriveeId)) return setError("Sélectionnez les deux villes.");
    if (!isEdit && villeDepartId === villeArriveeId) return setError("Les villes doivent être différentes.");
    if (isNaN(recoNum) || recoNum < 500) return setError("Prix recommandé invalide (min 500 FCFA).");
    if (isNaN(maxNum) || maxNum < 500) return setError("Prix maximum invalide (min 500 FCFA).");
    if (recoNum > maxNum) return setError("Le prix recommandé ne peut pas dépasser le maximum.");

    onSave(
      {
        ...(isEdit ? {} : { ville_depart_id: villeDepartId, ville_arrivee_id: villeArriveeId }),
        prix_recommande: recoNum,
        prix_max: maxNum,
      },
      !isEdit && bidirectionnel,
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-2xl border border-primary/30 bg-white p-5 shadow-soft"
    >
      <h3 className="mb-4 text-sm font-bold">
        {isEdit ? `Modifier — ${initial?.ville_depart.nom} → ${initial?.ville_arrivee.nom}` : "Nouveau tarif"}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {!isEdit && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ville de départ
              </label>
              <select
                value={villeDepartId}
                onChange={(e) => setVilleDepartId(e.target.value)}
                className="rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="">-- Choisir --</option>
                {activeVilles.map((v) => (
                  <option key={v.id} value={v.id}>{v.nom}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ville d'arrivée
              </label>
              <select
                value={villeArriveeId}
                onChange={(e) => setVilleArriveeId(e.target.value)}
                className="rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="">-- Choisir --</option>
                {activeVilles.map((v) => (
                  <option key={v.id} value={v.id}>{v.nom}</option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Prix recommandé (FCFA)
          </label>
          <input
            type="number"
            value={prixReco}
            onChange={(e) => setPrixReco(e.target.value)}
            min={500}
            placeholder="5000"
            className="rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Prix maximum (FCFA)
          </label>
          <input
            type="number"
            value={prixMax}
            onChange={(e) => setPrixMax(e.target.value)}
            min={500}
            placeholder="7000"
            className="rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Ratio visuel */}
      {ratio !== null && (
        <div className="mt-3 flex items-center gap-3 rounded-xl bg-surface px-3 py-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
            <div
              className={`h-full rounded-full transition-all ${
                ratio >= 90 ? "bg-success" : ratio >= 70 ? "bg-warning" : "bg-error"
              }`}
              style={{ width: `${Math.min(ratio, 100)}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-semibold text-muted-foreground">
            Reco = {ratio}% du max
          </span>
        </div>
      )}

      {/* Option bidirectionnel (création uniquement) */}
      {!isEdit && (
        <label className="mt-3 flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={bidirectionnel}
            onChange={(e) => setBidirectionnel(e.target.checked)}
            className="size-4 rounded accent-primary"
          />
          <span className="text-sm font-medium text-ink">
            Créer aussi le tarif retour{" "}
            {villeArriveeId && villeDepartId
              ? `(${activeVilles.find((v) => v.id === villeArriveeId)?.nom ?? "?"} → ${activeVilles.find((v) => v.id === villeDepartId)?.nom ?? "?"})`
              : "(aller + retour au même prix)"}
          </span>
        </label>
      )}

      {error && <p className="mt-3 text-xs text-error">{error}</p>}

      <div className="mt-4 flex gap-3">
        <Button type="submit" size="sm" loading={isPending}>
          {isEdit ? "Mettre à jour" : bidirectionnel ? "Créer aller + retour" : "Créer le tarif"}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-border px-4 py-1.5 text-sm font-semibold hover:bg-surface transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
