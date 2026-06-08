import { useQuery } from "@tanstack/react-query";
import { keys } from "@/lib/query-keys";
import { get } from "@/lib/api";
import type { PaginatedResponse, TransactionRead, WalletRead } from "@/types/domain";

export const useWallet = () =>
  useQuery({
    queryKey: keys.wallet.me(),
    queryFn: () => get<WalletRead>("/wallet/me"),
  });

export const useWalletActivity = (page = 1) =>
  useQuery({
    queryKey: keys.wallet.activity(page),
    queryFn: () => get<PaginatedResponse<TransactionRead>>("/wallet/me/activity", { page }),
  });

export const useMyTransactions = (page = 1) =>
  useQuery({
    queryKey: keys.transactions.me(page),
    queryFn: () => get<PaginatedResponse<TransactionRead>>("/transactions/me", { page }),
  });
