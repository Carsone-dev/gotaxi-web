import { PageHeader } from "@/components/layout/PageHeader";
import { useAuthStore } from "@/stores/authStore";
import { Button, Input } from "@gotaxi/ui";
import { User, Lock, Globe, Bell } from "lucide-react";
import { getInitials } from "@/lib/format";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!user) return null;

  return (
    <>
      <PageHeader title="Paramètres" subtitle="Gérez votre compte et les préférences" />

      <div className="mt-6 max-w-2xl space-y-4">
        <Section icon={<User className="size-4" />} title="Mon profil">
          <div className="flex items-center gap-4">
            {user.photo_url ? (
              <img src={user.photo_url} alt="" className="size-16 rounded-2xl object-cover ring-2 ring-border" />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-2xl bg-surface text-xl font-extrabold ring-2 ring-border">
                {getInitials(user.nom, user.prenom)}
              </div>
            )}
            <div>
              <p className="text-lg font-extrabold">{user.prenom} {user.nom}</p>
              <p className="text-sm text-muted-foreground">{user.role.replace("_", " ")}</p>
              <p className="text-xs text-muted-foreground">{user.telephone}</p>
            </div>
          </div>
        </Section>

        <Section icon={<Lock className="size-4" />} title="Sécurité">
          <div className="space-y-3">
            <Input label="Mot de passe actuel" type="password" placeholder="••••••••" />
            <Input label="Nouveau mot de passe" type="password" placeholder="••••••••" />
            <Input label="Confirmer le mot de passe" type="password" placeholder="••••••••" />
            <Button size="sm">Changer le mot de passe</Button>
          </div>
        </Section>

        <Section icon={<Globe className="size-4" />} title="Préférences">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Langue</p>
                <p className="text-xs text-muted-foreground">Langue de l'interface</p>
              </div>
              <select className="rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none">
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </Section>

        <Section icon={<Bell className="size-4" />} title="Notifications">
          <div className="space-y-3">
            {[
              "Nouveaux colis en attente",
              "KYC en attente de validation",
              "Litiges signalés",
              "Rapports quotidiens",
            ].map((label) => (
              <label key={label} className="flex cursor-pointer items-center justify-between">
                <span className="text-sm">{label}</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
            ))}
          </div>
        </Section>

        <div className="pt-2">
          <Button variant="destructive" onClick={logout}>
            Se déconnecter
          </Button>
        </div>
      </div>
    </>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      {children}
    </div>
  );
}
