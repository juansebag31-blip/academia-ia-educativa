import type { Metadata } from "next";
import { LandingPage } from "@/components/marketing/landing-page";
import { subscribeNewsletterAction } from "@/lib/marketing/actions";
import { buildCourseJsonLd, getCanonicalOrigin } from "@/lib/marketing/seo";

export const metadata: Metadata = {
  title: "Curso de inteligencia artificial gratis para docentes y estudiantes",
  description: "Aprendé IA y NotebookLM con 11 módulos gratuitos, actividades, exámenes y recursos para enseñar y estudiar mejor.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    title: "Curso gratuito de IA para docentes y estudiantes",
    description: "Aprendé inteligencia artificial y NotebookLM con una ruta gratuita de 11 módulos y 33 lecciones.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Academia IA Educativa" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Curso gratuito de IA para docentes y estudiantes",
    description: "11 módulos para aprender IA y NotebookLM con criterio y fuentes confiables.",
    images: ["/opengraph-image"],
  },
};

export default function MarketingHomePage() {
  const courseJsonLd = buildCourseJsonLd(getCanonicalOrigin());

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd).replace(/</g, "\\u003c") }}
      />
      <LandingPage newsletterAction={subscribeNewsletterAction} />
    </>
  );
}
