import {
  AppWindow,
  Braces,
  CheckCircle2,
  ClipboardCheck,
  Cpu,
  Database,
  Eye,
  FileSearch,
  GitBranch,
  KeyRound,
  Layers3,
  RefreshCw,
  Scale,
  ShieldCheck,
  UserCheck,
  Wrench,
} from "lucide-react";
import type {
  AiEngineeringKeyIdea,
  AiEngineeringVisualComponentType,
  AiEngineeringVisualPlacement,
} from "@/lib/courses/ai-engineering/module-visuals";
import { AiEngineeringExpandableVisual } from "./ai-engineering-expandable-visual";

export function AiEngineeringKeyIdeaCard({ idea }: { idea: AiEngineeringKeyIdea }) {
  return (
    <aside
      id={idea.ideaId}
      aria-label="Idea esencial"
      className="mb-8 rounded-2xl border border-[#0f766e]/25 bg-white p-5 shadow-[0_10px_30px_rgba(11,31,51,0.06)] sm:flex sm:items-start sm:gap-4"
    >
      <span className="inline-flex shrink-0 rounded-full bg-[#0b1f33] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#5eead4]">
        Idea esencial
      </span>
      <div className="mt-3 sm:mt-0">
        {idea.title ? <p className="font-black text-[#0b1f33]">{idea.title}</p> : null}
        <p className="text-sm font-bold leading-6 text-[#0b1f33]">{idea.text}</p>
      </div>
    </aside>
  );
}

export function AiEngineeringLearningVisual({
  visual,
}: {
  visual: AiEngineeringVisualPlacement;
}) {
  if ("sourcePath" in visual) {
    return (
      <AiEngineeringExpandableVisual
        id={visual.visualId}
        src={visual.publicPath ?? visual.sourcePath}
        alt={visual.alt}
        width={visual.width}
        height={visual.height}
      />
    );
  }

  return (
    <figure
      id={visual.visualId}
      aria-labelledby={`${visual.visualId}-title`}
      aria-describedby={`${visual.visualId}-description`}
      className="my-8 scroll-mt-44 overflow-hidden rounded-3xl border border-[#0f766e]/20 bg-[linear-gradient(145deg,#f8fbfa_0%,#eef7f5_100%)] shadow-[0_16px_45px_rgba(11,31,51,0.08)] sm:scroll-mt-28"
    >
      <figcaption className="border-b border-[#0f766e]/15 px-5 py-5 sm:px-7">
        <p className="text-xs font-black uppercase tracking-[0.17em] text-[#0f766e]">
          Síntesis visual
        </p>
        <h3
          id={`${visual.visualId}-title`}
          className="mt-1 text-xl font-black tracking-tight text-[#0b1f33] sm:text-2xl"
        >
          {visual.title}
        </h3>
        <p
          id={`${visual.visualId}-description`}
          className="mt-2 max-w-3xl text-sm leading-6 text-slate-600"
        >
          {visual.description}
        </p>
      </figcaption>
      <div className="p-5 sm:p-7">{renderVisual(visual.componentType)}</div>
    </figure>
  );
}

function renderVisual(componentType: AiEngineeringVisualComponentType) {
  switch (componentType) {
    case "model-vs-system":
      return <ModelVsSystem />;
    case "workflow-vs-agent":
      return <WorkflowVsAgent />;
    case "system-components-map":
      return <SystemComponentsMap />;
    case "minimum-complexity-ladder":
      return <MinimumComplexityLadder />;
    case "imaging-study-flow":
      return <ImagingStudyFlow />;
  }
}

function ModelVsSystem() {
  const systemParts = [
    ["Interfaz", AppWindow],
    ["Datos", Database],
    ["Reglas", Braces],
    ["Herramientas", Wrench],
    ["Evaluación", ClipboardCheck],
    ["Seguridad", ShieldCheck],
    ["Supervisión", UserCheck],
  ] as const;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.72fr)_auto_minmax(0,1.28fr)] lg:items-stretch">
      <VisualPanel tone="navy" icon={<Cpu />} label="Capacidad" title="Modelo">
        Recibe una entrada y produce una salida. Es una pieza del sistema, no el producto completo.
      </VisualPanel>
      <div className="flex items-center justify-center text-[#0f766e]" aria-hidden="true">
        <span className="rounded-full border border-[#0f766e]/25 bg-white px-3 py-1.5 text-xs font-black lg:[writing-mode:vertical-rl]">
          se integra en
        </span>
      </div>
      <div className="rounded-2xl border border-[#0f766e]/25 bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#dff3ef] text-[#0f766e]">
            <Layers3 size={21} />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0f766e]">Producto completo</p>
            <h4 className="text-lg font-black text-[#0b1f33]">Sistema inteligente</h4>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {systemParts.map(([label, Icon]) => (
            <span key={label} className="flex items-center gap-2 rounded-xl bg-[#f3f7f6] px-3 py-3 text-sm font-bold text-slate-700">
              <Icon size={17} className="shrink-0 text-[#0f766e]" aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkflowVsAgent() {
  const cycle = [
    ["Observar", Eye],
    ["Decidir", GitBranch],
    ["Actuar", Wrench],
    ["Evaluar", ClipboardCheck],
  ] as const;

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-700">Secuencia definida</p>
          <h4 className="mt-1 text-lg font-black text-[#0b1f33]">Workflow</h4>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
            {["Paso definido", "Regla", "Resultado"].map((step, index) => (
              <div key={step} className="contents">
                {index > 0 ? <span className="text-center font-black text-blue-600" aria-hidden="true">→</span> : null}
                <span className="flex-1 rounded-xl border border-blue-100 bg-blue-50 px-3 py-3 text-center text-sm font-bold text-slate-700">{step}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-[#0f766e]/25 bg-white p-5">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0f766e]">Ciclo de decisión</p>
          <h4 className="mt-1 text-lg font-black text-[#0b1f33]">Agente</h4>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {cycle.map(([label, Icon], index) => (
              <span key={label} className="relative flex items-center gap-2 rounded-xl bg-[#e8f5f2] px-3 py-3 text-sm font-bold text-slate-700">
                <Icon size={17} className="text-[#0f766e]" aria-hidden="true" />
                {label}
                <span className="ml-auto text-[#0f766e]" aria-hidden="true">{index === cycle.length - 1 ? "↻" : "→"}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-black text-amber-950">
        Un agente no es automáticamente mejor: se justifica cuando una secuencia fija resulta insuficiente.
      </p>
    </div>
  );
}

function SystemComponentsMap() {
  const components = [
    ["Interfaz", "Entrada y experiencia", AppWindow],
    ["Backend", "Lógica y permisos", Braces],
    ["Modelo", "Capacidad de IA", Cpu],
    ["Contexto", "Información de la tarea", FileSearch],
    ["RAG", "Evidencia recuperada", Database],
    ["Herramientas", "Acciones externas", Wrench],
    ["Memoria", "Estado relevante", RefreshCw],
    ["Evaluación", "Calidad y utilidad", ClipboardCheck],
    ["Guardrails", "Límites y controles", ShieldCheck],
    ["Supervisión humana", "Decisión sensible", UserCheck],
  ] as const;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {components.map(([title, detail, Icon]) => (
        <div key={title} className="rounded-2xl border border-[#0f766e]/15 bg-white p-4">
          <Icon size={21} className="text-[#0f766e]" aria-hidden="true" />
          <h4 className="mt-3 text-sm font-black text-[#0b1f33]">{title}</h4>
          <p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p>
        </div>
      ))}
    </div>
  );
}

function MinimumComplexityLadder() {
  const levels = [
    ["01", "Prompt"],
    ["02", "Contexto"],
    ["03", "RAG o herramientas"],
    ["04", "Workflow"],
    ["05", "Agente"],
    ["06", "Multiagente"],
  ] as const;
  const offsets = [
    "sm:ml-0",
    "sm:ml-[4%]",
    "sm:ml-[8%]",
    "sm:ml-[12%]",
    "sm:ml-[16%]",
    "sm:ml-[20%]",
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-center">
      <ol className="grid gap-2">
        {levels.map(([number, label], index) => (
          <li
            key={number}
            className={`flex items-center gap-3 rounded-xl border border-[#0f766e]/15 bg-white px-4 py-3 ${offsets[index]}`}
          >
            <span className="font-mono text-xs font-black text-[#0f766e]">{number}</span>
            <span className="font-black text-[#0b1f33]">{label}</span>
          </li>
        ))}
      </ol>
      <div className="rounded-2xl bg-[#0b1f33] p-5 text-white">
        <Scale className="text-[#5eead4]" aria-hidden="true" />
        <p className="mt-4 text-sm font-black leading-6">
          Solo se asciende cuando el nivel anterior es insuficiente.
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-300">Más arquitectura exige una justificación concreta.</p>
      </div>
    </div>
  );
}

function ImagingStudyFlow() {
  const steps = [
    ["Pedido", FileSearch],
    ["Modelo interpreta", Cpu],
    ["RAG recupera evidencia", Database],
    ["Reglas calculan y validan", CheckCircle2],
    ["Aplicación controla permisos", KeyRound],
    ["Humano confirma", UserCheck],
  ] as const;

  return (
    <ol className="grid gap-3 lg:grid-cols-6">
      {steps.map(([label, Icon], index) => (
        <li key={label} className="relative rounded-2xl border border-[#0f766e]/20 bg-white p-4 lg:min-h-40">
          <div className="flex items-center justify-between">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#dff3ef] text-[#0f766e]">
              <Icon size={20} aria-hidden="true" />
            </span>
            <span className="font-mono text-xs font-black text-slate-600">{String(index + 1).padStart(2, "0")}</span>
          </div>
          <p className="mt-4 text-sm font-black leading-5 text-[#0b1f33]">{label}</p>
          {index < steps.length - 1 ? (
            <span className="absolute -bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-[#0f766e] px-2 text-sm text-white lg:-right-2 lg:bottom-auto lg:left-auto lg:top-1/2 lg:translate-x-0 lg:-translate-y-1/2" aria-hidden="true">→</span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function VisualPanel({
  icon,
  label,
  title,
  tone,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  tone: "navy";
  children: React.ReactNode;
}) {
  return (
    <div className={tone === "navy" ? "rounded-2xl bg-[#0b1f33] p-5 text-white" : ""}>
      <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-[#5eead4]">{icon}</span>
      <p className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-[#5eead4]">{label}</p>
      <h4 className="mt-1 text-xl font-black">{title}</h4>
      <p className="mt-3 text-sm leading-6 text-slate-300">{children}</p>
    </div>
  );
}
