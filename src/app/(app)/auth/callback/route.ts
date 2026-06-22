import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  const destination = next?.startsWith("/") ? next : "/account";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = supabase
      ? await supabase.auth.exchangeCodeForSession(code)
      : { error: new Error("Supabase no está configurado.") };
    if (!error) return NextResponse.redirect(new URL(destination, url.origin));
  }

  return NextResponse.redirect(
    new URL("/auth/login?error=No+pudimos+validar+el+enlace.", url.origin),
  );
}
