import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard, AuthField, AuthSubmit } from "@/components/auth/auth-card";
import { registerAction } from "@/lib/auth/actions";
import {
  buildAuthHref,
  getAuthCourseContext,
  getSafeAuthCourseSlug,
  getSafeInternalReturnTo,
} from "@/lib/auth/return-path";
import { getCurrentUser } from "@/lib/auth/session";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    returnTo?: string;
    courseSlug?: string;
  }>;
}) {
  const params = await searchParams;
  const returnTo = getSafeInternalReturnTo(params.returnTo);
  const requestedCourseSlug = getSafeAuthCourseSlug(params.courseSlug);
  const courseContext = getAuthCourseContext(returnTo, requestedCourseSlug);
  const courseSlug = courseContext?.courseSlug ?? null;
  const user = await getCurrentUser();
  if (user && returnTo) redirect(returnTo);

  return (
    <AuthCard
      title="Crear una cuenta"
      description="El curso seguirá siendo gratuito. La cuenta solo sirve para conservar tu aprendizaje entre dispositivos."
      error={params.error}
      visitorHref={returnTo ?? "/"}
      courseContext={courseContext ? {
        title: courseContext.title,
        description: "Estás creando una cuenta para guardar tu progreso en este curso.",
        href: courseContext.href,
      } : undefined}
      footer={(
        <span>
          ¿Ya tienes cuenta?{" "}
          <Link
            className="font-bold text-ember"
            href={buildAuthHref("/auth/login", { returnTo, courseSlug })}
          >
            Inicia sesión
          </Link>.
        </span>
      )}
    >
      <form action={registerAction} className="space-y-4">
        <input type="hidden" name="returnTo" value={returnTo ?? ""} />
        <input type="hidden" name="courseSlug" value={courseSlug ?? ""} />
        <AuthField label="Nombre" name="displayName" autoComplete="name" />
        <AuthField label="Correo electrónico" name="email" type="email" autoComplete="email" />
        <AuthField label="Contraseña" name="password" type="password" autoComplete="new-password" />
        <AuthField label="Repetir contraseña" name="confirmPassword" type="password" autoComplete="new-password" />
        <AuthSubmit>Crear cuenta gratuita</AuthSubmit>
      </form>
    </AuthCard>
  );
}
