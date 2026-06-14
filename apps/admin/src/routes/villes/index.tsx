import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, MapPin, ToggleLeft, ToggleRight,
  Building2, ChevronDown, ChevronRight, Search, X,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Spinner } from "@gotaxi/ui";
import {
  useAdminVilles, useCreateVille, useUpdateVille, useDeleteVille,
  useAdminGares, useCreateGare, useUpdateGare, useDeleteGare,
} from "@/hooks/useAdmin";
import type { VilleRead, GareRead } from "@/types/domain";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VillesPage() {
  const { data: villes = [], isLoading: loadingVilles } = useAdminVilles();
  const { data: gares = [], isLoading: loadingGares } = useAdminGares();

  const createVille = useCreateVille();
  const updateVille = useUpdateVille();
  const deleteVille = useDeleteVille();
  const createGare = useCreateGare();
  const updateGare = useUpdateGare();
  const deleteGare = useDeleteGare();

  const [search, setSearch] = useState("");
  const [expandedVilles, setExpandedVilles] = useState<Set<string>>(new Set());
  const [showCreateVille, setShowCreateVille] = useState(false);
  const [editVille, setEditVille] = useState<VilleRead | null>(null);
  const [addGareForVille, setAddGareForVille] = useState<string | null>(null);
  const [editGare, setEditGare] = useState<GareRead | null>(null);

  // gares grouped by ville_id
  const garesParVille = useMemo(() => {
    const map = new Map<string, GareRead[]>();
    for (const g of gares) {
      const list = map.get(g.ville_id) ?? [];
      list.push(g);
      map.set(g.ville_id, list);
    }
    return map;
  }, [gares]);

  const filtered = useMemo(() => {
    if (!search.trim()) return villes;
    const q = search.toLowerCase();
    return villes.filter((v) => v.nom.toLowerCase().includes(q));
  }, [villes, search]);

  const stats = useMemo(() => ({
    villes: villes.length,
    villesActives: villes.filter((v) => v.actif).length,
    gares: gares.length,
    garesActives: gares.filter((g) => g.actif).length,
  }), [villes, gares]);

  function toggleExpand(id: string) {
    setExpandedVilles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ── Villes handlers ──────────────────────────────────────────────────────────

  async function handleCreateVille(nom: string) {
    try {
      await createVille.mutateAsync({ nom });
      toast.success("Ville ajoutée");
      setShowCreateVille(false);
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail ?? "Erreur");
    }
  }

  async function handleUpdateVille(id: string, nom: string) {
    try {
      await updateVille.mutateAsync({ id, nom });
      toast.success("Ville renommée");
      setEditVille(null);
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail ?? "Erreur");
    }
  }

  async function handleToggleVille(v: VilleRead) {
    try {
      await updateVille.mutateAsync({ id: v.id, actif: !v.actif });
    } catch {
      toast.error("Erreur");
    }
  }

  async function handleDeleteVille(v: VilleRead) {
    const count = garesParVille.get(v.id)?.length ?? 0;
    const msg = count > 0
      ? `Supprimer "${v.nom}" et ses ${count} gare${count > 1 ? "s" : ""} ?`
      : `Supprimer "${v.nom}" ?`;
    if (!confirm(msg)) return;
    try {
      await deleteVille.mutateAsync(v.id);
      toast.success("Ville supprimée");
    } catch {
      toast.error("Erreur");
    }
  }

  // ── Gares handlers ───────────────────────────────────────────────────────────

  async function handleCreateGare(
    villeId: string,
    d: { nom: string; adresse?: string; lat?: number; lng?: number },
  ) {
    try {
      await createGare.mutateAsync({ ville_id: villeId, ...d });
      toast.success("Gare ajoutée");
      setAddGareForVille(null);
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail ?? "Erreur");
    }
  }

  async function handleUpdateGare(
    id: string,
    d: { nom?: string; adresse?: string; lat?: number; lng?: number },
  ) {
    try {
      await updateGare.mutateAsync({ id, ...d });
      toast.success("Gare mise à jour");
      setEditGare(null);
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail ?? "Erreur");
    }
  }

  async function handleToggleGare(g: GareRead) {
    try {
      await updateGare.mutateAsync({ id: g.id, actif: !g.actif });
    } catch {
      toast.error("Erreur");
    }
  }

  async function handleDeleteGare(g: GareRead) {
    if (!confirm(`Supprimer la gare "${g.nom}" ?`)) return;
    try {
      await deleteGare.mutateAsync(g.id);
      toast.success("Gare supprimée");
    } catch {
      toast.error("Erreur");
    }
  }

  const isLoading = loadingVilles || loadingGares;

  return (
    <>
      <PageHeader
        title="Localisation"
        subtitle="Villes et gares du réseau"
        actions={
          !showCreateVille && (
            <Button
              size="sm"
              leftIcon={<Plus className="size-4" />}
              onClick={() => setShowCreateVille(true)}
            >
              Nouvelle ville
            </Button>
          )
        }
      />

      {/* Stats */}
      <div className="mt-5 grid grid-cols-4 gap-3">
        {[
          { label: "Villes", value: stats.villes, sub: `${stats.villesActives} actives`, icon: <MapPin className="size-5 text-primary" />, bg: "bg-primary/10" },
          { label: "Gares", value: stats.gares, sub: `${stats.garesActives} actives`, icon: <Building2 className="size-5 text-accent-blue" />, bg: "bg-accent-blue/10" },
          { label: "Villes inactives", value: stats.villes - stats.villesActives, sub: "désactivées", icon: <MapPin className="size-5 text-muted-foreground" />, bg: "bg-surface" },
          { label: "Gares inactives", value: stats.gares - stats.garesActives, sub: "désactivées", icon: <Building2 className="size-5 text-muted-foreground" />, bg: "bg-surface" },
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

      {/* Formulaire nouvelle ville */}
      {showCreateVille && (
        <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <p className="mb-3 text-sm font-bold text-primary">Nouvelle ville</p>
          <NomForm
            placeholder="Ex : Cotonou"
            onSubmit={handleCreateVille}
            onCancel={() => setShowCreateVille(false)}
            loading={createVille.isPending}
          />
        </div>
      )}

      {/* Recherche */}
      <div className="mt-5 relative">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher une ville…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-9 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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

      {/* Liste accordéon */}
      <div className="mt-3 space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-12 text-center">
            <MapPin className="mx-auto mb-3 size-8 text-muted" />
            <p className="font-semibold text-ink">{search ? "Aucune ville trouvée" : "Aucune ville"}</p>
          </div>
        ) : (
          filtered.map((v) => {
            const gareListe = garesParVille.get(v.id) ?? [];
            const isOpen = expandedVilles.has(v.id);

            return (
              <div
                key={v.id}
                className={`rounded-2xl border transition-all ${
                  v.actif ? "border-border bg-white" : "border-border bg-surface/60 opacity-75"
                }`}
              >
                {/* ── Header ville ── */}
                {editVille?.id === v.id ? (
                  <div className="p-4">
                    <NomForm
                      initial={v.nom}
                      placeholder="Nom de la ville"
                      onSubmit={(nom) => handleUpdateVille(v.id, nom)}
                      onCancel={() => setEditVille(null)}
                      loading={updateVille.isPending}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    {/* Expand toggle */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(v.id)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                        v.actif ? "bg-primary/10 text-primary" : "bg-surface text-muted-foreground"
                      }`}>
                        {v.nom.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-ink truncate">{v.nom}</p>
                        <p className="text-xs text-muted-foreground">
                          {gareListe.length} gare{gareListe.length !== 1 ? "s" : ""}
                          {gareListe.length > 0 && ` · ${gareListe.filter((g) => g.actif).length} active${gareListe.filter((g) => g.actif).length !== 1 ? "s" : ""}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          v.actif ? "bg-success/10 text-success" : "bg-surface text-muted-foreground"
                        }`}>
                          {v.actif ? "Active" : "Inactive"}
                        </span>
                        {isOpen
                          ? <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                          : <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                        }
                      </div>
                    </button>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        title={v.actif ? "Désactiver" : "Activer"}
                        onClick={() => handleToggleVille(v)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-surface hover:text-ink transition-colors"
                      >
                        {v.actif
                          ? <ToggleRight className="size-4 text-success" />
                          : <ToggleLeft className="size-4" />
                        }
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditVille(v)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-surface hover:text-ink transition-colors"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteVille(v)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-error/10 hover:text-error transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Gares (accordéon) ── */}
                {isOpen && (
                  <div className="border-t border-border px-4 pb-4 pt-3">
                    {/* Liste gares */}
                    {gareListe.length > 0 && (
                      <div className="mb-3 space-y-1.5">
                        {gareListe.map((g) => (
                          <div key={g.id}>
                            {editGare?.id === g.id ? (
                              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                                <GareInlineForm
                                  initial={g}
                                  onSubmit={(d) => handleUpdateGare(g.id, d)}
                                  onCancel={() => setEditGare(null)}
                                  loading={updateGare.isPending}
                                />
                              </div>
                            ) : (
                              <div className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-all ${
                                g.actif ? "border-border bg-white/60" : "border-border/50 bg-surface opacity-60"
                              }`}>
                                <Building2 className={`size-3.5 shrink-0 ${g.actif ? "text-accent-blue" : "text-muted-foreground"}`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-ink truncate">{g.nom}</p>
                                  {g.adresse && (
                                    <p className="text-xs text-muted-foreground truncate">{g.adresse}</p>
                                  )}
                                  {g.lat != null && g.lng != null && (
                                    <p className="text-xs text-muted-foreground font-mono">
                                      {g.lat.toFixed(4)}, {g.lng.toFixed(4)}
                                    </p>
                                  )}
                                </div>
                                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  g.actif ? "bg-success/10 text-success" : "bg-surface text-muted-foreground"
                                }`}>
                                  {g.actif ? "Active" : "Inactive"}
                                </span>
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleGare(g)}
                                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface hover:text-ink transition-colors"
                                  >
                                    {g.actif
                                      ? <ToggleRight className="size-3.5 text-success" />
                                      : <ToggleLeft className="size-3.5" />
                                    }
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditGare(g)}
                                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface hover:text-ink transition-colors"
                                  >
                                    <Pencil className="size-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteGare(g)}
                                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-error/10 hover:text-error transition-colors"
                                  >
                                    <Trash2 className="size-3" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Form ajout gare */}
                    {addGareForVille === v.id ? (
                      <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                        <p className="mb-2.5 text-xs font-bold text-primary">Nouvelle gare — {v.nom}</p>
                        <GareInlineForm
                          onSubmit={(d) => handleCreateGare(v.id, d)}
                          onCancel={() => setAddGareForVille(null)}
                          loading={createGare.isPending}
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setAddGareForVille(v.id); setEditGare(null); }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2 text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                      >
                        <Plus className="size-3.5" />
                        Ajouter une gare
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

// ─── NomForm (ville) ──────────────────────────────────────────────────────────

function NomForm({
  initial,
  placeholder,
  onSubmit,
  onCancel,
  loading,
}: {
  initial?: string;
  placeholder: string;
  onSubmit: (nom: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [nom, setNom] = useState(initial ?? "");
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (nom.trim().length >= 2) onSubmit(nom.trim()); }}
      className="flex items-end gap-3"
    >
      <div className="flex-1">
        <input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder={placeholder}
          minLength={2}
          required
          autoFocus
          className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <Button type="submit" size="sm" loading={loading} disabled={nom.trim().length < 2}>
        {initial ? "Enregistrer" : "Ajouter"}
      </Button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl border border-border px-3 py-2 text-sm font-semibold hover:bg-surface transition-colors"
      >
        Annuler
      </button>
    </form>
  );
}

// ─── GareInlineForm ───────────────────────────────────────────────────────────

function GareInlineForm({
  initial,
  onSubmit,
  onCancel,
  loading,
}: {
  initial?: GareRead;
  onSubmit: (d: { nom: string; adresse?: string; lat?: number; lng?: number }) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [nom, setNom] = useState(initial?.nom ?? "");
  const [adresse, setAdresse] = useState(initial?.adresse ?? "");
  const [lat, setLat] = useState(initial?.lat?.toString() ?? "");
  const [lng, setLng] = useState(initial?.lng?.toString() ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nom.trim().length < 2) return;
    onSubmit({
      nom: nom.trim(),
      adresse: adresse.trim() || undefined,
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        value={nom}
        onChange={(e) => setNom(e.target.value)}
        placeholder="Nom de la gare *"
        required
        autoFocus
        className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <input
        value={adresse}
        onChange={(e) => setAdresse(e.target.value)}
        placeholder="Adresse (optionnel)"
        className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          step="any"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          placeholder="Latitude"
          className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <input
          type="number"
          step="any"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          placeholder="Longitude"
          className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-surface transition-colors"
        >
          Annuler
        </button>
        <Button type="submit" size="sm" loading={loading} disabled={nom.trim().length < 2}>
          {initial ? "Enregistrer" : "Ajouter"}
        </Button>
      </div>
    </form>
  );
}
