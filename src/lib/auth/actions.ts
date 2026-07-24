"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildAuthHref,
  DEFAULT_AUTH_RETURN_TO,
  getAuthCourseContext,
  getSafeInternalReturnTo,
} from "./return-path";
import { validateEmail, validatePassword, validateRegistration } from "./validation";

type AuthContext = {
  requestedReturnTo: string | null;
  returnTo: string;
  courseSlug: string | null;
};

function readAuthContext(formData: FormData): AuthContext {
  const requestedReturnTo = getSafeInternalReturnTo(formData.get("returnTo"));
  const courseContext = getAuthCourseContext(
    requestedReturnTo,
    formData.get("courseSlug"),
  );
  return {
    requestedReturnTo,
    returnTo: requestedReturnTo ?? DEFAULT_AUTH_RETURN_TO,
    courseSlug: courseContext?.courseSlug ?? null,
  };
}

function authRedirect(
  path: string,
  type: "error" | "message",
  message: string,
  context?: AuthContext,
): never {
  if ((path === "/auth/login" || path === "/auth/register") && context) {
    redirect(buildAuthHref(path, {
      [type]: message,
      returnTo: context.requestedReturnTo,
      courseSlug: context.courseSlug,
    }));
  }

  const searchParams = new URLSearchParams({ [type]: message });
  redirect(`${path}?${searchParams.toString()}`);
}

async function getOrigin() {
  const requestHeaders = await headers();
  return process.env.NEXT_PUBLIC_APP_URL ?? requestHeaders.get("origin") ?? "http://localhost:3000";
}

export async function registerAction(formData: FormData) {
  const context = readAuthContext(formData);
  const result = validateRegistration({
    displayName: String(formData.get("displayName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!result.ok) authRedirect("/auth/register", "error", result.message, context);

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    authRedirect("/auth/register", "error", "El registro no está configurado.", context);
  }

  const origin = await getOrigin();
  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("next", context.returnTo);
  if (context.courseSlug) callbackUrl.searchParams.set("courseSlug", context.courseSlug);
  const metadata: Record<string, string> = {
    display_name: result.value.displayName,
  };
  if (context.courseSlug) metadata.course_slug = context.courseSlug;

  const { data, error } = await supabase.auth.signUp({
    email: result.value.email,
    password: result.value.password,
    options: {
      data: metadata,
      emailRedirectTo: callbackUrl.toString(),
    },
  });

  if (error) authRedirect("/auth/register", "error", error.message, context);
  if (data.session) redirect(context.returnTo);
  authRedirect("/auth/login", "message", "Revisa tu correo para confirmar la cuenta.", context);
}

export async function loginAction(formData: FormData) {
  const context = readAuthContext(formData);
  const email = validateEmail(String(formData.get("email") ?? ""));
  const password = validatePassword(String(formData.get("password") ?? ""));
  if (!email.ok) authRedirect("/auth/login", "error", email.message, context);
  if (!password.ok) authRedirect("/auth/login", "error", password.message, context);

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    authRedirect("/auth/login", "error", "El inicio de sesión no está configurado.", context);
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });
  if (error) {
    authRedirect("/auth/login", "error", "Correo o contraseña incorrectos.", context);
  }
  redirect(context.returnTo);
}

export async function forgotPasswordAction(formData: FormData) {
  const email = validateEmail(String(formData.get("email") ?? ""));
  if (!email.ok) authRedirect("/auth/forgot-password", "error", email.message);

  const supabase = await createSupabaseServerClient();
  if (!supabase) authRedirect("/auth/forgot-password", "error", "La recuperación no está configurada.");

  const origin = await getOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
  });
  if (error) authRedirect("/auth/forgot-password", "error", error.message);
  authRedirect("/auth/forgot-password", "message", "Revisa tu correo para continuar.");
}

export async function updatePasswordAction(formData: FormData) {
  const password = validatePassword(String(formData.get("password") ?? ""));
  const confirmation = String(formData.get("confirmPassword") ?? "");
  if (!password.ok) authRedirect("/auth/update-password", "error", password.message);
  if (password.value !== confirmation) {
    authRedirect("/auth/update-password", "error", "Las contraseñas no coinciden.");
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) authRedirect("/auth/update-password", "error", "La recuperación no está configurada.");
  const { error } = await supabase.auth.updateUser({ password: password.value });
  if (error) authRedirect("/auth/update-password", "error", error.message);
  authRedirect("/account", "message", "Contraseña actualizada correctamente.");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}
