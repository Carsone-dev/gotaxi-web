import { useAuthStore } from "@/stores/authStore";
import { getInitials } from "@/lib/format";
import { LogOut, User, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@gotaxi/ui";

export function UserProfileDropdown() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative border-t border-white/10 p-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/10"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-400/20 text-sm font-bold text-primary-400">
          {getInitials(user.nom, user.prenom)}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="truncate text-sm font-semibold">{user.prenom} {user.nom}</p>
          <p className="truncate text-2xs text-white/50">{user.role}</p>
        </div>
      </button>

      {open && (
        <div className="absolute bottom-full left-3 right-3 mb-1 rounded-xl bg-white shadow-elevated">
          <button
            onClick={() => { navigate("/settings"); setOpen(false); }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-surface"
          >
            <Settings className="size-4" /> Mon profil
          </button>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-b-xl px-4 py-2.5 text-sm text-error hover:bg-error-bg"
          >
            <LogOut className="size-4" /> Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
