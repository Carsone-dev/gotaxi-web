import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuthStore } from "@/stores/authStore";
import { usersApi } from "@/lib/api/users";
import { post } from "@/lib/api";
import { Button, Input } from "@gotaxi/ui";
import {
  User, Lock, Globe, Bell, Check, Camera, Eye, EyeOff,
  ShieldCheck, LogOut, Smartphone,
} from "lucide-react";
import { getInitials, getMediaUrl } from "@/lib/format";
import type { UserUpdate } from "@/types/domain";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  prenom: z.string().min(1, "Requis"),
  nom: z.string().min(1, "Requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
});

const passwordSchema = z
  .object({
    ancien_mot_de_passe: z.string().min(1, "Requis"),
    nouveau_mot_de_passe: z.string().min(8, "8 caractères minimum"),
    confirmer: z.string(),
  })
  .refine((d) => d.nouveau_mot_de_passe === d.confirmer, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmer"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

// ─── Password strength ────────────────────────────────────────────────────────

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: "Très faible", color: "bg-error" };
  if (score === 2) return { score, label: "Faible", color: "bg-warning" };
  if (score === 3) return { score, label: "Moyen", color: "bg-accent-yellow" };
  if (score === 4) return { score, label: "Fort", color: "bg-success" };
  return { score, label: "Très fort", color: "bg-success" };
}

// ─── Notification prefs (localStorage) ───────────────────────────────────────

const NOTIF_KEYS = [
  { key: "colis_pending", label: "Nouveaux colis en attente" },
  { key: "kyc_pending", label: "KYC en attente de validation" },
  { key: "litiges", label: "Litiges signalés" },
  { key: "rapports", label: "Rapports quotidiens" },
] as const;

function loadNotifPrefs(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem("admin_notif_prefs") ?? "{}");
  } catch {
    return {};
  }
}

function saveNotifPrefs(prefs: Record<string, boolean>) {
  localStorage.setItem("admin_notif_prefs", JSON.stringify(prefs));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [editProfile, setEditProfile] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>(() => {
    const saved = loadNotifPrefs();
    const defaults: Record<string, boolean> = {};
    NOTIF_KEYS.forEach(({ key }) => { defaults[key] = saved[key] ?? true; });
    return defaults;
  });
  const [lang, setLang] = useState(user?.langue ?? "fr");
  const [langSaved, setLangSaved] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      prenom: user?.prenom ?? "",
      nom: user?.nom ?? "",
      email: user?.email ?? "",
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { ancien_mot_de_passe: "", nouveau_mot_de_passe: "", confirmer: "" },
  });

  const newPw = passwordForm.watch("nouveau_mot_de_passe") ?? "";
  const pwStrength = passwordStrength(newPw);

  // ── Mutations ────────────────────────────────────────────────────────────────

  const updateProfile = useMutation({
    mutationFn: (data: UserUpdate) => usersApi.updateMe(data),
    onSuccess: (updatedUser) => {
      useAuthStore.setState((s) => ({ ...s, user: updatedUser }));
      setEditProfile(false);
    },
  });

  const uploadPhoto = useMutation({
    mutationFn: (file: File) => usersApi.uploadPhoto(file),
    onSuccess: (updatedUser) => {
      useAuthStore.setState((s) => ({ ...s, user: updatedUser }));
    },
  });

  const changePassword = useMutation({
    mutationFn: ({ ancien_mot_de_passe, nouveau_mot_de_passe }: { ancien_mot_de_passe: string; nouveau_mot_de_passe: string }) =>
      post<{ message: string }>("/auth/password/change", { ancien_mot_de_passe, nouveau_mot_de_passe }),
    onSuccess: () => {
      passwordForm.reset();
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 5000);
    },
  });

  const updateLang = useMutation({
    mutationFn: (langue: string) => usersApi.updateMe({ langue }),
    onSuccess: (updatedUser) => {
      useAuthStore.setState((s) => ({ ...s, user: updatedUser }));
      setLangSaved(true);
      setTimeout(() => setLangSaved(false), 3000);
    },
  });

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const onProfileSubmit = (data: ProfileForm) => {
    updateProfile.mutate({ prenom: data.prenom, nom: data.nom, email: data.email || undefined });
  };

  const onPasswordSubmit = ({ ancien_mot_de_passe, nouveau_mot_de_passe }: PasswordForm) => {
    changePassword.mutate({ ancien_mot_de_passe, nouveau_mot_de_passe });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadPhoto.mutate(file);
    e.target.value = "";
  };

  const toggleNotif = (key: string) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    saveNotifPrefs(updated);
  };

  if (!user) return null;

  const avatarUrl = getMediaUrl(user.photo_url);
  const memberSince = new Date(user.created_at).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <>
      <PageHeader title="Paramètres" subtitle="Gérez votre compte et les préférences" />

      <div className="mt-6 max-w-2xl space-y-4">

        {/* ── Profil ── */}
        <Section icon={<User className="size-4" />} title="Mon profil">
          {/* Avatar + infos */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="size-16 rounded-2xl object-cover ring-2 ring-border"
                />
              ) : (
                <div className="flex size-16 items-center justify-center rounded-2xl bg-surface text-xl font-extrabold ring-2 ring-border">
                  {getInitials(user.nom, user.prenom)}
                </div>
              )}
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadPhoto.isPending}
                className="absolute -bottom-1.5 -right-1.5 flex size-7 items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-md transition-all hover:bg-primary/90 disabled:opacity-60"
                title="Changer la photo"
              >
                {uploadPhoto.isPending ? (
                  <span className="size-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Camera className="size-3.5" />
                )}
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-extrabold">{user.prenom} {user.nom}</p>
              <p className="text-sm text-muted-foreground">{user.role.replace(/_/g, " ")}</p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Smartphone className="size-3" />{user.telephone}</span>
                <span>Membre depuis {memberSince}</span>
              </div>
            </div>
          </div>

          {/* Formulaire édition */}
          {!editProfile ? (
            <button
              type="button"
              onClick={() => setEditProfile(true)}
              className="mt-4 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-ink hover:bg-surface transition-colors"
            >
              Modifier le profil
            </button>
          ) : (
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Prénom"
                  {...profileForm.register("prenom")}
                  error={profileForm.formState.errors.prenom?.message}
                />
                <Input
                  label="Nom"
                  {...profileForm.register("nom")}
                  error={profileForm.formState.errors.nom?.message}
                />
              </div>
              <Input
                label="Email"
                type="email"
                placeholder="admin@gotaxi.bj"
                {...profileForm.register("email")}
                error={profileForm.formState.errors.email?.message}
              />
              {updateProfile.isError && (
                <p className="text-xs text-error">Une erreur est survenue. Réessayez.</p>
              )}
              <div className="flex gap-3">
                <Button type="submit" size="sm" loading={updateProfile.isPending}>
                  Enregistrer
                </Button>
                <button
                  type="button"
                  onClick={() => { setEditProfile(false); profileForm.reset(); }}
                  className="rounded-xl border border-border px-4 py-1.5 text-sm font-semibold text-ink hover:bg-surface"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </Section>

        {/* ── Sécurité ── */}
        <Section icon={<Lock className="size-4" />} title="Sécurité">
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-3">
            <PasswordInput
              label="Mot de passe actuel"
              placeholder="••••••••"
              {...passwordForm.register("ancien_mot_de_passe")}
              error={passwordForm.formState.errors.ancien_mot_de_passe?.message}
            />
            <div className="space-y-1.5">
              <PasswordInput
                label="Nouveau mot de passe"
                placeholder="••••••••"
                {...passwordForm.register("nouveau_mot_de_passe")}
                error={passwordForm.formState.errors.nouveau_mot_de_passe?.message}
              />
              {newPw.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i <= pwStrength.score ? pwStrength.color : "bg-border"
                        }`}
                      />
                    ))}
                  </div>
                  {pwStrength.label && (
                    <p className={`text-xs font-medium ${
                      pwStrength.score <= 1 ? "text-error" :
                      pwStrength.score === 2 ? "text-warning-text" :
                      pwStrength.score === 3 ? "text-ink" : "text-success"
                    }`}>
                      Force : {pwStrength.label}
                    </p>
                  )}
                </div>
              )}
            </div>
            <PasswordInput
              label="Confirmer le mot de passe"
              placeholder="••••••••"
              {...passwordForm.register("confirmer")}
              error={passwordForm.formState.errors.confirmer?.message}
            />
            {changePassword.isError && (
              <p className="text-xs text-error">Mot de passe actuel incorrect ou erreur serveur.</p>
            )}
            {pwSuccess && (
              <div className="flex items-center gap-2 rounded-xl bg-success-bg px-3 py-2">
                <ShieldCheck className="size-4 text-success" />
                <p className="text-xs font-semibold text-success">Mot de passe modifié avec succès.</p>
              </div>
            )}
            <Button type="submit" size="sm" loading={changePassword.isPending}>
              Changer le mot de passe
            </Button>
          </form>
        </Section>

        {/* ── Préférences ── */}
        <Section icon={<Globe className="size-4" />} title="Préférences">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Langue de l'interface</p>
              <p className="text-xs text-muted-foreground">Appliqué à votre compte</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇬🇧 English</option>
              </select>
              <Button
                size="sm"
                variant={langSaved ? "outline" : "default"}
                loading={updateLang.isPending}
                onClick={() => updateLang.mutate(lang)}
                disabled={lang === user.langue}
              >
                {langSaved ? <><Check className="mr-1 size-3.5" />Sauvegardé</> : "Sauvegarder"}
              </Button>
            </div>
          </div>
        </Section>

        {/* ── Notifications ── */}
        <Section icon={<Bell className="size-4" />} title="Notifications">
          <div className="space-y-1">
            {NOTIF_KEYS.map(({ key, label }) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between rounded-xl px-1 py-2.5 hover:bg-surface transition-colors"
              >
                <span className="text-sm">{label}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifPrefs[key]}
                  onClick={() => toggleNotif(key)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    notifPrefs[key] ? "bg-primary" : "bg-border"
                  }`}
                >
                  <span
                    className={`inline-block size-3.5 rounded-full bg-white shadow transition-transform ${
                      notifPrefs[key] ? "translate-x-4" : "translate-x-1"
                    }`}
                  />
                </button>
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Ces préférences sont stockées localement dans votre navigateur.
          </p>
        </Section>

        {/* ── Déconnexion ── */}
        <div className="rounded-2xl border border-error/30 bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold">Se déconnecter</p>
              <p className="text-xs text-muted-foreground">Ferme votre session sur cet appareil</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              leftIcon={<LogOut className="size-4" />}
              onClick={logout}
            >
              Déconnexion
            </Button>
          </div>
        </div>

      </div>
    </>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
        <span className="text-muted-foreground">{icon}</span>
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── PasswordInput ────────────────────────────────────────────────────────────

import { forwardRef } from "react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, ...props }, ref) => {
    const [show, setShow] = useState(false);
    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            type={show ? "text" : "password"}
            className={`w-full rounded-xl border bg-white px-3 py-2.5 pr-10 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${
              error ? "border-error" : "border-border"
            }`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink transition-colors"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
