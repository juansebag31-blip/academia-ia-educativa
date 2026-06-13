import Link from "next/link";
import { AuthCard, AuthField, AuthSubmit } from "@/components/auth/auth-card";
import { loginAction } from "@/lib/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthCard
      title="Iniciar sesión"
      description="Sincroniza tu progreso, notas, exámenes y certificados."
      error={params.error}
      message={params.message}
      footer={<span>¿Aún no tienes cuenta? <Link className="font-bold text-ember" href="/auth/register">Regístrate gratis</Link>.</span>}
    >
      <form action={loginAction} className="space-y-4">
        <AuthField label="Correo electrónico" name="email" type="email" autoComplete="email" />
        <AuthField label="Contraseña" name="password" type="password" autoComplete="current-password" />
        <div className="text-right">
          <Link href="/auth/forgot-password" className="text-sm font-bold text-ember hover:underline">Olvidé mi contraseña</Link>
        </div>
        <AuthSubmit>Entrar</AuthSubmit>
      </form>
    </AuthCard>
  );
}
