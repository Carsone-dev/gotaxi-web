import { create } from "zustand";
import type { UserStatut, UserRole, ColisStatut, VoyageStatut, TransactionStatut } from "@/types/domain";

interface UsersFilters {
  search: string;
  statut: UserStatut | "";
  role: UserRole | "";
  page: number;
}

interface ColisFilters {
  statut: ColisStatut | "";
  search: string;
  page: number;
}

interface VoyagesFilters {
  statut: VoyageStatut | "";
  search: string;
  ville_depart: string;
  ville_arrivee: string;
  page: number;
}

interface TransactionsFilters {
  statut: TransactionStatut | "";
  operateur: string;
  page: number;
}

interface FiltersState {
  users: UsersFilters;
  colis: ColisFilters;
  voyages: VoyagesFilters;
  transactions: TransactionsFilters;
  setUsersFilter: (f: Partial<UsersFilters>) => void;
  setColisFilter: (f: Partial<ColisFilters>) => void;
  setVoyagesFilter: (f: Partial<VoyagesFilters>) => void;
  setTransactionsFilter: (f: Partial<TransactionsFilters>) => void;
  resetAll: () => void;
}

const defaultUsers: UsersFilters = { search: "", statut: "", role: "", page: 1 };
const defaultColis: ColisFilters = { statut: "", search: "", page: 1 };
const defaultVoyages: VoyagesFilters = { statut: "", search: "", ville_depart: "", ville_arrivee: "", page: 1 };
const defaultTransactions: TransactionsFilters = { statut: "", operateur: "", page: 1 };

export const useFiltersStore = create<FiltersState>((set) => ({
  users: defaultUsers,
  colis: defaultColis,
  voyages: defaultVoyages,
  transactions: defaultTransactions,
  setUsersFilter: (f) => set((s) => ({ users: { ...s.users, ...f } })),
  setColisFilter: (f) => set((s) => ({ colis: { ...s.colis, ...f } })),
  setVoyagesFilter: (f) => set((s) => ({ voyages: { ...s.voyages, ...f } })),
  setTransactionsFilter: (f) => set((s) => ({ transactions: { ...s.transactions, ...f } })),
  resetAll: () =>
    set({
      users: defaultUsers,
      colis: defaultColis,
      voyages: defaultVoyages,
      transactions: defaultTransactions,
    }),
}));
