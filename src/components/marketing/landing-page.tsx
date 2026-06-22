import Link from "next/link";
import { ArrowRight, BookOpenCheck, CheckCircle2, Download, GraduationCap, SearchCheck, Sparkles } from "lucide-react";
import { courseSeed } from "@/lib/course-seed";
import { MarketingFooter } from "./marketing-footer";
import { MarketingHeader } from "./marketing-header";

export const landingStats = [
  ["11", "módulos progresivos"],
  ["33", "lecciones prácticas"],
  ["22 h", "a tu propio ritmo"],
  ["100%", "gratuito y abierto"],
] as const;

export const landingBenefits = [
  ["Comprender", "IA sin tecnicismos innecesarios", "Entendé cómo funciona, qué puede hacer y dónde están sus límites."],
  ["Aplicar", "NotebookLM para aprender y enseñar", "Trabajá con tus propias fuentes, guías, resúmenes y materiales."],
  ["Verificar", "Criterio, ética y evidencia", "Tomá decisiones responsables sin delegar tu pensamiento."],
] as const;

const benefitIcons = [GraduationCap, BookOpenCheck, SearchCheck] as const;

export function LandingPage() {
  return (
    <div className="marketing-page">
      <MarketingHeader />
      <main>
        <section className="neural-glow relative isolate overflow-hidden border-b border-white/10 py-20 sm:py-28 lg:py-36">
          <div className="neural-grid absolute inset-0 -z-20 opacity-50" aria-hidden="true" />
          <div className="absolute right-[-9rem] top-16 -z-10 h-80 w-80 rounded-full border border-blue-300/40 shadow-[0_0_100px_rgba(244,60,176,0.25),inset_0_0_80px_rgba(51,110,255,0.18)] sm:right-[8%] sm:h-96 sm:w-96" aria-hidden="true" />
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/40 bg-blue-400/10 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-blue-200">
              <Sparkles size={14} aria-hidden="true" /> Curso gratuito · IA + NotebookLM
            </span>
            <h1 className="mt-7 max-w-5xl text-5xl font-black leading-[0.94] tracking-[-0.065em] sm:text-7xl lg:text-[5.7rem]">
              Aprendé inteligencia artificial. <span className="text-neural-gradient">Enseñá y estudiá mejor.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg font-medium leading-8 text-neural-muted sm:text-xl">
              Una formación gratuita y práctica para docentes y estudiantes que quieren usar IA con criterio, fuentes confiables y resultados reales.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard" className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neural-blue to-neural-magenta px-6 py-4 text-sm font-black text-white shadow-2xl shadow-fuchsia-950/30 transition hover:brightness-110">
                Empezar el curso gratis <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <a href="#programa" className="focus-ring inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-4 text-sm font-black text-white transition hover:bg-white/10">Ver el programa</a>
            </div>
          </div>
        </section>

        <section aria-label="Datos del curso" className="border-b border-white/10 bg-[#0b0e24]">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-2 px-4 sm:px-8 lg:grid-cols-4">
            {landingStats.map(([value, label]) => (
              <div key={label} className="border-b border-white/10 px-3 py-7 even:border-l sm:px-6 lg:border-b-0 lg:border-l lg:first:border-l-0">
                <span className="sr-only">{value} {label}</span>
                <strong aria-hidden="true" className="block text-2xl font-black text-white sm:text-3xl">{value}</strong>
                <span aria-hidden="true" className="mt-1 block text-xs font-semibold text-slate-400 sm:text-sm">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="beneficios" className="scroll-mt-24 py-20 sm:py-28">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">Resultados concretos</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.05em] sm:text-6xl">No se trata de usar IA por usarla.</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-neural-muted">Se trata de aprender a preguntar, verificar, investigar y producir conocimiento propio.</p>
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {landingBenefits.map(([eyebrow, title, description], index) => {
                const Icon = benefitIcons[index];
                return (
                  <article key={eyebrow} className="rounded-3xl border border-white/10 bg-neural-panel p-6 shadow-2xl shadow-black/10 sm:p-8">
                    <Icon className="text-blue-300" size={28} aria-hidden="true" />
                    <p className="mt-9 text-xs font-black uppercase tracking-[0.16em] text-blue-300">0{index + 1} · {eyebrow}</p>
                    <h3 className="mt-3 text-xl font-black text-white">{title}</h3>
                    <p className="mt-3 leading-7 text-slate-400">{description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="programa" className="scroll-mt-24 bg-[#f7f8ff] py-20 text-[#111733] sm:py-28">
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-8 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Programa completo</p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] sm:text-6xl">Una ruta desde cero hasta un proyecto real.</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">Cada módulo combina explicación, fuentes, práctica, examen y certificado.</p>
              <Link href="/modules" className="focus-ring mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neural-blue to-neural-magenta px-5 py-4 text-sm font-black text-white shadow-xl shadow-blue-900/20">
                Explorar los 11 módulos <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
            <ol className="grid gap-3 sm:grid-cols-2">
              {courseSeed.modules.map((courseModule) => (
                <li key={courseModule.slug} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <Link href={`/courses/${courseSeed.slug}/modules/${courseModule.slug}`} className="focus-ring group flex h-full items-start gap-3 rounded-lg">
                    <span className="text-sm font-black text-blue-600">{String(courseModule.order).padStart(2, "0")}</span>
                    <span className="text-sm font-bold leading-6 text-slate-800 group-hover:text-blue-700">{courseModule.title.replace(/^Módulo \d+ - /, "")}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="kit" className="relative overflow-hidden bg-gradient-to-br from-[#14215d] via-[#34205d] to-[#651e61] py-20 sm:py-24">
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-200">Recurso gratuito</p>
              <h2 className="mt-4 max-w-2xl text-4xl font-black tracking-[-0.055em] sm:text-6xl">Tu kit de prompts para enseñar y estudiar con IA.</h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-100/75">Prompts listos para planificar clases, comprender textos, estudiar mejor y verificar respuestas.</p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-neural-night/80 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8">
              <Download className="text-pink-300" size={28} aria-hidden="true" />
              <h3 className="mt-5 text-xl font-black">Recibí el kit gratis en tu correo</h3>
              <p className="mt-3 leading-7 text-slate-300">La descarga se habilitará después de registrar tu correo. El curso seguirá abierto sin registro.</p>
              <a href="#kit" className="focus-ring mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-neural-blue to-neural-magenta px-5 py-4 text-sm font-black">Quiero mi kit de prompts</a>
            </div>
          </div>
        </section>

        <section id="preguntas" className="scroll-mt-24 py-20 sm:py-28">
          <div className="mx-auto w-full max-w-4xl px-4 sm:px-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">Preguntas frecuentes</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] sm:text-6xl">Antes de empezar.</h2>
            <div className="mt-10 space-y-3">
              {["¿El curso es realmente gratuito?", "¿Necesito conocimientos previos?", "¿Está pensado para docentes o estudiantes?", "¿Incluye certificados?", "¿Qué es NotebookLM y para qué sirve?"].map((question) => (
                <div key={question} className="flex items-center justify-between rounded-2xl border border-white/10 bg-neural-panel px-5 py-5 font-bold">
                  <span>{question}</span><CheckCircle2 className="shrink-0 text-blue-300" size={19} aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
