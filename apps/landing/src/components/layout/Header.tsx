import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@gotaxi/ui";

const navLinks = [
  { to: "/voyager", label: "Voyager" },
  { to: "/colis", label: "Envoyer un colis" },
  { to: "/chauffeur", label: "Devenir chauffeur" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary font-extrabold text-white text-sm">
            GT
          </div>
          <span className="text-lg font-extrabold">
            Go<span className="text-primary">Taxi</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-ink",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/track"
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-ink hover:bg-surface transition-colors"
          >
            Suivre un colis
          </Link>
          <a
            href="#download"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-600 transition-colors"
          >
            Télécharger l'app
          </a>
        </div>

        <button
          className="rounded-lg p-2 hover:bg-surface md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-border bg-white px-4 pb-4 md:hidden">
          <nav className="space-y-1 pt-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "block rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    isActive ? "bg-primary-50 text-primary" : "text-ink hover:bg-surface",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/track"
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm font-medium text-ink hover:bg-surface"
            >
              Suivre un colis
            </Link>
          </nav>
          <a
            href="#download"
            onClick={() => setMenuOpen(false)}
            className="mt-3 block w-full rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-white"
          >
            Télécharger l'application
          </a>
        </div>
      )}
    </header>
  );
}
