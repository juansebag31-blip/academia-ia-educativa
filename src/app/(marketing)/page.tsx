import type { Metadata } from "next";
import { LandingPage } from "@/components/marketing/landing-page";

export const metadata: Metadata = {
  title: "Curso de inteligencia artificial gratis para docentes y estudiantes",
  description: "Aprendé IA y NotebookLM con 11 módulos gratuitos, actividades, exámenes y recursos para enseñar y estudiar mejor.",
  alternates: { canonical: "/" },
};

export default function MarketingHomePage() {
  return <LandingPage />;
}
