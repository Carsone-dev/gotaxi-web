// ─── Enums ─────────────────────────────────────────────────────────────────

export type UserRole = "CLIENT" | "CHAUFFEUR" | "ADMIN" | "SUPER_ADMIN";

export type PayoutOperateur = "FEDAPAY" | "MTN_MOMO" | "MOOV_MONEY" | "ORANGE_MONEY" | "CELTIS" | "WALLET";

export interface ComptePayoutRead {
  id: string;
  chauffeur_id: string;
  operateur: PayoutOperateur;
  telephone: string;
  actif: boolean;
}
export type UserStatut = "ACTIF" | "SUSPENDU" | "EN_ATTENTE_KYC" | "SUPPRIME";

export type VoyageStatut = "PUBLIE" | "COMPLET" | "EN_COURS" | "TERMINE" | "ANNULE";

export type ReservationStatut =
  | "EN_ATTENTE"
  | "CONFIRMEE"
  | "REFUSEE"
  | "ANNULEE"
  | "TERMINEE";

export type ColisStatut = "EN_ATTENTE" | "CONFIRME" | "EN_TRANSIT" | "LIVRE" | "ANNULE";

export type ColisCategorie =
  | "DOCUMENTS"
  | "VETEMENTS"
  | "ELECTRONIQUE"
  | "ALIMENTAIRE"
  | "FRAGILE"
  | "AUTRE";

export type ColisModalitePaiement = "A_LA_CONFIRMATION" | "A_LA_LIVRAISON";

export type TypeVehicule = "BERLINE" | "SUV" | "MINIBUS" | "BUS" | "MOTO";

export type TransactionType =
  | "RECHARGE"
  | "PAIEMENT_VOYAGE"
  | "PAIEMENT_COLIS"
  | "REVERSEMENT"
  | "REMBOURSEMENT"
  | "COMMISSION";
export type TransactionStatut = "EN_ATTENTE" | "EN_COURS" | "REUSSI" | "ECHEC" | "ANNULE";
export type TransactionOperateur = "MTN_MOMO" | "MOOV_MONEY" | "ORANGE_MONEY" | "WALLET";

export interface TransactionStatutStat {
  statut: TransactionStatut;
  count: number;
  volume: number;
}

export interface TransactionStats {
  by_statut: TransactionStatutStat[];
  volume_reussi: number;
}

// ─── Pagination ─────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// ─── Utilisateurs ───────────────────────────────────────────────────────────

export interface UserRead {
  id: string;
  telephone: string;
  email: string | null;
  nom: string;
  prenom: string;
  photo_url: string | null;
  role: UserRole;
  statut: UserStatut;
  telephone_verifie: boolean;
  note_moyenne: number;
  nombre_avis: number;
  langue: string;
  created_at: string;
}

export type AdminUser = UserRead;

export interface UserStatutStat {
  statut: UserStatut;
  count: number;
}

export interface UserRoleStat {
  role: UserRole;
  count: number;
}

export interface UserStats {
  by_statut: UserStatutStat[];
  by_role: UserRoleStat[];
}

export interface UserPublic {
  id: string;
  nom: string;
  prenom: string;
  photo_url: string | null;
  role: UserRole;
  note_moyenne: number;
  nombre_avis: number;
}

export interface UserUpdate {
  nom?: string;
  prenom?: string;
  email?: string;
  langue?: string;
}

// ─── Chauffeurs ─────────────────────────────────────────────────────────────

export interface VehiculeRead {
  id: string;
  marque: string;
  modele: string;
  annee: number;
  immatriculation: string;
  couleur: string;
  type_vehicule: TypeVehicule;
  nombre_places: number;
  climatise: boolean;
  photo_url: string | null;
  actif: boolean;
}

export interface VehiculeCreate {
  marque: string;
  modele: string;
  annee: number;
  immatriculation: string;
  couleur: string;
  type_vehicule: TypeVehicule;
  nombre_places: number;
  climatise: boolean;
}

export interface ChauffeurRead {
  id: string;
  user_id: string;
  cin_numero: string | null;
  cin_url: string | null;
  permis_numero: string | null;
  permis_url: string | null;
  permis_expiration: string | null;
  casier_judiciaire_url: string | null;
  kyc_valide: boolean;
  kyc_valide_le: string | null;
  autorisation_transfrontaliere: boolean;
  en_ligne: boolean;
  derniere_position_lat: number | null;
  derniere_position_lng: number | null;
  nombre_trajets: number;
  revenus_total: number;
  vehicules: VehiculeRead[];
}

export interface AdminChauffeurDetail {
  user: UserRead;
  chauffeur: ChauffeurRead;
}

export interface AdminChauffeurItem extends ChauffeurRead {
  user: UserRead | null;
}

export interface ChauffeurStats {
  total: number;
  en_ligne: number;
  kyc_valide: number;
  kyc_attente: number;
}

export interface AdminVoyageDetail {
  voyage: VoyageRead;
  reservations: ReservationRead[];
  chauffeur: UserRead | null;
  vehicule: VehiculeRead | null;
}

export interface VoyageStatutStat {
  statut: VoyageStatut;
  count: number;
}

export interface VoyagesStats {
  by_statut: VoyageStatutStat[];
}

export interface AdminReservationDetail {
  reservation: ReservationRead;
  client_full: UserRead | null;
  voyage_full: VoyageRead | null;
}

export interface ReservationStatutStat {
  statut: ReservationStatut;
  count: number;
  volume: number;
}

export interface ReservationsStats {
  by_statut: ReservationStatutStat[];
  volume_confirmees: number;
}

export interface AdminColisDetail {
  colis: ColisRead;
  expediteur: UserRead | null;
}

export interface ChauffeurStats {
  nombre_trajets: number;
  revenus_total: number;
  note_moyenne: number;
  nombre_avis: number;
  en_ligne: boolean;
}

export interface ChauffeurRevenus {
  aujourd_hui: number;
  semaine: number;
  mois: number;
  total: number;
}

// ─── Voyages ────────────────────────────────────────────────────────────────

export interface VoyageRead {
  id: string;
  chauffeur_id: string;
  vehicule_id: string;
  ville_depart: string;
  ville_arrivee: string;
  point_depart: string;
  point_arrivee: string;
  date_depart: string;
  date_arrivee_estimee: string | null;
  prix_par_place: number;
  nombre_places_restantes: number;
  nombre_places_total: number;
  accepte_colis: boolean;
  climatise: boolean;
  non_fumeur: boolean;
  statut: VoyageStatut;
  distance_km: number | null;
  created_at: string;
}

export interface VoyageCreate {
  ville_depart: string;
  ville_arrivee: string;
  point_depart: string;
  point_arrivee: string;
  lat_depart: number;
  lng_depart: number;
  lat_arrivee: number;
  lng_arrivee: number;
  date_depart: string;
  prix_par_place: number;
  nombre_places_total: number;
  vehicule_id: string;
  accepte_colis?: boolean;
  climatise?: boolean;
  non_fumeur?: boolean;
}

export interface VoyageUpdate {
  prix_par_place?: number;
  point_depart?: string;
  date_depart?: string;
  accepte_colis?: boolean;
  non_fumeur?: boolean;
}

export interface VoyageSearchParams {
  ville_depart: string;
  ville_arrivee: string;
  date_depart: string;
  nombre_places?: number;
  accepte_colis?: boolean;
  climatise?: boolean;
  prix_max?: number;
  sort_by?: "depart_asc" | "depart_desc" | "prix_asc" | "prix_desc";
  page?: number;
  size?: number;
}

export interface ColisSearchParams {
  ville_depart: string;
  ville_arrivee: string;
  date_depart: string;
  sort_by?: "depart_asc" | "depart_desc" | "prix_asc" | "prix_desc";
  page?: number;
  size?: number;
}

// ─── Réservations ───────────────────────────────────────────────────────────

export interface VoyageEmbedded {
  id: string;
  ville_depart: string;
  ville_arrivee: string;
  date_depart: string;
  prix_par_place: number;
  statut: VoyageStatut;
}

export interface ReservationRead {
  id: string;
  voyage_id: string;
  client_id: string;
  nombre_places: number;
  prix_total: number;
  statut: ReservationStatut;
  code_confirmation: string;
  created_at: string;
  voyage: VoyageEmbedded | null;
  client: UserPublic | null;
}

export interface ReservationCreate {
  voyage_id: string;
  nombre_places: number;
}

// ─── Colis ──────────────────────────────────────────────────────────────────

export interface Colis {
  id: string;
  voyage_id: string;
  expediteur_id: string;
  ville_depart: string;
  ville_arrivee: string;
  description: string;
  categorie: ColisCategorie;
  poids_kg: number | null;
  fragile: boolean;
  destinataire_nom: string;
  destinataire_telephone: string;
  prix: number;
  modalite_paiement: ColisModalitePaiement;
  statut: ColisStatut;
  code_suivi: string;
  photo_url: string | null;
  voyage: VoyageRead | null;
  created_at: string;
  updated_at: string;
}

export type ColisRead = Colis;

export interface ColisCreate {
  voyage_id: string;
  description: string;
  categorie: ColisCategorie;
  poids_kg?: number;
  fragile: boolean;
  destinataire_nom: string;
  destinataire_telephone: string;
  modalite_paiement?: ColisModalitePaiement;
}

// ─── Wallet & Transactions ───────────────────────────────────────────────────

export interface WalletRead {
  id: string;
  solde: number;
  devise: string;
  actif: boolean;
}

export interface TransactionUser {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  role: UserRole;
}

export interface TransactionRead {
  id: string;
  type: TransactionType;
  statut: TransactionStatut;
  operateur: TransactionOperateur;
  montant: number;
  reference_externe: string | null;
  created_at: string;
  user: TransactionUser | null;
}

export interface RechargeInitiateRequest {
  montant: number;
  operateur: TransactionOperateur;
  telephone: string;
}

export interface WithdrawRequest {
  montant: number;
  telephone: string;
  operateur: TransactionOperateur;
}

export interface TransferRequest {
  destinataire_telephone: string;
  montant: number;
}

// ─── Avis ────────────────────────────────────────────────────────────────────

export interface AvisRead {
  id: string;
  auteur_id: string;
  cible_id: string;
  voyage_id: string | null;
  note: number;
  commentaire: string | null;
  tags: string[];
  signale: boolean;
  visible: boolean;
  created_at: string;
}

export interface AdminAvisItem extends AvisRead {
  auteur: UserRead | null;
  cible: UserRead | null;
}

export interface AvisCreate {
  cible_id: string;
  voyage_id: string;
  note: number;
  commentaire?: string;
  tags?: string[];
}

// ─── Notifications ───────────────────────────────────────────────────────────

export interface NotificationRead {
  id: string;
  type: string;
  titre: string;
  corps: string;
  lue: boolean;
  data: Record<string, unknown> | null;
  created_at: string;
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface AdminOverview {
  total_utilisateurs: number;
  total_voyages: number;
  total_colis: number;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardKPIs {
  revenusJour: number;
  coursesActives: number;
  coursesEnRoute: number;
  colisEnCours: number;
  colisPending: number;
  chauffeursOnline: number;
  chauffeursTotal: number;
  chauffeursPctOnline: number;
  kycPending: number;
}

export interface RevenuePoint {
  label: string;
  value: number;
}

export interface RevenueData {
  points: RevenuePoint[];
  totalSemaine: string;
  totalTrajets: number;
  totalColis: number;
}

export interface TopRoute {
  depart: string;
  arrivee: string;
  count: number;
  revenue: number;
}

export interface ActivityEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  icon?: string;
}

export interface MoMoStat {
  operateur: TransactionOperateur;
  volume: number;
  count: number;
  pct: number;
}

// ─── Tarifs ──────────────────────────────────────────────────────────────────

export interface TarifTrajetRead {
  id: string;
  ville_depart_id: string;
  ville_arrivee_id: string;
  ville_depart: VilleRead;
  ville_arrivee: VilleRead;
  prix_recommande: number;
  prix_max: number;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Localisation ────────────────────────────────────────────────────────────

export interface VilleRead {
  id: string;
  nom: string;
  actif: boolean;
  created_at: string;
}

export interface GareRead {
  id: string;
  nom: string;
  ville_id: string;
  ville: VilleRead;
  adresse: string | null;
  lat: number | null;
  lng: number | null;
  actif: boolean;
  created_at: string;
}

// ─── Demandes d'inscription chauffeur ────────────────────────────────────────

export type DemandeChauffeurStatut = "NOUVELLE" | "EN_COURS" | "TRAITEE" | "REJETEE";

export interface DemandeChauffeur {
  id: string;
  prenom: string;
  nom: string;
  telephone: string;
  ville: string;
  vehicule: string;
  message: string | null;
  statut: DemandeChauffeurStatut;
  traite_le: string | null;
  traite_par_id: string | null;
  user_id: string | null;
  motif_rejet: string | null;
  created_at: string;
  updated_at: string;
}

export interface DemandeChauffeurStats {
  nouvelle: number;
  en_cours: number;
  traitee: number;
  rejetee: number;
  total: number;
}

export interface TraiterDemandeCredentials {
  telephone: string;
  password: string;
  user_id: string;
}

export interface TraiterDemandeResponse {
  message: string;
  credentials: TraiterDemandeCredentials;
}

// ─── Fleet ───────────────────────────────────────────────────────────────────

export interface DriverLive {
  id: string;
  user_id: string;
  nom: string;
  prenom: string;
  photo_url: string | null;
  lat: number;
  lng: number;
  vitesse: number;
  heading: number;
  status: "available" | "in_trip" | "passenger_pickup" | "package_pickup";
  voyage_id: string | null;
}

export interface TripLive {
  id: string;
  chauffeur_id: string;
  ville_depart: string;
  ville_arrivee: string;
  date_depart: string;
  passagers: number;
  statut: VoyageStatut;
}

export interface FleetSummary {
  total: number;
  online: number;
  inTrip: number;
  available: number;
}
