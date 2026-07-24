import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  MonitorSmartphone,
  ServerCog,
  ShieldCheck,
  UserRound,
  Workflow,
} from "lucide-react";

export function AiEngineeringSystemVisual({ variant = "light" }: { variant?: "light" | "hero" }) {
  const hero = variant === "hero";
  return (
    <figure className={`rounded-3xl border p-5 sm:p-7 ${
      hero
        ? "border-[#5eead4]/20 bg-white/8 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur"
        : "border-[#0f766e]/20 bg-white shadow-[0_20px_60px_rgba(11,31,51,0.10)]"
    }`}>
      <figcaption className="mb-5">
        <p className={`text-xs font-black uppercase tracking-[0.18em] ${hero ? "text-[#5eead4]" : "text-[#0f766e]"}`}>Arquitectura de un sistema inteligente</p>
        <p className={`mt-2 text-sm leading-6 ${hero ? "text-slate-300" : "text-slate-600"}`}>Del usuario a una respuesta controlada y verificable.</p>
      </figcaption>

      <div
        className="grid grid-cols-[minmax(0,1fr)_32px_minmax(0,1fr)] items-center gap-x-2 gap-y-2"
        role="img"
        aria-label="Usuario, Interfaz, Backend, Orquestador, Modelo RAG Herramientas y Validación humana"
      >
        <SystemNode icon={<UserRound />} label="Usuario" number="01" hero={hero} />
        <FlowArrow direction="right" />
        <SystemNode icon={<MonitorSmartphone />} label="Interfaz" number="02" hero={hero} />

        <span />
        <span />
        <FlowArrow direction="down" />

        <SystemNode icon={<Workflow />} label="Orquestador" number="04" hero={hero} />
        <FlowArrow direction="left" />
        <SystemNode icon={<ServerCog />} label="Backend" number="03" hero={hero} />

        <FlowArrow direction="down" />
        <span />
        <span />

        <SystemNode icon={<BrainCircuit />} label="Modelo / RAG / Herramientas" number="05" hero={hero} />
        <FlowArrow direction="right" />
        <SystemNode icon={<ShieldCheck />} label="Validación humana" number="06" hero={hero} />
      </div>
    </figure>
  );
}

function SystemNode({ icon, label, number, hero }: { icon: React.ReactNode; label: string; number: string; hero: boolean }) {
  return (
    <div className={`min-h-24 rounded-2xl border p-3 sm:p-4 ${
      hero ? "border-white/10 bg-[#0b1f33]/75" : "border-slate-200 bg-[#f3f7f6]"
    }`}>
      <div className="flex items-start justify-between gap-2">
        <span className={`flex size-9 items-center justify-center rounded-xl ${hero ? "bg-[#0f766e] text-white" : "bg-[#0b1f33] text-white"}`}>{icon}</span>
        <span className={`font-mono text-[10px] font-black ${hero ? "text-[#5eead4]" : "text-[#0f766e]"}`}>{number}</span>
      </div>
      <p className={`mt-3 text-sm font-black leading-5 ${hero ? "text-white" : "text-[#0b1f33]"}`}>{label}</p>
    </div>
  );
}

function FlowArrow({ direction }: { direction: "right" | "left" | "down" }) {
  const Icon = direction === "right" ? ArrowRight : direction === "left" ? ArrowLeft : ArrowDown;
  return (
    <span className="flex items-center justify-center text-[#14b8a6]" aria-hidden="true">
      <Icon size={20} strokeWidth={2.5} />
    </span>
  );
}
