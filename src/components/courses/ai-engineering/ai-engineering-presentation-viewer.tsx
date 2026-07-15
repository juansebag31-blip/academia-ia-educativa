"use client";

import Image from "next/image";
import { forwardRef, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Expand,
  FileSliders,
  Minimize2,
  Play,
  X,
} from "lucide-react";
import type { AiEngineeringPresentationConfig } from "@/lib/courses/ai-engineering/module-presentations";

export function AiEngineeringPresentationViewer({
  presentation,
  downloadHref,
}: {
  presentation: AiEngineeringPresentationConfig;
  downloadHref: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveIndex((current) => Math.min(current + 1, presentation.slides.length - 1));
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex((current) => Math.max(current - 1, 0));
      }
      if (event.key === "Escape") {
        if (isFullscreen) setIsFullscreen(false);
        else setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, isOpen, presentation.slides.length]);

  useEffect(() => {
    if (!isFullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    viewerRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFullscreen]);

  const closeViewer = () => {
    setIsFullscreen(false);
    setIsOpen(false);
  };

  const viewer = (
    <PresentationSurface
      ref={viewerRef}
      presentation={presentation}
      activeIndex={activeIndex}
      isFullscreen={isFullscreen}
      onPrevious={() => setActiveIndex((current) => Math.max(current - 1, 0))}
      onNext={() => setActiveIndex((current) => Math.min(current + 1, presentation.slides.length - 1))}
      onFullscreen={() => setIsFullscreen((current) => !current)}
      onClose={closeViewer}
      downloadHref={downloadHref}
    />
  );

  return (
    <div>
      <div className="flex flex-col gap-5 rounded-2xl border border-[#0f766e]/20 bg-[#f3f7f6] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#0b1f33] text-white">
            <FileSliders aria-hidden="true" />
          </span>
          <div>
            <p className="font-black text-slate-950">Módulo 1 · Presentación interactiva</p>
            <p className="mt-1 text-sm text-slate-600">17 diapositivas exportadas desde el PPTX original.</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-5 py-3 text-sm font-black text-white hover:bg-[#0b5f59]"
          >
            <Play size={18} aria-hidden="true" />
            Abrir presentación
          </button>
          <a
            href={downloadHref}
            download
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-[#0f766e]/30 bg-white px-5 py-3 text-sm font-black text-[#0f766e] hover:bg-[#e8f5f2]"
          >
            <Download size={18} aria-hidden="true" />
            Descargar PPTX
          </a>
        </div>
      </div>

      {isOpen && !isFullscreen ? <div className="mt-5">{viewer}</div> : null}
      {isOpen && isFullscreen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Presentación en pantalla completa"
          className="fixed inset-0 z-[110] flex items-center justify-center bg-[#061423]/95 p-2 sm:p-5"
        >
          {viewer}
        </div>
      ) : null}
    </div>
  );
}

const PresentationSurface = forwardRef<
  HTMLDivElement,
  {
    presentation: AiEngineeringPresentationConfig;
    activeIndex: number;
    isFullscreen: boolean;
    onPrevious: () => void;
    onNext: () => void;
    onFullscreen: () => void;
    onClose: () => void;
    downloadHref: string;
  }
>(function PresentationSurface(
  {
    presentation,
    activeIndex,
    isFullscreen,
    onPrevious,
    onNext,
    onFullscreen,
    onClose,
    downloadHref,
  },
  ref,
) {
  const slide = presentation.slides[activeIndex];
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === presentation.slides.length - 1;

  return (
    <div
      ref={ref}
      tabIndex={-1}
      aria-label={presentation.title}
      className={`w-full overflow-hidden rounded-2xl border border-white/15 bg-[#0b1f33] text-white shadow-2xl outline-none ${
        isFullscreen ? "max-h-full max-w-[1500px]" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="truncate text-xs font-black uppercase tracking-[0.12em] text-[#5eead4]">Presentación del módulo</p>
          <p className="sr-only">Usa las flechas izquierda y derecha para cambiar de diapositiva. Escape cierra la vista.</p>
        </div>
        <div className="flex items-center gap-1.5">
          <a
            href={downloadHref}
            download
            className="focus-ring hidden items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold sm:inline-flex"
          >
            <Download size={15} aria-hidden="true" />
            PPTX
          </a>
          <button
            type="button"
            onClick={onFullscreen}
            className="focus-ring flex size-10 items-center justify-center rounded-lg border border-white/15 bg-white/10"
            aria-label={isFullscreen ? "Salir de pantalla completa" : "Abrir en pantalla completa"}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Expand size={18} />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring flex size-10 items-center justify-center rounded-lg border border-white/15 bg-white/10"
            aria-label="Cerrar presentación"
          >
            <X size={19} />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 items-center justify-center bg-[#061423] p-2 sm:p-4">
        <Image
          key={slide.id}
          src={slide.publicPath}
          alt={slide.alt}
          width={slide.width}
          height={slide.height}
          className={`h-auto w-full object-contain ${isFullscreen ? "max-h-[calc(100vh-10rem)]" : ""}`}
          priority={activeIndex === 0}
        />
      </div>

      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-t border-white/10 px-3 py-3 sm:px-5">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirst}
          aria-label="Diapositiva anterior"
          className="focus-ring inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          <span className="hidden sm:inline">Anterior</span>
        </button>
        <p aria-live="polite" className="text-center text-sm font-black">
          Diapositiva {activeIndex + 1} de {presentation.slides.length}
        </p>
        <button
          type="button"
          onClick={onNext}
          disabled={isLast}
          aria-label="Diapositiva siguiente"
          className="focus-ring inline-flex items-center gap-2 rounded-lg bg-[#0f766e] px-3 py-2 text-sm font-black disabled:cursor-not-allowed disabled:opacity-35"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ArrowRight size={17} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
});
