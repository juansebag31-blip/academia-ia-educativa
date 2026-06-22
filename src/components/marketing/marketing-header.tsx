import Link from "next/link";
import { ArrowUpRight, BrainCircuit } from "lucide-react";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-neural-night/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-18 w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <Link href="/" className="focus-ring flex items-center gap-3 rounded-xl" aria-label="Academia IA, inicio">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neural-blue to-neural-magenta shadow-lg shadow-blue-950/40">
            <BrainCircuit size={21} aria-hidden="true" />
          </span>
          <span className="text-base font-black tracking-[-0.04em]">ACADEMIA<span className="text-[#789cff]">/IA</span></span>
        </Link>

        <nav aria-label="Navegación de la portada" className="hidden items-center gap-6 text-sm font-bold text-slate-300 md:flex">
          <a className="focus-ring rounded-lg transition hover:text-white" href="#beneficios">Qué aprenderás</a>
          <a className="focus-ring rounded-lg transition hover:text-white" href="#programa">Programa</a>
          <a className="focus-ring rounded-lg transition hover:text-white" href="#preguntas">Preguntas</a>
        </nav>

        <Link
          href="/dashboard"
          className="focus-ring inline-flex items-center gap-2 rounded-xl border border-blue-400/50 bg-blue-500/10 px-3 py-2 text-xs font-black text-white transition hover:bg-blue-500/20 sm:px-4 sm:text-sm"
        >
          Entrar al curso
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
