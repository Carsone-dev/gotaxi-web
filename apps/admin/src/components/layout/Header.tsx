import { Bell, Search } from "lucide-react";
import { Button } from "@gotaxi/ui";
import { useAuthStore } from "@/stores/authStore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Header() {
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/users?search=${encodeURIComponent(search)}`);
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-white px-6">
      <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2 w-72">
        <Search className="size-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher utilisateur, colis..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </form>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-error ring-2 ring-white" />
        </Button>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary-100 text-primary font-bold text-xs">
            {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
          </div>
          <span className="font-semibold">{user?.prenom}</span>
        </div>
      </div>
    </header>
  );
}
