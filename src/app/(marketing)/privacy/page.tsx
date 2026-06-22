import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Cómo Academia IA Educativa trata los datos del formulario de recursos gratuitos.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();

  return (
    <div className="marketing-page">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-8 sm:py-24">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">Información legal</p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] sm:text-6xl">Política de privacidad</h1>
        <p className="mt-5 text-lg leading-8 text-neural-muted">Esta política se aplica al formulario del kit gratuito de prompts de Academia IA Educativa.</p>

        <div className="prose prose-invert mt-12 max-w-none prose-headings:font-black prose-a:text-blue-300">
          <h2>Datos recopilados</h2>
          <p>Guardamos el correo electrónico, el nombre cuando decidís indicarlo, la fecha de consentimiento, el origen del formulario y el estado de suscripción. Para limitar abuso se conserva temporalmente un hash del origen, nunca la dirección IP en claro.</p>
          <h2>Finalidad y consentimiento</h2>
          <p>Usamos los datos para entregar el kit solicitado y enviar novedades directamente relacionadas con el curso. La base de este tratamiento es tu consentimiento explícito. El acceso al curso no depende de suscribirte.</p>
          <h2>Proveedores</h2>
          <p>Supabase almacena la lista de suscriptores. Resend procesa el envío del correo únicamente cuando la integración está configurada. No vendemos la lista ni la usamos para publicidad de terceros.</p>
          <h2>Conservación y derechos</h2>
          <p>Conservamos los datos hasta que solicites la baja. Podés pedir acceso, corrección o eliminación, y retirar tu consentimiento en cualquier momento mediante el enlace incluido en los correos.</p>
          <h2>Contacto</h2>
          <p>
            {contactEmail ? (
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            ) : (
              <a href="https://github.com/juansebag31-blip/academia-ia-educativa" target="_blank" rel="noreferrer">Repositorio oficial de Academia IA Educativa</a>
            )}
          </p>
        </div>

        <Link href="/" className="focus-ring mt-10 inline-flex rounded-xl border border-white/15 px-5 py-3 font-black hover:bg-white/10">Volver a la portada</Link>
      </main>
      <MarketingFooter />
    </div>
  );
}
