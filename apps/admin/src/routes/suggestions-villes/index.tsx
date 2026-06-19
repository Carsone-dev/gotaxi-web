import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { MapPin, CheckCircle, Clock, Filter, Pencil, Check, X } from "lucide-react";
import { useAdminSuggestionVilles, useUpdateSuggestionVille } from "@/hooks/useAdmin";
import type { SuggestionVille } from "@/types/domain";
import { formatDate } from "@/lib/format";

// ── Filtres ───────────────────────────────────────────────────────────────────

const FILTRES = [
  { label: "Toutes",       value: undefined    },
  { label: "À traiter",   value: false        },
  { label: "Traitées",    value: true         },
] as const;

// ── Modal notes ────────────────────────────────────────────────────────────────

function NotesModal({
  suggestion,
  onClose,
}: {
  suggestion: SuggestionVille;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState(suggestion.notes_admin ?? "");
  const [marquerTraitee, setMarquerTraitee] = useState(suggestion.traitee);
  const update = useUpdateSuggestionVille();

  const handleSave = async () => {
    await update.mutateAsync({
      id: suggestion.id,
      traitee: marquerTraitee,
      notes_admin: notes.trim() || null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* En-tête */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-extrabold text-ink">
              « {suggestion.nom_demande} »
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {suggestion.nb_demandes} demande{suggestion.nb_demandes > 1 ? "s" : ""} ·{" "}
              Reçue le {formatDate(suggestion.created_at)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-surface text-muted-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Notes */}
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
          Notes admin
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex : ville ajoutée au référentiel, ou refusée car hors zone..."
          rows={4}
          className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none
                     focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none mb-4"
        />

        {/* Toggle traitement */}
        <label className="flex items-center gap-3 cursor-pointer mb-5 select-none">
          <div
            onClick={() => setMarquerTraitee((v) => !v)}
            className={`relative h-5 w-9 rounded-full transition-colors ${
              marquerTraitee ? "bg-primary" : "bg-border"
            }`}
          >
            <div
              className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform ${
                marquerTraitee ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </div>
          <span className="text-sm font-medium text-ink">
            Marquer comme traitée
          </span>
        </label>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold
                       text-muted-foreground hover:bg-surface transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={update.isPending}
            className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white
                       hover:bg-primary/90 disabled:opacity-60 transition-colors flex items-center
                       justify-center gap-2"
          >
            {update.isPending ? (
              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Check className="size-4" />
            )}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────

export default function SuggestionsVillesPage() {
  const [filtre, setFiltre] = useState<boolean | undefined>(false); // par défaut : À traiter
  const [editTarget, setEditTarget] = useState<SuggestionVille | null>(null);
  const update = useUpdateSuggestionVille();

  const { data: suggestions = [], isLoading } = useAdminSuggestionVilles(
    filtre !== undefined ? { traitee: filtre } : undefined
  );

  const nbNonTraitees = suggestions.filter((s) => !s.traitee).length;

  const handleQuickTraiter = async (s: SuggestionVille) => {
    await update.mutateAsync({ id: s.id, traitee: true });
  };

  return (
    <>
      <Helmet><title>Suggestions de villes — GoTaxi Admin</title></Helmet>

      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-ink flex items-center gap-2">
              <MapPin className="size-6 text-primary" />
              Suggestions de villes
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Villes demandées par les utilisateurs et non trouvées dans le référentiel
            </p>
          </div>

          {/* Badge urgence */}
          {filtre !== false && nbNonTraitees > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200
                            px-4 py-2.5">
              <Clock className="size-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-700">
                {nbNonTraitees} en attente
              </span>
            </div>
          )}
        </div>

        {/* ── Filtres ── */}
        <div className="flex items-center gap-3">
          <Filter className="size-4 text-muted-foreground" />
          <div className="flex gap-1 rounded-xl border border-border bg-white p-1">
            {FILTRES.map((f) => (
              <button
                key={String(f.value)}
                onClick={() => setFiltre(f.value)}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
                  filtre === f.value
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-surface"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {!isLoading && (
            <span className="text-xs text-muted-foreground">
              {suggestions.length} résultat{suggestions.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* ── Table ── */}
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">Chargement...</div>
          ) : suggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 gap-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-surface">
                <MapPin className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {filtre === false
                  ? "Aucune suggestion en attente — tout est traité ✓"
                  : "Aucune suggestion trouvée"}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-xs font-bold
                               text-muted-foreground uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Ville demandée</th>
                  <th className="px-5 py-3 text-center">Nb demandes</th>
                  <th className="px-5 py-3 text-left">Première demande</th>
                  <th className="px-5 py-3 text-left">Notes</th>
                  <th className="px-5 py-3 text-center">Statut</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {suggestions.map((s) => (
                  <tr
                    key={s.id}
                    className={`transition-colors hover:bg-surface/60 ${
                      s.traitee ? "opacity-60" : ""
                    }`}
                  >
                    {/* Nom */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`size-2 rounded-full ${
                          s.traitee ? "bg-emerald-400" : "bg-amber-400"
                        }`} />
                        <span className="font-semibold text-ink">{s.nom_demande}</span>
                      </div>
                    </td>

                    {/* Nb demandes — badge coloré selon popularité */}
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center justify-center rounded-full
                        min-w-[2rem] px-2 py-0.5 text-xs font-bold ${
                        s.nb_demandes >= 5
                          ? "bg-red-100 text-red-700"
                          : s.nb_demandes >= 3
                          ? "bg-amber-100 text-amber-700"
                          : "bg-surface text-muted-foreground"
                      }`}>
                        {s.nb_demandes}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {formatDate(s.created_at)}
                    </td>

                    {/* Notes */}
                    <td className="px-5 py-3 max-w-[220px]">
                      {s.notes_admin ? (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {s.notes_admin}
                        </p>
                      ) : (
                        <span className="text-xs text-border italic">—</span>
                      )}
                    </td>

                    {/* Statut */}
                    <td className="px-5 py-3 text-center">
                      {s.traitee ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100
                                         px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                          <CheckCircle className="size-3" /> Traitée
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100
                                         px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                          <Clock className="size-3" /> En attente
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {/* Bouton notes/modifier */}
                        <button
                          onClick={() => setEditTarget(s)}
                          className="flex items-center gap-1.5 rounded-lg border border-border
                                     px-2.5 py-1.5 text-xs font-semibold text-muted-foreground
                                     hover:bg-surface transition-colors"
                          title="Ajouter des notes"
                        >
                          <Pencil className="size-3" />
                          Notes
                        </button>

                        {/* Marquer traité rapidement */}
                        {!s.traitee && (
                          <button
                            onClick={() => handleQuickTraiter(s)}
                            disabled={update.isPending}
                            className="flex items-center gap-1.5 rounded-lg bg-primary
                                       px-2.5 py-1.5 text-xs font-semibold text-white
                                       hover:bg-primary/90 disabled:opacity-60 transition-colors"
                            title="Marquer comme traitée"
                          >
                            <Check className="size-3" />
                            Traiter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal d'édition des notes */}
      {editTarget && (
        <NotesModal
          suggestion={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
    </>
  );
}
