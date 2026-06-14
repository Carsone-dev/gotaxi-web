import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Building2, ToggleLeft, ToggleRight, MapPin, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Spinner } from "@gotaxi/ui";
import {
  useAdminVilles, useAdminGares, useCreateGare, useUpdateGare, useDeleteGare,
} from "@/hooks/useAdmin";
import type { GareRead, VilleRead } from "@/types/domain";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GaresPage() {
  const { data: villes = [] } = useAdminVilles();
  const [villeFilter, setVilleFilter] = useState<string>("toutes");
  const { data: gares = [], isLoading } = useAdminGares(
    villeFilter !== "toutes" ? villeFilter : undefined,
  );

  const createMutation = useCreateGare();
  const updateMutation = useUpdateGare();
  const deleteMutation = useDeleteGare();

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<GareRead | null>(null);

  const stats = useMemo(() => ({
    total: gares.length,
    actives: gares.filter((g) => g.actif).length,
    inactives: gares.filter((g) => !g.actif).length,
  }), [gares]);

  const garesParVille = useMemo(() => {
    const map = new Map<string, GareRead[]>();
    for (const g of gares) {
      const list = map.get(g.ville.nom) ?? [];
      list.push(g);
      map.set(g.ville.nom, list);
    }
    return map;
  }, [gares]);

  async function handleCreate(d: Parameters<typeof createMutation.mutate>[0]) {
    try {
      await createMutation.mutateAsync(d);
      toast.success("Gare ajoutée");
      setShowForm(false);
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail ?? "Erreur");
    }
  }

  async function handleUpdate(d: { nom?: string; adresse?: string; lat?: number; lng?: number }) {
    if (!editTarget) return;
    try {
      await updateMutation.mutateAsync({ id: editTarget.id, ...d });
      toast.success("Gare mise à jour");
      setEditTarget(null);
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail ?? "Erreur");
    }
  }

  async function handleToggle(g: GareRead) {
    try {
      await updateMutation.mutateAsync({ id: g.id, actif: !g.actif });
    } catch { toast.error("Erreur"); }
  }

  async function handleDelete(g: GareRead) {
    if (!confirm(`Supprimer la gare "${g.nom}" ?`)) return;
    try {
      await deleteMutation.mutateAsync(g.id);
      toast.success("Gare supprimée");
    } catch { toast.error("Erreur"); }
  }

  return (
    <>
      <PageHeader
        title="Gares"
        subtitle="Points de départ et d'arrivée du réseau"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/villes">
              <Button variant="outline" size="sm" leftIcon={<MapPin className="size-4" />}>
                Gérer les villes
                <ExternalLink className="ml-1.5 size-3 opacity-60" />
              </Button>
            </Link>
            {!showForm && (
              <Button
                size="sm"
                leftIcon={<Plus className="size-4" />}
                onClick={() => setShowForm(true)}
              >
                Ajouter une gare
              </Button>
            )}
          </div>
        }
      />

      {/* Stats */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { label: "Total gares", value: stats.total, icon: <Building2 className="size-5 text-primary" />, bg: "bg-primary/10" },
          { label: "Actives", value: stats.actives, icon: <Building2 className="size-5 text-success" />, bg: "bg-success-bg" },
          { label: "Inactives", value: stats.inactives, icon: <Building2 className="size-5 text-muted-foreground" />, bg: "bg-surface" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4">
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xl font-bold text-ink">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtre par ville */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setVilleFilter("toutes")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
            villeFilter === "toutes"
              ? "bg-primary text-white"
              : "border border-border bg-surface text-muted-foreground hover:text-ink"
          }`}
        >
          Toutes les villes
        </button>
        {villes.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setVilleFilter(v.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              villeFilter === v.id
                ? "bg-primary text-white"
                : "border border-border bg-surface text-muted-foreground hover:text-ink"
            }`}
          >
            {v.nom}
          </button>
        ))}
      </div>

      {/* Formulaire création */}
      {showForm && (
        <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <p className="mb-3 text-sm font-bold text-primary">Nouvelle gare</p>
          <GareForm
            villes={villes}
            preselectedVilleId={villeFilter !== "toutes" ? villeFilter : undefined}
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            loading={createMutation.isPending}
          />
        </div>
      )}

      {/* Liste groupée par ville */}
      <div className="mt-4 space-y-5">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : gares.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-12 text-center">
            <Building2 className="mx-auto mb-3 size-8 text-muted" />
            <p className="font-semibold text-ink">Aucune gare</p>
            <p className="text-sm text-muted-foreground">
              {villeFilter !== "toutes" ? "Aucune gare pour cette ville." : "Ajoutez des gares pour commencer."}
            </p>
          </div>
        ) : (
          Array.from(garesParVille.entries()).map(([villeNom, gareListe]) => (
            <div key={villeNom}>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-xs font-black text-primary">
                  {villeNom.charAt(0)}
                </div>
                <h3 className="text-sm font-bold text-ink">{villeNom}</h3>
                <span className="text-xs text-muted-foreground">
                  ({gareListe.length} gare{gareListe.length !== 1 ? "s" : ""})
                </span>
              </div>

              <div className="space-y-1.5 pl-8">
                {gareListe.map((g) => (
                  <div key={g.id}>
                    {editTarget?.id === g.id ? (
                      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                        <GareForm
                          villes={villes}
                          initial={{
                            nom: g.nom,
                            ville_id: g.ville_id,
                            adresse: g.adresse ?? "",
                            lat: g.lat?.toString() ?? "",
                            lng: g.lng?.toString() ?? "",
                          }}
                          onSubmit={handleUpdate}
                          onCancel={() => setEditTarget(null)}
                          loading={updateMutation.isPending}
                        />
                      </div>
                    ) : (
                      <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                        g.actif ? "border-border bg-white" : "border-border/50 bg-surface opacity-60"
                      }`}>
                        <Building2 className={`size-4 shrink-0 ${g.actif ? "text-primary" : "text-muted-foreground"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-ink truncate">{g.nom}</p>
                          {g.adresse && <p className="text-xs text-muted-foreground truncate">{g.adresse}</p>}
                          {g.lat != null && g.lng != null && (
                            <p className="font-mono text-xs text-muted-foreground">
                              {g.lat.toFixed(4)}, {g.lng.toFixed(4)}
                            </p>
                          )}
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          g.actif ? "bg-success/10 text-success" : "bg-surface text-muted-foreground"
                        }`}>
                          {g.actif ? "Active" : "Inactive"}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleToggle(g)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface hover:text-ink transition-colors"
                          >
                            {g.actif
                              ? <ToggleRight className="size-4 text-success" />
                              : <ToggleLeft className="size-4" />
                            }
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditTarget(g)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface hover:text-ink transition-colors"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(g)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-error/10 hover:text-error transition-colors"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

// ─── GareForm ─────────────────────────────────────────────────────────────────

function GareForm({
  villes,
  initial,
  preselectedVilleId,
  onSubmit,
  onCancel,
  loading,
}: {
  villes: VilleRead[];
  initial?: { nom: string; ville_id: string; adresse: string; lat: string; lng: string };
  preselectedVilleId?: string;
  onSubmit: (d: { nom: string; ville_id: string; adresse?: string; lat?: number; lng?: number }) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [nom, setNom] = useState(initial?.nom ?? "");
  const [villeId, setVilleId] = useState(initial?.ville_id ?? preselectedVilleId ?? "");
  const [adresse, setAdresse] = useState(initial?.adresse ?? "");
  const [lat, setLat] = useState(initial?.lat ?? "");
  const [lng, setLng] = useState(initial?.lng ?? "");

  const valid = nom.trim().length >= 2 && !!villeId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit({
      nom: nom.trim(),
      ville_id: villeId,
      adresse: adresse.trim() || undefined,
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">Ville *</label>
          <select
            value={villeId}
            onChange={(e) => setVilleId(e.target.value)}
            required
            className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">Choisir une ville…</option>
            {villes.filter((v) => v.actif).map((v) => (
              <option key={v.id} value={v.id}>{v.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">Nom *</label>
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Ex : Gare routière nord"
            required
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-muted-foreground">Adresse</label>
        <input
          value={adresse}
          onChange={(e) => setAdresse(e.target.value)}
          placeholder="Ex : Carrefour Jonquet"
          className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">Latitude</label>
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="Ex : 6.3703"
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">Longitude</label>
          <input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="Ex : 2.3912"
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Annuler</Button>
        <Button type="submit" size="sm" loading={loading} disabled={!valid}>
          {initial ? "Enregistrer" : "Ajouter la gare"}
        </Button>
      </div>
    </form>
  );
}
