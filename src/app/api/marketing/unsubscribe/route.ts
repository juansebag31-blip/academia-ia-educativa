import { verifyUnsubscribeToken } from "@/lib/marketing/download-token";

type UnsubscribeDependencies = {
  unsubscribe(email: string): Promise<boolean>;
};

export async function handleUnsubscribe(request: Request, dependencies: UnsubscribeDependencies) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token");
  const secret = process.env.MARKETING_DOWNLOAD_SECRET?.trim();
  const email = secret && token ? verifyUnsubscribeToken(token, secret) : null;

  if (!email) {
    return Response.redirect(new URL("/unsubscribe?status=invalid", requestUrl.origin));
  }

  try {
    const updated = await dependencies.unsubscribe(email);
    return Response.redirect(new URL(`/unsubscribe?status=${updated ? "success" : "error"}`, requestUrl.origin));
  } catch {
    return Response.redirect(new URL("/unsubscribe?status=error", requestUrl.origin));
  }
}

export async function GET(request: Request) {
  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return Response.redirect(new URL("/unsubscribe?status=error", request.url));
  }

  return handleUnsubscribe(request, {
    async unsubscribe(email) {
      const { error } = await admin
        .from("marketing_subscribers")
        .update({ unsubscribed_at: new Date().toISOString() })
        .eq("email", email);
      if (error) throw error;
      return true;
    },
  });
}
