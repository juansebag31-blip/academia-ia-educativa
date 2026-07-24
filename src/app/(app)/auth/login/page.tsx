import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard, AuthField, AuthSubmit } from "@/components/auth/auth-card";
import { loginAction } from "@/lib/auth/actions";
import {
  buildAuthHref,
  getAuthCourseContext,
  getSafeAuthCourseSlug,
  getSafeInternalReturnTo,
} from "@/lib/auth/return-path";
import { getCurrentUser } from "@/lib/auth/session";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    message?: string;
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
      title="Iniciar sesión"
      description="Sincroniza tu progreso, notas, exámenes y certificados."
      error={params.error}
      message={params.message}
      visitorHref={returnTo ?? "/"}
      courseContext={courseContext ? {
        title: courseContext.title,
        description: "Estás iniciando sesión para continuar tu recorrido en este curso.",
        href: courseContext.href,
      } : undefined}
      footer={(
        <span>
          ¿Aún no tienes cuenta?{" "}
          <Link
            className="font-bold text-ember"
            href={buildAuthHref("/auth/register", { returnTo, courseSlug })}
          >
            Regístrate gratis
          </Link>.
        </span>
      )}
    >
      <form action={loginAction} className="space-y-4">
        <input type="hidden" name="returnTo" value={returnTo ?? ""} />
        <input type="hidden" name="courseSlug" value={courseSlug ?? ""} />
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
