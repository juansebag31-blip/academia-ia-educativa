const sourceCards = [
  ["PDF", "Guía de clase"],
  ["WEB", "Fuente confiable"],
  ["NOTA", "Resumen propio"],
] as const;

const networkPoints = [
  { cx: 82, cy: 74, r: 4 },
  { cx: 132, cy: 42, r: 5 },
  { cx: 198, cy: 72, r: 4 },
  { cx: 166, cy: 132, r: 6 },
  { cx: 238, cy: 154, r: 4 },
] as const;

export function AiEducationVisual() {
  return (
    <div
      className="ai-education-visual relative mx-auto w-full"
      role="img"
      aria-label="Visual animado de inteligencia artificial aplicada a la educación"
    >
      <div className="absolute -inset-6 rounded-[3rem] bg-[radial-gradient(circle_at_40%_18%,rgba(126,159,255,0.24),transparent_38%),radial-gradient(circle_at_78%_56%,rgba(247,99,188,0.22),transparent_36%)] blur-xl" />

      <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-[#0a1029]/90 p-4 shadow-[0_26px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:p-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-[0.64rem] font-black uppercase tracking-[0.22em] text-blue-200">Aula IA</p>
            <p className="mt-1 text-sm font-black text-white">Curso de inteligencia artificial</p>
          </div>
          <div className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-[0.64rem] font-black uppercase tracking-[0.18em] text-emerald-200">
            Módulo 6
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="ai-card rounded-3xl border border-white/12 bg-white/[0.055] p-4 shadow-2xl shadow-black/20">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-neural-blue to-neural-magenta text-lg font-black text-white shadow-lg shadow-blue-950/30">
                  IA
                </div>
                <div>
                  <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-blue-200">Tutor IA</p>
                  <p className="mt-1 text-xl font-black leading-tight text-white">Explica, pregunta y verifica</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <span className="block h-2 rounded-full bg-blue-200/80" />
                <span className="block h-2 w-5/6 rounded-full bg-fuchsia-200/60" />
                <span className="block h-2 w-2/3 rounded-full bg-white/25" />
              </div>
            </div>

            <div className="rounded-3xl border border-blue-200/15 bg-blue-300/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[0.64rem] font-black uppercase tracking-[0.2em] text-blue-100">Progreso</p>
                <p className="text-xs font-black text-white">72%</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <span className="ai-progress block h-full w-[72%] rounded-full bg-gradient-to-r from-neural-blue to-neural-magenta" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-white/12 bg-[#111a3d]/85 p-4">
              <p className="text-[0.64rem] font-black uppercase tracking-[0.2em] text-fuchsia-100">Fuentes verificadas</p>
              <div className="mt-3 space-y-2">
                {sourceCards.map(([label, title]) => (
                  <div key={title} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-3 py-2">
                    <span className="rounded-lg bg-white/10 px-2 py-1 text-[0.58rem] font-black text-blue-100">{label}</span>
                    <span className="text-xs font-bold text-slate-200">{title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-40 overflow-hidden rounded-3xl border border-white/12 bg-[radial-gradient(circle_at_50%_45%,rgba(126,159,255,0.28),rgba(247,99,188,0.14)_42%,rgba(255,255,255,0.04)_72%)] p-4">
              <svg className="ai-network absolute inset-0 h-full w-full" viewBox="0 0 280 180" aria-hidden="true">
                <path d="M82 74 L132 42 L198 72 L166 132 L238 154" fill="none" stroke="rgba(219,231,255,0.42)" strokeWidth="2" />
                <path d="M82 74 L166 132 L132 42" fill="none" stroke="rgba(247,99,188,0.34)" strokeWidth="2" />
                {networkPoints.map((point) => (
                  <circle key={`${point.cx}-${point.cy}`} {...point} fill="#dbe7ff" />
                ))}
              </svg>
              <div className="absolute left-5 top-5 rounded-2xl border border-white/12 bg-black/20 px-3 py-2 backdrop-blur-md">
                <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-white">Mapa neural</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
