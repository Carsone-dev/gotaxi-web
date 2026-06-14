import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  X, ChevronRight, ChevronLeft, Check, Search,
  MapPin, Car, Users, Minus, Plus, Building2,
} from "lucide-react";
import { Button } from "@gotaxi/ui";
import { apiClient } from "@/lib/api";
import { adminApi } from "@/lib/api/admin";
import { getMediaUrl, getInitials, formatCurrency, formatDateTime } from "@/lib/format";
import { useCreateAdminVoyage, useAdminVilles, useAdminGares } from "@/hooks/useAdmin";
import type { UserRead, ChauffeurRead, VehiculeRead, VoyageCreate, GareRead } from "@/types/domain";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TarifRoute {
  prix_recommande: number;
  prix_max: number;
}

const VEHICLE_EMOJI: Record<string, string> = {
  BERLINE: "🚗", SUV: "🚙", MINIBUS: "🚐", BUS: "🚌", MOTO: "🏍️",
};

const STEPS = [
  { id: 1, label: "Chauffeur" },
  { id: 2, label: "Itinéraire" },
  { id: 3, label: "Date & Heure" },
  { id: 4, label: "Tarif & Places" },
  { id: 5, label: "Options" },
];

// ─── Wizard ───────────────────────────────────────────────────────────────────

export function CreateVoyageWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);

  // Step 1
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRead | null>(null);
  const [selectedChauffeur, setSelectedChauffeur] = useState<ChauffeurRead | null>(null);
  const [selectedVehicule, setSelectedVehicule] = useState<VehiculeRead | null>(null);

  // Step 2 — gares sélectionnées (la ville/point sont dérivés)
  const [gareDepartId, setGareDepartId] = useState("");
  const [gareArriveeId, setGareArriveeId] = useState("");

  // Step 3
  const [dateDepart, setDateDepart] = useState("");
  const [heureDepart, setHeureDepart] = useState("08:00");

  // Step 4
  const [prix, setPrix] = useState("");
  const [nbPlaces, setNbPlaces] = useState(3);
  const [prixError, setPrixError] = useState("");

  // Step 5
  const [accepteColis, setAccepteColis] = useState(true);
  const [climatise, setClimatise] = useState(false);
  const [nonFumeur, setNonFumeur] = useState(true);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const { data: users = [] } = useQuery({
    queryKey: ["admin", "users", { role: "CHAUFFEUR", size: 200 }],
    queryFn: () => adminApi.users({ role: "CHAUFFEUR", size: 200 }),
  });

  const { data: chauffeurs = [] } = useQuery({
    queryKey: ["admin", "chauffeurs", { size: 200 }],
    queryFn: () => adminApi.chauffeurs({ size: 200 }),
  });

  // ── Gares (chargées pour step 2) ──────────────────────────────────────────
  const { data: toutes_gares = [] } = useAdminGares();

  // Derived : gare sélectionnée → ville + point + coords
  const gareDepart = toutes_gares.find((g) => g.id === gareDepartId) ?? null;
  const gareArrivee = toutes_gares.find((g) => g.id === gareArriveeId) ?? null;
  const villeDepart = gareDepart?.ville.nom ?? "";
  const villeArrivee = gareArrivee?.ville.nom ?? "";
  const villeDepartId = gareDepart?.ville_id ?? "";
  const villeArriveeId = gareArrivee?.ville_id ?? "";

  const { data: tarif = null } = useQuery<TarifRoute | null>({
    queryKey: ["tarif", villeDepartId, villeArriveeId],
    queryFn: () =>
      apiClient
        .get("/tarifs", { params: { ville_depart_id: villeDepartId, ville_arrivee_id: villeArriveeId } })
        .then((r) => r.data),
    enabled: step >= 4 && !!villeDepartId && !!villeArriveeId,
    staleTime: 5 * 60_000,
  });

  const createVoyage = useCreateAdminVoyage();

  // ── Derived state ──────────────────────────────────────────────────────────

  const profileMap = useMemo(() => {
    const m = new Map<string, ChauffeurRead>();
    for (const c of chauffeurs) m.set(c.user_id, c);
    return m;
  }, [chauffeurs]);

  const chauffeurRows = useMemo(
    () =>
      users
        .map((u) => ({ user: u, profile: profileMap.get(u.id) ?? null }))
        .filter((r) => r.profile !== null),
    [users, profileMap],
  );

  const filteredChauffeurs = useMemo(() => {
    if (!search.trim()) return chauffeurRows;
    const q = search.toLowerCase();
    return chauffeurRows.filter(
      (r) =>
        r.user.nom.toLowerCase().includes(q) ||
        r.user.prenom.toLowerCase().includes(q) ||
        (r.user.telephone ?? "").includes(q),
    );
  }, [chauffeurRows, search]);

  const activeVehicules = selectedChauffeur?.vehicules.filter((v) => v.actif) ?? [];

  // ── Validation ─────────────────────────────────────────────────────────────

  const canNext = useMemo(() => {
    if (step === 1) return !!selectedVehicule;
    if (step === 2) return !!(gareDepartId && gareArriveeId && gareDepartId !== gareArriveeId);
    if (step === 3) return !!(dateDepart && heureDepart);
    if (step === 4) {
      const p = Number(prix);
      return p >= 500 && (!tarif || p <= tarif.prix_max);
    }
    return true;
  }, [step, selectedVehicule, gareDepartId, gareArriveeId, dateDepart, heureDepart, prix, tarif]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const selectChauffeur = (user: UserRead, profile: ChauffeurRead) => {
    setSelectedUser(user);
    setSelectedChauffeur(profile);
    setSelectedVehicule(null);
  };

  const handlePrixChange = (val: string) => {
    setPrix(val);
    const p = Number(val);
    if (!val) { setPrixError(""); return; }
    if (isNaN(p)) { setPrixError("Montant invalide"); return; }
    if (p < 500) { setPrixError("Prix minimum : 500 FCFA"); return; }
    if (tarif && p > tarif.prix_max) { setPrixError(`Prix max autorisé : ${formatCurrency(tarif.prix_max)}`); return; }
    setPrixError("");
  };

  const handleSubmit = () => {
    if (!selectedVehicule || !gareDepart || !gareArrivee || !dateDepart) return;
    const dateFull = `${dateDepart}T${heureDepart}:00`;
    createVoyage.mutate(
      {
        vehicule_id: selectedVehicule.id,
        ville_depart: gareDepart.ville.nom,
        ville_arrivee: gareArrivee.ville.nom,
        point_depart: gareDepart.nom,
        point_arrivee: gareArrivee.nom,
        lat_depart: gareDepart.lat ?? 0,
        lng_depart: gareDepart.lng ?? 0,
        lat_arrivee: gareArrivee.lat ?? 0,
        lng_arrivee: gareArrivee.lng ?? 0,
        date_depart: dateFull,
        prix_par_place: Number(prix),
        nombre_places_total: nbPlaces,
        accepte_colis: accepteColis,
        climatise,
        non_fumeur: nonFumeur,
      } as VoyageCreate,
      {
        onSuccess: () => { toast.success("Trajet créé avec succès"); onClose(); },
        onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Erreur lors de la création"),
      },
    );
  };

  const goNext = () => {
    if (step < STEPS.length) setStep(step + 1);
    else handleSubmit();
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
    else onClose();
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative flex h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-extrabold text-ink">Nouveau trajet</h2>
            <p className="text-xs text-muted-foreground">Étape {step} sur {STEPS.length}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-surface"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Step bar */}
        <div className="flex items-center gap-1 border-b border-border px-6 py-3">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={[
                "flex size-6 items-center justify-center rounded-full text-xs font-bold transition-all",
                step === s.id ? "bg-primary text-white" :
                step > s.id  ? "bg-success text-white" :
                               "bg-surface text-muted-foreground",
              ].join(" ")}>
                {step > s.id ? <Check className="size-3" /> : s.id}
              </div>
              <span className={[
                "ml-1.5 hidden text-xs font-medium sm:block",
                step === s.id ? "text-primary" :
                step > s.id  ? "text-success"  :
                               "text-muted-foreground",
              ].join(" ")}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={[
                  "mx-2 h-px w-4 sm:w-8",
                  step > s.id ? "bg-success" : "bg-border",
                ].join(" ")} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto">
          {step === 1 && (
            <StepChauffeur
              search={search}
              onSearch={setSearch}
              chauffeurs={filteredChauffeurs}
              selectedUser={selectedUser}
              selectedChauffeur={selectedChauffeur}
              selectedVehicule={selectedVehicule}
              activeVehicules={activeVehicules}
              onSelectChauffeur={selectChauffeur}
              onSelectVehicule={setSelectedVehicule}
            />
          )}
          {step === 2 && (
            <StepItineraire
              gares={toutes_gares}
              gareDepartId={gareDepartId}
              gareArriveeId={gareArriveeId}
              onGareDepart={setGareDepartId}
              onGareArrivee={setGareArriveeId}
            />
          )}
          {step === 3 && (
            <StepDateTime
              dateDepart={dateDepart}
              heureDepart={heureDepart}
              onDate={setDateDepart}
              onHeure={setHeureDepart}
            />
          )}
          {step === 4 && (
            <StepTarif
              prix={prix}
              prixError={prixError}
              nbPlaces={nbPlaces}
              tarif={tarif}
              onPrix={handlePrixChange}
              onNbPlaces={setNbPlaces}
            />
          )}
          {step === 5 && (
            <StepOptions
              accepteColis={accepteColis}
              climatise={climatise}
              nonFumeur={nonFumeur}
              onAccepteColis={setAccepteColis}
              onClimatise={setClimatise}
              onNonFumeur={setNonFumeur}
              summary={{
                chauffeur: selectedUser ? `${selectedUser.prenom} ${selectedUser.nom}` : "",
                vehicule: selectedVehicule ? `${selectedVehicule.marque} ${selectedVehicule.modele} — ${selectedVehicule.immatriculation}` : "",
                trajet: villeDepart && villeArrivee ? `${villeDepart} → ${villeArrivee}` : "",
                gareDepart: gareDepart?.nom ?? "",
                gareArrivee: gareArrivee?.nom ?? "",
                date: dateDepart && heureDepart ? formatDateTime(`${dateDepart}T${heureDepart}:00`) : "",
                prix: formatCurrency(Number(prix)),
                places: nbPlaces,
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <Button variant="outline" onClick={goBack}>
            {step === 1 ? (
              "Annuler"
            ) : (
              <><ChevronLeft className="size-4" /> Précédent</>
            )}
          </Button>
          <Button onClick={goNext} disabled={!canNext} loading={createVoyage.isPending}>
            {step === STEPS.length ? (
              "Créer le trajet"
            ) : (
              <>Suivant <ChevronRight className="size-4" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 1 : Chauffeur & Véhicule ────────────────────────────────────────────

function StepChauffeur({
  search, onSearch,
  chauffeurs, selectedUser, selectedChauffeur, selectedVehicule, activeVehicules,
  onSelectChauffeur, onSelectVehicule,
}: {
  search: string;
  onSearch: (v: string) => void;
  chauffeurs: { user: UserRead; profile: ChauffeurRead | null }[];
  selectedUser: UserRead | null;
  selectedChauffeur: ChauffeurRead | null;
  selectedVehicule: VehiculeRead | null;
  activeVehicules: VehiculeRead[];
  onSelectChauffeur: (u: UserRead, c: ChauffeurRead) => void;
  onSelectVehicule: (v: VehiculeRead) => void;
}) {
  return (
    <div className="p-6 space-y-5">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Rechercher un chauffeur…"
          className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-4 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {/* Chauffeur list */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sélectionner un chauffeur
        </p>
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {chauffeurs.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">Aucun chauffeur trouvé</p>
          )}
          {chauffeurs.map(({ user, profile }) => {
            const isSelected = selectedUser?.id === user.id;
            const photo = getMediaUrl(user.photo_url);
            return (
              <button
                key={user.id}
                onClick={() => onSelectChauffeur(user, profile!)}
                className={[
                  "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border bg-white hover:border-primary/40 hover:bg-surface",
                ].join(" ")}
              >
                {/* Avatar */}
                <div className="relative size-10 shrink-0">
                  {photo ? (
                    <img src={photo} alt="" className="size-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {getInitials(user.nom, user.prenom)}
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-white">
                      <Check className="size-2.5" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={["text-sm font-semibold truncate", isSelected ? "text-primary" : "text-ink"].join(" ")}>
                    {user.prenom} {user.nom}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.telephone}</p>
                </div>

                {/* KYC badge */}
                <span className={[
                  "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
                  profile?.kyc_valide
                    ? "bg-success/10 text-success"
                    : "bg-warning/10 text-warning",
                ].join(" ")}>
                  {profile?.kyc_valide ? "✓ KYC" : "En attente"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Vehicle selection */}
      {selectedChauffeur && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Véhicule de {selectedUser?.prenom}
          </p>
          {activeVehicules.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border py-4 text-center text-sm text-muted-foreground">
              Aucun véhicule actif
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {activeVehicules.map((v) => {
                const isSelected = selectedVehicule?.id === v.id;
                const photo = getMediaUrl(v.photo_url);
                return (
                  <button
                    key={v.id}
                    onClick={() => onSelectVehicule(v)}
                    className={[
                      "relative overflow-hidden rounded-xl border text-left transition-all",
                      isSelected
                        ? "border-primary ring-1 ring-primary"
                        : "border-border hover:border-primary/40",
                    ].join(" ")}
                  >
                    {/* Photo banner */}
                    <div className="relative h-24 bg-surface">
                      {photo ? (
                        <img src={photo} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl">
                          {VEHICLE_EMOJI[v.type_vehicule] ?? "🚗"}
                        </div>
                      )}
                      {/* Plate overlay */}
                      <div className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-0.5 text-xs font-bold text-white">
                        {v.immatriculation}
                      </div>
                      {/* Selected check */}
                      {isSelected && (
                        <div className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-primary text-white shadow">
                          <Check className="size-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-2.5">
                      <p className={["text-sm font-bold truncate", isSelected ? "text-primary" : "text-ink"].join(" ")}>
                        {v.marque} {v.modele}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted-foreground">{v.annee}</span>
                        <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted-foreground">
                          <Users className="inline size-3 mr-0.5" />{v.nombre_places}
                        </span>
                        {v.climatise && (
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">Clim</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Step 2 : Itinéraire (sélecteurs de gares) ───────────────────────────────

const RAIL_W = 28;

function GareSelector({
  label, color, gares, selectedId, excludeId, onChange,
}: {
  label: string; color: "success" | "error";
  gares: GareRead[]; selectedId: string; excludeId: string;
  onChange: (id: string) => void;
}) {
  const selectedGare = gares.find((g) => g.id === selectedId);

  // Gares regroupées par ville
  const grouped = useMemo(() => {
    const map = new Map<string, GareRead[]>();
    for (const g of gares) {
      if (g.id === excludeId) continue;
      const list = map.get(g.ville.nom) ?? [];
      list.push(g);
      map.set(g.ville.nom, list);
    }
    return map;
  }, [gares, excludeId]);

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center" style={{ width: RAIL_W }}>
        <div className={[
          "flex size-7 items-center justify-center rounded-full border-2 bg-white",
          color === "success" ? "border-success" : "border-error",
        ].join(" ")}>
          <div className={[
            "size-3 rounded-full",
            color === "success" ? "bg-success" : "bg-error",
          ].join(" ")} />
        </div>
      </div>
      <div className="flex-1 space-y-2">
        <p className="text-2xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>

        {/* Sélecteur groupé par ville */}
        <select
          value={selectedId}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-semibold text-ink focus:border-primary focus:outline-none"
        >
          <option value="">Choisir une gare…</option>
          {Array.from(grouped.entries()).map(([villeNom, gareList]) => (
            <optgroup key={villeNom} label={villeNom}>
              {gareList.map((g) => (
                <option key={g.id} value={g.id}>{g.nom}</option>
              ))}
            </optgroup>
          ))}
        </select>

        {/* Aperçu gare sélectionnée */}
        {selectedGare && (
          <div className={[
            "flex items-center gap-2 rounded-xl border px-3 py-2",
            color === "success" ? "border-success/30 bg-success/5" : "border-error/30 bg-error/5",
          ].join(" ")}>
            <Building2 className={["size-4 shrink-0", color === "success" ? "text-success" : "text-error"].join(" ")} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">{selectedGare.nom}</p>
              <p className="text-xs text-muted-foreground">{selectedGare.ville.nom}</p>
            </div>
          </div>
        )}

        {gares.filter((g) => g.id !== excludeId).length === 0 && (
          <p className="rounded-xl border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
            Aucune gare disponible — créez d'abord des gares dans la section Gares.
          </p>
        )}
      </div>
    </div>
  );
}

function StepItineraire({
  gares, gareDepartId, gareArriveeId, onGareDepart, onGareArrivee,
}: {
  gares: GareRead[];
  gareDepartId: string; gareArriveeId: string;
  onGareDepart: (id: string) => void; onGareArrivee: (id: string) => void;
}) {
  return (
    <div className="p-6 space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Itinéraire du trajet
      </p>

      <GareSelector
        label="Gare de départ"
        color="success"
        gares={gares}
        selectedId={gareDepartId}
        excludeId={gareArriveeId}
        onChange={onGareDepart}
      />

      {/* Rail séparateur */}
      <div className="flex gap-3 items-center">
        <div className="flex justify-center" style={{ width: RAIL_W }}>
          <div className="flex size-6 items-center justify-center rounded-full border border-border bg-surface">
            <Car className="size-3 text-muted-foreground" />
          </div>
        </div>
        <div className="flex-1 h-px bg-border" />
      </div>

      <GareSelector
        label="Gare d'arrivée"
        color="error"
        gares={gares}
        selectedId={gareArriveeId}
        excludeId={gareDepartId}
        onChange={onGareArrivee}
      />

      {gareDepartId && gareArriveeId && gareDepartId === gareArriveeId && (
        <p className="rounded-xl bg-error/10 px-4 py-2 text-sm text-error">
          La gare de départ et d'arrivée doivent être différentes.
        </p>
      )}
    </div>
  );
}

// ─── Step 3 : Date & Heure ────────────────────────────────────────────────────

function StepDateTime({
  dateDepart, heureDepart, onDate, onHeure,
}: {
  dateDepart: string; heureDepart: string;
  onDate: (v: string) => void; onHeure: (v: string) => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const preview = dateDepart && heureDepart ? formatDateTime(`${dateDepart}T${heureDepart}:00`) : null;

  return (
    <div className="p-6 space-y-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Date et heure de départ
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Date</label>
          <input
            type="date"
            value={dateDepart}
            min={today}
            onChange={(e) => onDate(e.target.value)}
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm font-semibold text-ink focus:border-primary focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Heure</label>
          <input
            type="time"
            value={heureDepart}
            onChange={(e) => onHeure(e.target.value)}
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm font-semibold text-ink focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {preview && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-xs text-muted-foreground mb-1">Départ prévu le</p>
          <p className="text-lg font-extrabold text-primary">{preview}</p>
        </div>
      )}
    </div>
  );
}

// ─── Step 4 : Tarif & Places ──────────────────────────────────────────────────

function StepTarif({
  prix, prixError, nbPlaces, tarif, onPrix, onNbPlaces,
}: {
  prix: string; prixError: string; nbPlaces: number;
  tarif: TarifRoute | null;
  onPrix: (v: string) => void; onNbPlaces: (n: number) => void;
}) {
  return (
    <div className="p-6 space-y-6">
      {/* Admin tarif card */}
      {tarif && (
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Tarifs administrateur
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-primary/5 p-3">
              <p className="text-xs text-muted-foreground">Recommandé</p>
              <p className="text-base font-extrabold text-primary">{formatCurrency(tarif.prix_recommande)}</p>
            </div>
            <div className="rounded-xl bg-warning/10 p-3">
              <p className="text-xs text-muted-foreground">Maximum</p>
              <p className="text-base font-extrabold text-warning">{formatCurrency(tarif.prix_max)}</p>
            </div>
          </div>
          {/* Quick-select */}
          <div className="flex gap-2">
            <button
              onClick={() => onPrix(String(Math.round(tarif.prix_recommande * 0.9)))}
              className="flex-1 rounded-xl border border-border py-1.5 text-xs font-semibold hover:bg-white transition-colors"
            >
              −10%
            </button>
            <button
              onClick={() => onPrix(String(tarif.prix_recommande))}
              className="flex-1 rounded-xl border border-primary bg-primary/5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              Recommandé
            </button>
            <button
              onClick={() => onPrix(String(tarif.prix_max))}
              className="flex-1 rounded-xl border border-warning bg-warning/5 py-1.5 text-xs font-semibold text-warning transition-colors hover:bg-warning/10"
            >
              Maximum
            </button>
          </div>
        </div>
      )}

      {/* Price input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground">Prix par place (FCFA)</label>
        <div className="relative">
          <input
            type="number"
            value={prix}
            onChange={(e) => onPrix(e.target.value)}
            placeholder="Ex : 3000"
            min={500}
            className={[
              "w-full rounded-xl border px-3 py-2.5 text-sm font-semibold focus:outline-none",
              prixError ? "border-error focus:border-error" : "border-border focus:border-primary",
            ].join(" ")}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">FCFA</span>
        </div>
        {prixError && <p className="text-xs text-error">{prixError}</p>}
        {!prixError && prix && Number(prix) >= 500 && (
          <p className="text-xs text-success">✓ Prix valide</p>
        )}
      </div>

      {/* Nombre de places */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground">Nombre de places</label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNbPlaces(Math.max(1, nbPlaces - 1))}
            disabled={nbPlaces <= 1}
            className="flex size-10 items-center justify-center rounded-xl border border-border bg-white transition-colors hover:bg-surface disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>
          <div className="flex-1 rounded-xl border border-primary bg-primary/5 py-2.5 text-center">
            <span className="text-2xl font-extrabold text-primary">{nbPlaces}</span>
            <span className="ml-1.5 text-sm text-muted-foreground">place{nbPlaces > 1 ? "s" : ""}</span>
          </div>
          <button
            onClick={() => onNbPlaces(Math.min(8, nbPlaces + 1))}
            disabled={nbPlaces >= 8}
            className="flex size-10 items-center justify-center rounded-xl border border-border bg-white transition-colors hover:bg-surface disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      {prix && Number(prix) >= 500 && !prixError && (
        <div className="rounded-xl bg-surface p-3 text-center">
          <p className="text-xs text-muted-foreground">Revenu total si complet</p>
          <p className="text-lg font-extrabold text-ink">{formatCurrency(Number(prix) * nbPlaces)}</p>
        </div>
      )}
    </div>
  );
}

// ─── Step 5 : Options & Récap ─────────────────────────────────────────────────

function ToggleOption({
  label, description, value, onChange,
}: {
  label: string; description: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={[
        "flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all",
        value ? "border-primary bg-primary/5" : "border-border bg-white hover:bg-surface",
      ].join(" ")}
    >
      <div>
        <p className={["text-sm font-semibold", value ? "text-primary" : "text-ink"].join(" ")}>{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className={[
        "relative flex size-12 items-center justify-center rounded-full text-xl",
        value ? "bg-primary/10" : "bg-surface",
      ].join(" ")}>
        {value && <Check className="absolute -right-1 -top-1 size-4 rounded-full bg-primary p-0.5 text-white" />}
        {label === "Climatisé" ? "❄️" : label === "Non-fumeur" ? "🚭" : "📦"}
      </div>
    </button>
  );
}

function StepOptions({
  accepteColis, climatise, nonFumeur,
  onAccepteColis, onClimatise, onNonFumeur,
  summary,
}: {
  accepteColis: boolean; climatise: boolean; nonFumeur: boolean;
  onAccepteColis: (v: boolean) => void; onClimatise: (v: boolean) => void; onNonFumeur: (v: boolean) => void;
  summary: {
    chauffeur: string; vehicule: string; trajet: string;
    gareDepart: string; gareArrivee: string; date: string;
    prix: string; places: number;
  };
}) {
  return (
    <div className="p-6 space-y-5">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Options du trajet</p>
        <ToggleOption label="Accepte colis" description="Le chauffeur peut transporter des colis" value={accepteColis} onChange={onAccepteColis} />
        <ToggleOption label="Climatisé" description="Le véhicule dispose de la climatisation" value={climatise} onChange={onClimatise} />
        <ToggleOption label="Non-fumeur" description="Il est interdit de fumer dans le véhicule" value={nonFumeur} onChange={onNonFumeur} />
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Récapitulatif</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <SummaryRow label="Chauffeur" value={summary.chauffeur} />
          <SummaryRow label="Véhicule" value={summary.vehicule} />
          <SummaryRow label="Trajet" value={summary.trajet} className="col-span-2" />
          <SummaryRow label="Gare départ" value={summary.gareDepart} />
          <SummaryRow label="Gare arrivée" value={summary.gareArrivee} />
          <SummaryRow label="Départ" value={summary.date} className="col-span-2" />
          <SummaryRow label="Prix/place" value={summary.prix} />
          <SummaryRow label="Places" value={`${summary.places} place${summary.places > 1 ? "s" : ""}`} />
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold text-ink truncate">{value || "—"}</p>
    </div>
  );
}
