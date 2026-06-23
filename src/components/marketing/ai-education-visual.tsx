const neuralNodes = [
  { cx: 260, cy: 86, r: 5 },
  { cx: 334, cy: 126, r: 6 },
  { cx: 382, cy: 204, r: 5 },
  { cx: 326, cy: 284, r: 7 },
  { cx: 238, cy: 252, r: 5 },
  { cx: 176, cy: 178, r: 6 },
  { cx: 218, cy: 122, r: 4 },
  { cx: 286, cy: 184, r: 5 },
] as const;

const neuralConnections = [
  "260 86 334 126",
  "334 126 382 204",
  "382 204 326 284",
  "326 284 238 252",
  "238 252 176 178",
  "176 178 218 122",
  "218 122 260 86",
  "176 178 286 184",
  "286 184 334 126",
  "286 184 326 284",
] as const;

const sparks = [
  "left-[12%] top-[22%]",
  "left-[76%] top-[16%]",
  "left-[86%] top-[58%]",
  "left-[18%] top-[78%]",
] as const;

export function AiEducationVisual() {
  return (
    <div
      className="ai-education-visual relative mx-auto aspect-square w-full max-w-[31rem]"
      role="img"
      aria-label="Visual animado de inteligencia artificial aplicada a la educación"
    >
      <div className="absolute inset-4 rounded-full bg-[radial-gradient(circle_at_42%_36%,rgba(255,255,255,0.55),rgba(126,159,255,0.26)_18%,rgba(247,99,188,0.22)_48%,rgba(9,15,45,0.92)_74%)] shadow-[0_0_120px_rgba(83,125,255,0.32),inset_0_0_70px_rgba(255,255,255,0.08)]" />
      <div className="ai-orbit absolute inset-[9%] rounded-full border border-blue-200/25" />
      <div className="ai-orbit ai-orbit-delayed absolute inset-[17%] rounded-full border border-fuchsia-200/25" />
      <div className="ai-orbit ai-orbit-fast absolute inset-[3%] rounded-full border border-cyan-200/15" />

      <svg className="ai-network absolute inset-0 h-full w-full" viewBox="0 0 520 520" aria-hidden="true">
        <defs>
          <linearGradient id="heroNeuralLine" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#b9c9ff" stopOpacity="0.86" />
            <stop offset="52%" stopColor="#7e9fff" stopOpacity="0.74" />
            <stop offset="100%" stopColor="#f763bc" stopOpacity="0.78" />
          </linearGradient>
          <filter id="heroNodeGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d="M180 305 C126 266 110 181 164 128 C205 88 276 75 336 104 C402 137 436 214 414 283 C389 361 299 391 226 356"
          fill="none"
          stroke="rgba(255,255,255,0.13)"
          strokeWidth="18"
          strokeLinecap="round"
        />
        {neuralConnections.map((points) => {
          const [x1, y1, x2, y2] = points.split(" ");
          return (
            <line
              key={points}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="url(#heroNeuralLine)"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          );
        })}
        {neuralNodes.map((node) => (
          <circle key={`${node.cx}-${node.cy}`} {...node} fill="#eef4ff" filter="url(#heroNodeGlow)" />
        ))}
      </svg>

      <div className="ai-brain-label absolute left-4 top-7 rounded-2xl border border-blue-200/25 bg-[#09122f]/75 px-4 py-3 shadow-xl shadow-blue-950/30 backdrop-blur-md">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-blue-100">Red neuronal educativa</p>
        <p className="mt-1 text-sm font-black text-white">Aprendizaje con IA</p>
      </div>

      <div className="ai-education-chip absolute bottom-8 right-4 rounded-2xl border border-fuchsia-200/25 bg-[#180f35]/75 px-4 py-3 shadow-xl shadow-fuchsia-950/30 backdrop-blur-md">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-fuchsia-100">NotebookLM</p>
        <p className="mt-1 text-sm font-black text-white">fuentes · estudio · criterio</p>
      </div>

      <div className="ai-book absolute bottom-14 left-10 h-20 w-28 rotate-[-8deg] rounded-2xl border border-white/18 bg-white/10 shadow-2xl shadow-black/20 backdrop-blur-md">
        <span className="absolute left-1/2 top-3 h-14 w-px bg-white/20" />
        <span className="absolute left-4 top-5 h-2 w-9 rounded-full bg-blue-100/55" />
        <span className="absolute left-4 top-9 h-2 w-7 rounded-full bg-fuchsia-100/45" />
        <span className="absolute right-4 top-5 h-2 w-8 rounded-full bg-white/30" />
        <span className="absolute right-4 top-9 h-2 w-10 rounded-full bg-blue-100/35" />
      </div>

      {sparks.map((position) => (
        <span
          key={position}
          className={`ai-spark absolute h-2 w-2 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.9)] ${position}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
