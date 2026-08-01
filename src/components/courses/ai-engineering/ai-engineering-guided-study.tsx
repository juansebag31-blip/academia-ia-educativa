"use client";

import Image from "next/image";
import {
  Download,
  FileAudio,
  FileImage,
  Maximize2,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AiEngineeringAudioPlayer } from "./ai-engineering-audio-player";

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.25;

export function AiEngineeringGuidedStudy({
  courseSlug,
  moduleSlug,
  infographicSrc,
  infographicAlt,
  infographicTitle,
  audioSrc,
  audioType,
  audioTitle,
  audioUnitId,
  audioScript,
  infographicCompletion,
  audioCompletion,
}: {
  courseSlug: string;
  moduleSlug: string;
  infographicSrc: string;
  infographicAlt: string;
  infographicTitle: string;
  audioSrc: string;
  audioType: string;
  audioTitle: string;
  audioUnitId: string;
  audioScript: string;
  infographicCompletion: ReactNode;
  audioCompletion: ReactNode;
}) {
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleFullscreenChange() {
      if (!document.fullscreenElement && expanded) setExpanded(false);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    const opener = openerRef.current;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      opener?.focus();
    };
  }, [expanded]);

  async function enterExpandedView() {
    setExpanded(true);
    try {
      await containerRef.current?.requestFullscreen?.();
    } catch {
      // The fixed-position fallback keeps the same accessible controls.
    }
  }

  async function exitExpandedView() {
    if (document.fullscreenElement) await document.exitFullscreen();
    setExpanded(false);
  }

  function updateZoom(nextZoom: number) {
    setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom)));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && expanded) {
      event.preventDefault();
      void exitExpandedView();
      return;
    }

    if (!expanded || event.key !== "Tab") return;
    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], audio[controls], summary, [tabindex]:not([tabindex="-1"])',
      ),
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleInfographicKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      updateZoom(zoom + ZOOM_STEP);
    } else if (event.key === "-") {
      event.preventDefault();
      updateZoom(zoom - ZOOM_STEP);
    } else if (event.key === "0") {
      event.preventDefault();
      updateZoom(MIN_ZOOM);
    }
  }

  const zoomPercent = Math.round(zoom * 100);

  return (
    <section
      aria-labelledby="estudio-guiado-title"
      className="overflow-hidden rounded-3xl border border-[#0f766e]/20 bg-white shadow-card"
    >
      <div className="border-b border-[#0f766e]/15 bg-[linear-gradient(135deg,#e8f5f2,#f8fbfa)] p-5 sm:p-7">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f766e]">Guía pedagógica</p>
        <h2 id="estudio-guiado-title" className="mt-2 text-2xl font-black text-[#0b1f33]">
          Estudio visual y auditivo
        </h2>
        <p className="mt-3 max-w-4xl leading-7 text-slate-700">
          Abre la infografía, inicia el audio y sigue visualmente los bloques explicados. Pausa al finalizar cada sección, identifica la relación principal y trata de explicarla con tus propias palabras antes de continuar.
        </p>
      </div>

      <div
        ref={containerRef}
        role={expanded ? "dialog" : undefined}
        aria-modal={expanded ? "true" : undefined}
        aria-label={expanded ? "Estudio guiado ampliado" : undefined}
        onKeyDown={handleKeyDown}
        className={expanded
          ? "fixed inset-0 z-[110] overflow-auto bg-[#eef7f5] p-3 sm:p-5"
          : "bg-white p-4 sm:p-6"}
      >
        <div className={expanded ? "mx-auto max-w-[1500px]" : ""}>
          {expanded ? (
            <div className="mb-3 flex justify-end">
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => void exitExpandedView()}
                className="focus-ring inline-flex items-center gap-2 rounded-xl bg-[#0b1f33] px-4 py-2.5 text-sm font-black text-white"
              >
                <Minimize2 size={18} aria-hidden="true" />
                Cerrar vista ampliada
              </button>
            </div>
          ) : null}

          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,.65fr)]">
            <article
              id="infografia"
              aria-labelledby="infografia-title"
              className="scroll-mt-28 min-w-0 rounded-2xl border border-slate-200 bg-[#f5f8f7] p-4 sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#0f766e]">
                    <FileImage size={17} aria-hidden="true" />
                    Infografía
                  </p>
                  <h3
                    id="infografia-title"
                    aria-label={`Infografía: ${infographicTitle}`}
                    className="mt-1 text-xl font-black text-[#0b1f33]"
                  >
                    {infographicTitle}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2" aria-label="Controles de ampliación">
                  <ControlButton
                    label="Alejar infografía"
                    onClick={() => updateZoom(zoom - ZOOM_STEP)}
                    disabled={zoom <= MIN_ZOOM}
                    icon={<ZoomOut size={18} aria-hidden="true" />}
                  />
                  <ControlButton
                    label="Restablecer zoom"
                    onClick={() => updateZoom(MIN_ZOOM)}
                    disabled={zoom === MIN_ZOOM}
                    icon={<RotateCcw size={18} aria-hidden="true" />}
                  />
                  <ControlButton
                    label="Acercar infografía"
                    onClick={() => updateZoom(zoom + ZOOM_STEP)}
                    disabled={zoom >= MAX_ZOOM}
                    icon={<ZoomIn size={18} aria-hidden="true" />}
                  />
                  <button
                    ref={openerRef}
                    type="button"
                    onClick={() => void enterExpandedView()}
                    tabIndex={expanded ? -1 : 0}
                    aria-hidden={expanded ? "true" : undefined}
                    className={expanded
                      ? "sr-only"
                      : "focus-ring inline-flex items-center gap-2 rounded-xl bg-[#0f766e] px-3 py-2 text-xs font-black text-white"}
                    aria-label="Abrir infografía y audio a pantalla completa"
                  >
                    <Maximize2 size={18} aria-hidden="true" />
                    Pantalla completa
                  </button>
                </div>
              </div>

              <p className="sr-only" aria-live="polite">Zoom de la infografía: {zoomPercent} %.</p>
              <div
                tabIndex={0}
                onKeyDown={handleInfographicKeyDown}
                aria-label={`Infografía interactiva. Zoom actual: ${zoomPercent} %. Usa más, menos o cero para ajustar.`}
                className="focus-ring mt-4 h-[62vh] min-h-[26rem] max-h-[52rem] overflow-auto rounded-xl border border-[#0f766e]/20 bg-[#071a2b]"
              >
                <div
                  className="relative mx-auto min-h-full min-w-full"
                  style={{
                    width: `${zoomPercent}%`,
                    height: `${Math.max(100, zoomPercent)}%`,
                    minHeight: `${Math.round(62 * zoom)}vh`,
                  }}
                >
                  <Image
                    src={infographicSrc}
                    alt={infographicAlt}
                    fill
                    sizes={expanded ? "80vw" : "(max-width: 1024px) 92vw, 62vw"}
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold text-slate-600">
                  Atajos: <kbd className="font-mono">+</kbd>, <kbd className="font-mono">−</kbd> y <kbd className="font-mono">0</kbd>.
                </p>
                <a
                  href={infographicSrc}
                  download
                  className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700"
                >
                  <Download size={18} aria-hidden="true" />
                  Descargar PNG
                </a>
              </div>
              {infographicCompletion}
            </article>

            <article
              id="audio"
              aria-labelledby="audio-title"
              className="scroll-mt-28 min-w-0 rounded-2xl border border-[#0f766e]/20 bg-[#0b1f33] p-4 text-white sm:p-5 lg:sticky lg:top-4"
            >
              <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#5eead4]">
                <FileAudio size={17} aria-hidden="true" />
                Audio
              </p>
              <h3 id="audio-title" className="mt-1 text-xl font-black">Audio explicativo</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Reproduce, pausa y retoma el audio mientras recorres la infografía.
              </p>

              <div className="mt-4 overflow-hidden rounded-xl border border-white/15">
                <AiEngineeringAudioPlayer
                  courseSlug={courseSlug}
                  moduleSlug={moduleSlug}
                  src={audioSrc}
                  type={audioType}
                  title={audioTitle}
                  unitId={audioUnitId}
                />
              </div>

              <details className="group mt-4 rounded-xl border border-white/15 bg-white/5">
                <summary className="focus-ring cursor-pointer list-none rounded-xl px-4 py-3 font-black marker:content-none">
                  <span className="flex items-center justify-between gap-3">
                    Guion o transcripción
                    <span aria-hidden="true" className="text-[#5eead4] group-open:rotate-45 motion-reduce:transition-none">+</span>
                  </span>
                </summary>
                <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap border-t border-white/15 p-4 font-sans text-sm leading-7 text-slate-200">
                  {audioScript}
                </pre>
              </details>

              <div className="[&>div]:border-white/15 [&>div]:bg-white/10 [&_span]:text-white">
                {audioCompletion}
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

function ControlButton({
  label,
  onClick,
  disabled,
  icon,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="focus-ring inline-flex size-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-[#0b1f33] disabled:cursor-default disabled:opacity-40"
    >
      {icon}
    </button>
  );
}
