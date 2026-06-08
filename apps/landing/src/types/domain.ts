export type VoyageStatut = "PUBLIE" | "COMPLET" | "EN_COURS" | "TERMINE" | "ANNULE";
export type ColisStatut = "EN_ATTENTE" | "CONFIRME" | "EN_TRANSIT" | "LIVRE" | "ANNULE";
export type ColisCategorie = "DOCUMENTS" | "VETEMENTS" | "ELECTRONIQUE" | "ALIMENTAIRE" | "FRAGILE" | "AUTRE";

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

export interface ColisRead {
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
  modalite_paiement: "A_LA_CONFIRMATION" | "A_LA_LIVRAISON";
  statut: ColisStatut;
  code_suivi: string;
  photo_url: string | null;
  voyage: VoyageRead | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
