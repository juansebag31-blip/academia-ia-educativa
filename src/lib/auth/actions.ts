"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateEmail, validatePassword, validateRegistration } from "./validation";

function authRedirect(path: string, type: "error" | "message", message: string): never {
  redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

async function getOrigin() {
  const requestHeaders = await headers();
  return process.env.NEXT_PUBLIC_APP_URL ?? requestHeaders.get("origin") ?? "http://localhost:3000";
}

export async function registerAction(formData: FormData) {
  const result = validateRegistration({
    displayName: String(formData.get("displayName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!result.ok) authRedirect("/auth/register", "error", result.message);

  const supabase = await createSupabaseServerClient();
  if (!supabase) authRedirect("/auth/register", "error", "El registro no está configurado.");

  const origin = await getOrigin();
  const { error } = await supabase.auth.signUp({
    email: result.value.email,
    password: result.value.password,
    options: {
      data: { display_name: result.value.displayName },
      emailRedirectTo: `${origin}/auth/callback?next=/account`,
    },
  });

  if (error) authRedirect("/auth/register", "error", error.message);
  authRedirect("/auth/login", "message", "Revisa tu correo para confirmar la cuenta.");
}

export async function loginAction(formData: FormData) {
  const email = validateEmail(String(formData.get("email") ?? ""));
  const password = validatePassword(String(formData.get("password") ?? ""));
  if (!email.ok) authRedirect("/auth/login", "error", email.message);
  if (!password.ok) authRedirect("/auth/login", "error", password.message);

  const supabase = await createSupabaseServerClient();
  if (!supabase) authRedirect("/auth/login", "error", "El inicio de sesión no está configurado.");

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });
  if (error) authRedirect("/auth/login", "error", "Correo o contraseña incorrectos.");
  redirect("/account");
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
