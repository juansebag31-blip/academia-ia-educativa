import { validateEmail } from "@/lib/auth/validation";

export type NewsletterInput = {
  email: string;
  name: string;
  consent: boolean;
  company: string;
};

export type ValidNewsletterInput = {
  email: string;
  name: string;
  consent: true;
};

export type NewsletterResult =
  | { status: "success" | "already_subscribed"; downloadUrl: string; emailSent: boolean }
  | { status: "invalid" | "rate_limited" | "unavailable"; message: string };

type RequestContext = {
  origin: string;
  userAgent: string;
};

type NewsletterDependencies = {
  consumeRateLimit(context: RequestContext): Promise<boolean>;
  upsertSubscriber(input: { email: string; name: string; consentedAt: Date }): Promise<{ alreadySubscribed: boolean }>;
  createDownloadUrl(email: string): string;
  createUnsubscribeUrl(email: string): string;
  sendEmail(input: { email: string; downloadUrl: string; unsubscribeUrl: string }): Promise<boolean>;
  now?: () => Date;
};

type ValidationResult =
  | { ok: true; value: ValidNewsletterInput }
  | { ok: false; message: string };

export function validateNewsletterInput(input: NewsletterInput): ValidationResult {
  if (input.company.trim()) {
    return { ok: false, message: "No pudimos procesar la solicitud." };
  }

  const email = validateEmail(input.email);
  if (!email.ok) return email;

  const name = input.name.trim();
  if (name.length > 80) {
    return { ok: false, message: "El nombre no puede superar los 80 caracteres." };
  }

  if (!input.consent) {
    return { ok: false, message: "Aceptá la política de privacidad para recibir el recurso." };
  }

  return { ok: true, value: { email: email.value, name, consent: true } };
}

export async function subscribeToNewsletter(
  input: NewsletterInput,
  requestContext: RequestContext,
  dependencies: NewsletterDependencies,
): Promise<NewsletterResult> {
  const validation = validateNewsletterInput(input);
  if (!validation.ok) return { status: "invalid", message: validation.message };

  try {
    if (!(await dependencies.consumeRateLimit(requestContext))) {
      return { status: "rate_limited", message: "Demasiados intentos. Esperá unos minutos y volvé a probar." };
    }

    const subscription = await dependencies.upsertSubscriber({
      email: validation.value.email,
      name: validation.value.name,
      consentedAt: (dependencies.now ?? (() => new Date()))(),
    });
    const downloadUrl = dependencies.createDownloadUrl(validation.value.email);
    const unsubscribeUrl = dependencies.createUnsubscribeUrl(validation.value.email);
    const emailSent = await dependencies.sendEmail({
      email: validation.value.email,
      downloadUrl,
      unsubscribeUrl,
    });

    return {
      status: subscription.alreadySubscribed ? "already_subscribed" : "success",
      downloadUrl,
      emailSent,
    };
  } catch {
    return { status: "unavailable", message: "El registro no está disponible temporalmente. Intentá nuevamente." };
  }
}
