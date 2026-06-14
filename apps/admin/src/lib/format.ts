import { format, formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export function formatCurrency(amount: number | undefined | null, devise = "FCFA"): string {
  return `${(amount ?? 0).toLocaleString("fr-FR")} ${devise}`;
}

export function formatNumber(n: number | undefined | null): string {
  const v = n ?? 0;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toLocaleString("fr-FR");
}

export function formatDate(dateStr: string | undefined | null, fmt = "dd/MM/yyyy"): string {
  if (!dateStr) return "—";
  return format(parseISO(dateStr), fmt, { locale: fr });
}

export function formatDateTime(dateStr: string | undefined | null): string {
  if (!dateStr) return "—";
  return format(parseISO(dateStr), "dd/MM/yyyy HH:mm", { locale: fr });
}

export function formatRelativeTime(dateStr: string | undefined | null): string {
  if (!dateStr) return "—";
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: fr });
}

export function formatPhoneNumber(phone: string): string {
  return phone.replace(/(\+\d{3})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5");
}

export function getInitials(nom: string, prenom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

const _backendOrigin = new URL(import.meta.env.VITE_API_URL as string).origin;

export function getMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${_backendOrigin}${path}`;
}
