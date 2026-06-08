import { AxiosError } from "axios";
import { toast } from "sonner";

interface ApiError {
  error?: { code: string; message: string };
  detail?: string | Array<{ loc: string[]; msg: string }>;
}

export function handleApiError(error: unknown, fallback = "Une erreur est survenue"): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined;

    if (data?.error?.message) return data.error.message;
    if (typeof data?.detail === "string") return data.detail;
    if (Array.isArray(data?.detail)) {
      return data.detail.map((d) => d.msg).join(", ");
    }

    const status = error.response?.status;
    if (status === 401) return "Session expirée — reconnectez-vous";
    if (status === 403) return "Accès refusé";
    if (status === 404) return "Ressource introuvable";
    if (status === 409) return "Conflit — ressource déjà existante";
    if (status === 422) return "Données invalides";
    if (status === 429) return "Trop de tentatives — réessayez plus tard";
  }
  return fallback;
}

export function toastError(error: unknown, fallback?: string) {
  toast.error(handleApiError(error, fallback));
}

export function toastSuccess(message: string) {
  toast.success(message);
}
