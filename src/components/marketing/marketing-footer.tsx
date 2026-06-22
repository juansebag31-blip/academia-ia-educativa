import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#050714] py-12 text-sm text-slate-400">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="font-black text-white">ACADEMIA<span className="text-[#789cff]">/IA</span></p>
          <p className="mt-3 max-w-xl leading-6">Curso gratuito de inteligencia artificial aplicada a la educación con NotebookLM.</p>
        </div>
        <nav className="flex flex-wrap gap-5" aria-label="Enlaces legales">
          <Link href="/dashboard" className="focus-ring rounded hover:text-white">Curso</Link>
          <Link href="/privacy" className="focus-ring rounded hover:text-white">Privacidad</Link>
          <Link href="/unsubscribe" className="focus-ring rounded hover:text-white">Darse de baja</Link>
        </nav>
      </div>
    </footer>
  );
}
