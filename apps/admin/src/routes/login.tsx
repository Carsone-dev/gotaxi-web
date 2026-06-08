import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Button, Input } from "@gotaxi/ui";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

const schema = z.object({
  telephone: z.string().min(8, "Numéro invalide"),
  password: z.string().min(6, "6 caractères minimum"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.telephone, data.password);
      toast.success("Connexion réussie");
      navigate(from, { replace: true });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Identifiants invalides";
      toast.error(msg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-4">
      <div className="absolute -right-20 -top-20 size-96 rounded-full bg-primary/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-20 size-80 rounded-full bg-accent-yellow/15 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-elevated">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-white font-black text-lg">
            G
          </div>
          <div>
            <p className="text-xl font-extrabold leading-tight">
              Go<span className="text-primary">Taxi</span>
            </p>
            <p className="text-2xs text-muted-foreground font-semibold tracking-widest uppercase">
              Administration
            </p>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold">Bienvenue 👋</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connectez-vous au tableau de bord administrateur
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input
            label="Téléphone"
            type="tel"
            placeholder="+22997000010"
            error={errors.telephone?.message}
            {...register("telephone")}
          />
          <Input
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />
          <Button type="submit" loading={isSubmitting} className="w-full mt-2">
            Se connecter
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Accès réservé aux administrateurs GoTaxi
        </p>
      </div>
    </div>
  );
}
