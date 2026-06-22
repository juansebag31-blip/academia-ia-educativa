import { handleUnsubscribe } from "./handler";

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
