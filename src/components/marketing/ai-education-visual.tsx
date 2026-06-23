const neuralNodes = [
  { cx: 132, cy: 104, r: 5 },
  { cx: 204, cy: 78, r: 4 },
  { cx: 274, cy: 126, r: 6 },
  { cx: 336, cy: 88, r: 4 },
  { cx: 388, cy: 166, r: 5 },
  { cx: 306, cy: 226, r: 5 },
  { cx: 218, cy: 202, r: 4 },
  { cx: 152, cy: 258, r: 5 },
] as const;

const neuralLines = [
  "132 104 204 78",
  "204 78 274 126",
  "274 126 336 88",
  "274 126 388 166",
  "388 166 306 226",
  "306 226 218 202",
  "218 202 152 258",
  "218 202 132 104",
] as const;

export function AiEducationVisual() {
  return (
    <div
      className="ai-education-visual relative mx-auto aspect-square w-full max-w-[34rem]"
      role="img"
      aria-label="Visual animado de inteligencia artificial aplicada a la educación"
    >
      <div className="absolute inset-2 rounded-[2.5rem] border border-white/10 bg-white/[0.035] shadow-[0_24px_100px_rgba(8,14,44,0.7)] backdrop-blur-xl" />
      <div className="ai-orb absolute left-[16%] top-[10%] h-[68%] w-[68%] rounded-full border border-blue-200/25 bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.55),rgba(126,159,255,0.28)_22%,rgba(244,60,176,0.24)_52%,rgba(14,22,64,0.84)_76%)] shadow-[0_0_110px_rgba(70,120,255,0.38),inset_0_0_70px_rgba(255,255,255,0.12)]" />
      <div className="ai-orbit absolute left-[8%] top-[8%] h-[78%] w-[78%] rounded-full border border-blue-300/25" />
      <div className="ai-orbit ai-orbit-delayed absolute left-[5%] top-[21%] h-[54%] w-[88%] rounded-full border border-fuchsia-300/25" />

      <svg className="ai-network absolute inset-0 h-full w-full" viewBox="0 0 520 520" aria-hidden="true">
        <defs>
          <linearGradient id="networkLine" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#9bb7ff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#f763bc" stopOpacity="0.75" />
          </linearGradient>
          <filter id="nodeGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {neuralLines.map((points) => {
          const [x1, y1, x2, y2] = points.split(" ");
          return (
            <line
              key={points}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="url(#networkLine)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          );
        })}
        {neuralNodes.map((node) => (
          <circle key={`${node.cx}-${node.cy}`} {...node} fill="#dbe7ff" filter="url(#nodeGlow)" />
        ))}
      </svg>

      <div className="ai-card absolute bottom-[13%] left-[4%] w-[56%] rounded-3xl border border-white/15 bg-[#0d1538]/90 p-4 shadow-2xl shadow-black/30 backdrop-blur-md sm:p-5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.9)]" />
          <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-blue-200">Clase con IA</p>
        </div>
        <p className="mt-3 text-xl font-black leading-none text-white sm:text-2xl">Aprender con fuentes</p>
        <div className="mt-4 space-y-2">
          <span className="block h-2 rounded-full bg-blue-200/70" />
          <span className="block h-2 w-4/5 rounded-full bg-fuchsia-200/55" />
          <span className="block h-2 w-2/3 rounded-full bg-white/25" />
        </div>
      </div>

      <div className="ai-chip absolute right-[5%] top-[17%] rounded-2xl border border-blue-200/25 bg-blue-300/10 px-4 py-3 shadow-xl shadow-blue-950/30 backdrop-blur-md">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-blue-100">NotebookLM</p>
        <p className="mt-1 text-sm font-black text-white">resumir · verificar</p>
      </div>

      <div className="ai-cursor absolute right-[18%] top-[50%] h-16 w-16 rotate-[-18deg] rounded-[1.2rem] border border-white/25 bg-white/12 shadow-[0_0_36px_rgba(247,99,188,0.32)] backdrop-blur-md">
        <span className="absolute left-5 top-3 h-8 w-5 rounded-full border border-white/70 bg-white/20" />
      </div>
    </div>
  );
}
