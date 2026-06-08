import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { ColisTable } from "@/components/colis/ColisTable";
import { Button } from "@gotaxi/ui";
import { ArrowLeft } from "lucide-react";
import { useAdminInTransitColis } from "@/hooks/useAdmin";

export default function ColisInTransitPage() {
  const { data, isLoading } = useAdminInTransitColis();
  const navigate = useNavigate();
  const colis = data ?? [];

  return (
    <>
      <PageHeader
        title="Colis en transit"
        subtitle={`${colis.length} colis en route`}
        actions={
          <Link to="/colis">
            <Button variant="ghost" leftIcon={<ArrowLeft className="size-4" />}>
              Retour
            </Button>
          </Link>
        }
      />

      <div className="mt-6">
        <ColisTable
          colis={colis}
          loading={isLoading}
          onRowClick={(c) => navigate(`/colis/${c.id}`)}
        />
      </div>
    </>
  );
}
