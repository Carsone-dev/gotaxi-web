import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-extrabold text-accent-yellow lg:text-3xl">{value}</p>
      <p className="text-xs text-white/80">{label}</p>
    </div>
  );
}

export function HeroSection() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-hero py-20 lg:py-32">
      <div className="absolute -right-20 -top-20 size-96 rounded-full bg-primary/40 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 size-80 rounded-full bg-accent-yellow/15 blur-3xl" />

      <div className="container-page relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-400/40 bg-primary-400/20 px-4 py-1.5 text-xs font-semibold text-white">
            🚀 Disponible au Bénin · Togo · Côte d'Ivoire bientôt
          </span>

          <h1 className="mt-5 text-5xl font-extrabold leading-tight tracking-tight text-white lg:text-7xl">
            Votre course.<br />
            Votre colis.<br />
            <span className="bg-gradient-to-r from-primary-400 to-accent-yellow bg-clip-text text-transparent">
              En un clic.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-lg text-white/85">
            Le réseau de transport interurbain et de livraison de colis le plus fiable d'Afrique de l'Ouest.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-8 flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-elevated md:flex-row"
          >
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-surface px-3 py-2">
              <span className="size-2 rounded-full bg-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-2xs text-muted-foreground">DE</p>
                <input
                  type="text"
                  placeholder="Cotonou"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold outline-none"
                />
              </div>
            </div>
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-surface px-3 py-2">
              <span className="size-2 rounded-full bg-error shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-2xs text-muted-foreground">À</p>
                <input
                  type="text"
                  placeholder="Parakou"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-600 transition-colors"
            >
              <Search className="size-4" />
              Chercher
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#"
              className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              <span className="text-xl"></span>
              <div className="text-left">
                <p className="text-2xs text-white/70">Télécharger sur</p>
                <p className="text-sm font-extrabold">App Store</p>
              </div>
            </a>
            <a
              href="#"
              className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              <span className="text-xl">▶</span>
              <div className="text-left">
                <p className="text-2xs text-white/70">Disponible sur</p>
                <p className="text-sm font-extrabold">Google Play</p>
              </div>
            </a>
          </div>

          <div className="mt-8 flex gap-8">
            <Stat value="50K+" label="Trajets effectués" />
            <Stat value="1 200+" label="Chauffeurs vérifiés" />
            <Stat value="⭐ 4.9" label="Note moyenne" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
