import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { Button, Spinner } from "@gotaxi/ui";
import { AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import type { AvisRead } from "@/types/domain";

export default function ReviewsPage() {
  const [filter, setFilter] = useState<"all" | "signaled">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "avis", filter],
    queryFn: () => get<AvisRead[]>(`/admin/avis${filter === "signaled" ? "?signale=true" : ""}`),
  });

  const reviews = data ?? [];
  const signaled = reviews.filter((r) => r.signale);

  return (
    <>
      <PageHeader
        title="Avis & modération"
        subtitle={`${reviews.length} avis`}
        actions={
          signaled.length > 0 ? (
            <Link to="/reviews/disputes">
              <Button
                variant="destructive"
                size="sm"
                leftIcon={<AlertTriangle className="size-4" />}
              >
                {signaled.length} signalé(s)
              </Button>
            </Link>
          ) : undefined
        }
      />

      <div className="mt-4 flex gap-2">
        {(["all", "signaled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              filter === f
                ? "bg-ink text-white"
                : "border border-border text-muted-foreground hover:text-ink"
            }`}
          >
            {f === "all" ? "Tous" : "Signalés"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Spinner className="mt-12" />
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {reviews.map((avis) => (
            <ReviewCard key={avis.id} avis={avis} />
          ))}
          {reviews.length === 0 && (
            <p className="col-span-2 py-12 text-center text-muted-foreground">
              Aucun avis
            </p>
          )}
        </div>
      )}
    </>
  );
}
