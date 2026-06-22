"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Download, LoaderCircle } from "lucide-react";
import type { NewsletterActionState } from "@/lib/marketing/actions";
import { trackMarketingEvent } from "@/lib/marketing/analytics";

export type NewsletterAction = (state: NewsletterActionState, formData: FormData) => Promise<NewsletterActionState>;

const unavailableAction: NewsletterAction = async () => ({
  status: "unavailable",
  message: "El formulario no está conectado en esta vista.",
});

export function NewsletterForm({ action = unavailableAction }: { action?: NewsletterAction }) {
  const [state, formAction] = useActionState(action, { status: "idle" });
  const success = state.status === "success" || state.status === "already_subscribed";

  useEffect(() => {
    if (success) trackMarketingEvent("newsletter_subscribed");
  }, [success]);

  return (
    <form action={formAction} className="rounded-3xl border border-white/15 bg-neural-night/80 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8">
      <Download className="text-pink-300" size={28} aria-hidden="true" />
      <h3 className="mt-5 text-xl font-black">Recibí el kit gratis en tu correo</h3>
      <p className="mt-3 leading-7 text-slate-300">El curso seguirá abierto sin registro. Tu correo se usa para enviarte el recurso y novedades relacionadas.</p>

      <div className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm font-bold text-slate-200">
          Nombre (opcional)
          <input name="name" autoComplete="name" maxLength={80} className="focus-ring rounded-xl border border-white/15 bg-white/10 px-4 py-3 font-medium text-white placeholder:text-slate-500" placeholder="Tu nombre" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-200">
          Correo electrónico
          <input name="email" type="email" autoComplete="email" required className="focus-ring rounded-xl border border-white/15 bg-white/10 px-4 py-3 font-medium text-white placeholder:text-slate-500" placeholder="tu@email.com" />
        </label>
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <label>Empresa<input name="company" tabIndex={-1} autoComplete="off" /></label>
        </div>
        <label className="flex items-start gap-3 text-sm leading-6 text-slate-300">
          <input name="consent" type="checkbox" required className="focus-ring mt-1 h-4 w-4 rounded border-white/30 accent-blue-500" />
          <span>Acepto la <Link href="/privacy" className="font-bold text-blue-200 underline underline-offset-4">política de privacidad</Link> y recibir el recurso.</span>
        </label>
      </div>

      <SubmitButton />

      <div role="status" aria-live="polite" className="mt-4 min-h-7 text-sm leading-6">
        {success ? (
          <div className="rounded-xl border border-emerald-300/30 bg-emerald-300/10 p-4 text-emerald-100">
            <p className="font-bold">Tu kit está listo{state.emailSent ? " y también fue enviado por correo" : ""}.</p>
            <a href={state.downloadUrl} onClick={() => trackMarketingEvent("prompt_kit_download")} className="focus-ring mt-3 inline-flex rounded-lg bg-white px-4 py-2 font-black text-neural-night">Descargar el kit</a>
          </div>
        ) : "message" in state ? (
          <p className="rounded-xl border border-rose-300/30 bg-rose-300/10 p-3 font-semibold text-rose-100">{state.message}</p>
        ) : null}
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neural-blue to-neural-magenta px-5 py-4 text-sm font-black text-white disabled:cursor-wait disabled:opacity-70">
      {pending ? <LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> : null}
      {pending ? "Preparando tu kit…" : "Quiero mi kit de prompts"}
    </button>
  );
}
