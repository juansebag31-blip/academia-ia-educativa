import { AuthCard, AuthField, AuthSubmit } from "@/components/auth/auth-card";
import { forgotPasswordAction } from "@/lib/auth/actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthCard
      title="Recuperar contraseña"
      description="Te enviaremos un enlace seguro para establecer una nueva contraseña."
      error={params.error}
      message={params.message}
      footer="El enlace solo podrá utilizarse durante un tiempo limitado."
    >
      <form action={forgotPasswordAction} className="space-y-4">
        <AuthField label="Correo electrónico" name="email" type="email" autoComplete="email" />
        <AuthSubmit>Enviar enlace</AuthSubmit>
      </form>
    </AuthCard>
  );
}
