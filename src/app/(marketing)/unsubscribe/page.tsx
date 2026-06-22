import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";

export const metadata: Metadata = {
  title: "Gestionar suscripción",
  robots: { index: false, follow: false },
};

const messages = {
  success: ["Baja confirmada", "Tu correo fue dado de baja. No recibirás nuevas comunicaciones."],
  invalid: ["El enlace no es válido", "El enlace de baja está vencido o fue modificado."],
  error: ["No pudimos completar la baja", "Ocurrió un error temporal. Intentá nuevamente desde el enlace del correo."],
} as const;

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const message = messages[status as keyof typeof messages] ?? ["Gestionar suscripción", "Usá el enlace personal incluido en uno de nuestros correos para darte de baja."];

  return (
    <div className="marketing-page">
      <MarketingHeader />
      <main className="mx-auto flex min-h-[65vh] w-full max-w-3xl items-center px-4 py-16 sm:px-8">
        <section className="w-full rounded-3xl border border-white/10 bg-neural-panel p-8 shadow-2xl shadow-black/20 sm:p-12">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">Suscripción</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.05em]">{message[0]}</h1>
          <p className="mt-5 text-lg leading-8 text-neural-muted">{message[1]}</p>
          <Link href="/" className="focus-ring mt-8 inline-flex rounded-xl bg-gradient-to-r from-neural-blue to-neural-magenta px-5 py-3 font-black">Volver a Academia IA</Link>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
