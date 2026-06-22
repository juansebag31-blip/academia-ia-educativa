"use server";

import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createDownloadToken, createUnsubscribeToken } from "./download-token";
import { getCanonicalOrigin } from "./seo";
import { subscribeToNewsletter, type NewsletterResult } from "./newsletter";
import { sendPromptKitEmail } from "./resend";

export type NewsletterActionState = NewsletterResult | { status: "idle" };

export async function subscribeNewsletterAction(
  _previousState: NewsletterActionState,
  formData: FormData,
): Promise<NewsletterActionState> {
  const requestHeaders = await headers();
  const admin = createSupabaseAdminClient();
  const hashSecret = process.env.MARKETING_HASH_SECRET?.trim();
  const downloadSecret = process.env.MARKETING_DOWNLOAD_SECRET?.trim();

  if (!admin || !hashSecret || !downloadSecret) {
    return { status: "unavailable", message: "El registro todavía no está configurado." };
  }

  const origin = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const userAgent = requestHeaders.get("user-agent") || "unknown";
  const canonicalOrigin = getCanonicalOrigin();

  return subscribeToNewsletter(
    {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      company: String(formData.get("company") ?? ""),
      consent: formData.get("consent") === "on",
    },
    { origin, userAgent },
    {
      async consumeRateLimit(context) {
        const originHash = createHmac("sha256", hashSecret)
          .update(`${context.origin}|${context.userAgent}`)
          .digest("hex");
        const { data, error } = await admin.rpc("consume_marketing_rate_limit", { p_origin_hash: originHash });
        if (error) throw error;
        return data === true;
      },
      async upsertSubscriber(input) {
        const { data: existing, error: readError } = await admin
          .from("marketing_subscribers")
          .select("unsubscribed_at")
          .eq("email", input.email)
          .maybeSingle();
        if (readError) throw readError;

        const { error } = await admin.from("marketing_subscribers").upsert(
          {
            email: input.email,
            display_name: input.name || null,
            consented_at: input.consentedAt.toISOString(),
            source: "landing_prompt_kit",
            unsubscribed_at: null,
          },
          { onConflict: "email" },
        );
        if (error) throw error;
        return { alreadySubscribed: Boolean(existing && !existing.unsubscribed_at) };
      },
      createDownloadUrl(email) {
        const token = createDownloadToken(email, downloadSecret);
        return `${canonicalOrigin}/api/marketing/kit?token=${encodeURIComponent(token)}`;
      },
      createUnsubscribeUrl(email) {
        const token = createUnsubscribeToken(email, downloadSecret);
        return `${canonicalOrigin}/api/marketing/unsubscribe?token=${encodeURIComponent(token)}`;
      },
      sendEmail: sendPromptKitEmail,
    },
  );
}
