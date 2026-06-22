import Link from "next/link";
import { AuthCard, AuthField, AuthSubmit } from "@/components/auth/auth-card";
import { registerAction } from "@/lib/auth/actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthCard
      title="Crear una cuenta"
      description="El curso seguirá siendo gratuito. La cuenta solo sirve para conservar tu aprendizaje entre dispositivos."
      error={params.error}
      footer={<span>¿Ya tienes cuenta? <Link className="font-bold text-ember" href="/auth/login">Inicia sesión</Link>.</span>}
    >
      <form action={registerAction} className="space-y-4">
        <AuthField label="Nombre" name="displayName" autoComplete="name" />
        <AuthField label="Correo electrónico" name="email" type="email" autoComplete="email" />
        <AuthField label="Contraseña" name="password" type="password" autoComplete="new-password" />
        <AuthField label="Repetir contraseña" name="confirmPassword" type="password" autoComplete="new-password" />
        <AuthSubmit>Crear cuenta gratuita</AuthSubmit>
      </form>
    </AuthCard>
  );
}
