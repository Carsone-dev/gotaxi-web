import type { UserRole } from "@/types/domain";

export function canAccess(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  if (userRole === "SUPER_ADMIN") return true;
  return userRole === requiredRole;
}

export function isAdmin(role: UserRole | undefined): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function isSuperAdmin(role: UserRole | undefined): boolean {
  return role === "SUPER_ADMIN";
}
