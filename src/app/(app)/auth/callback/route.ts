import { NextResponse } from "next/server";
import {
  buildAuthHref,
  DEFAULT_AUTH_RETURN_TO,
  getAuthCourseContext,
  getSafeInternalReturnTo,
} from "@/lib/auth/return-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedDestination = getSafeInternalReturnTo(url.searchParams.get("next"));
  const destination = requestedDestination ?? DEFAULT_AUTH_RETURN_TO;
  const courseContext = getAuthCourseContext(
    requestedDestination,
    url.searchParams.get("courseSlug"),
  );

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = supabase
      ? await supabase.auth.exchangeCodeForSession(code)
      : { error: new Error("Supabase no está configurado.") };
    if (!error) return NextResponse.redirect(new URL(destination, url.origin));
  }

  return NextResponse.redirect(
    new URL(buildAuthHref("/auth/login", {
      error: "No pudimos validar el enlace.",
      returnTo: requestedDestination,
      courseSlug: courseContext?.courseSlug,
    }), url.origin),
  );
}
