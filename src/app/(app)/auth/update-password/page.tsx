import { AuthCard, AuthField, AuthSubmit } from "@/components/auth/auth-card";
import { updatePasswordAction } from "@/lib/auth/actions";

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthCard
      title="Nueva contraseña"
      description="Elige una contraseña de al menos ocho caracteres."
      error={params.error}
      footer="Al terminar volverás a tu cuenta."
    >
      <form action={updatePasswordAction} className="space-y-4">
        <AuthField label="Nueva contraseña" name="password" type="password" autoComplete="new-password" />
        <AuthField label="Repetir contraseña" name="confirmPassword" type="password" autoComplete="new-password" />
        <AuthSubmit>Actualizar contraseña</AuthSubmit>
      </form>
    </AuthCard>
  );
}
