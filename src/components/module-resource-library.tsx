"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  BookOpenCheck,
  Clock3,
  Download,
  Expand,
  ExternalLink,
  FileSliders,
  Headphones,
  Images,
  PlaySquare,
  X,
} from "lucide-react";
import type {
  ModuleDocumentResource,
  ModuleResourceBundle,
  ModuleVisualResource,
} from "@/lib/module-resource-bundles";

export function ModuleResourceLibrary({ bundle }: { bundle: ModuleResourceBundle }) {
  const [selectedVisual, setSelectedVisual] = useState<ModuleVisualResource | null>(null);
  const [activeDocumentId, setActiveDocumentId] = useState(bundle.documents[0].id);
  const activeDocument =
    bundle.documents.find((document) => document.id === activeDocumentId) ?? bundle.documents[0];

  useEffect(() => {
    if (!selectedVisual) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedVisual(null);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedVisual]);

  return (
    <>
      <section className="overflow-hidden border border-slate-700 bg-[#071A2B] text-white shadow-card">
        <header className="border-b border-white/10 px-5 py-5 sm:px-6">
          <p className="text-xs font-bold uppercase text-cyan-200">{bundle.eyebrow}</p>
          <h2 className="mt-2 text-2xl font-black">{bundle.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{bundle.introduction}</p>
        </header>

        <div className="grid border-b border-white/10 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
          <article className="border-b border-white/10 lg:border-b-0 lg:border-r">
            <div className="aspect-video bg-black">
              <video
                className="h-full w-full object-contain"
                controls
                preload="metadata"
                poster={bundle.media.video.poster}
              >
                <source src={bundle.media.video.src} type={bundle.media.video.type} />
                Tu navegador no puede reproducir este video.
              </video>
            </div>
            <MediaDescription
              icon={<PlaySquare size={18} />}
              kind="Video del módulo"
              title={bundle.media.video.title}
              description={bundle.media.video.description}
              duration={bundle.media.video.duration}
              href={bundle.media.video.src}
              downloadLabel="Descargar video"
            />
          </article>

          <article className="flex flex-col justify-between bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:24px_24px]">
            <div className="p-5 sm:p-6">
              <span className="flex size-12 items-center justify-center border border-cyan-200/20 bg-cyan-100/10 text-cyan-100">
                <Headphones size={24} />
              </span>
              <p className="mt-6 text-xs font-bold uppercase text-cyan-200">Audio de profundización</p>
              <h3 className="mt-2 text-2xl font-black leading-tight">{bundle.media.audio.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{bundle.media.audio.description}</p>
              <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-slate-200">
                <Clock3 size={16} className="text-cyan-200" />
                {bundle.media.audio.duration}
              </p>
            </div>
            <div className="border-t border-white/10 p-5 sm:p-6">
              <audio className="w-full" controls preload="metadata">
                <source src={bundle.media.audio.src} type={bundle.media.audio.type} />
                Tu navegador no puede reproducir este audio.
              </audio>
              <DownloadButton href={bundle.media.audio.src} label="Descargar audio" primary />
            </div>
          </article>
        </div>

        <div className="border-b border-white/10 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Images className="text-cyan-200" size={21} />
            <div>
              <h3 className="font-black">Mapas visuales del módulo</h3>
              <p className="text-sm text-slate-300">Amplía cada recurso para leerlo en su resolución original.</p>
            </div>
          </div>
        </div>

        <div className="grid border-b border-white/10 lg:grid-cols-3">
          {bundle.visuals.map((visual, index) => (
            <VisualCard
              key={visual.id}
              visual={visual}
              onOpen={() => setSelectedVisual(visual)}
              divided={index > 0}
            />
          ))}
        </div>

        <DocumentViewer
          documents={bundle.documents}
          activeDocument={activeDocument}
          onSelect={setActiveDocumentId}
        />
      </section>

      {selectedVisual ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedVisual.title} ampliada`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setSelectedVisual(null);
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedVisual(null)}
            className="focus-ring absolute right-4 top-4 z-10 flex size-11 items-center justify-center border border-white/20 bg-slate-900 text-white"
            aria-label="Cerrar recurso ampliado"
          >
            <X size={22} />
          </button>
          <div className="max-h-full w-full max-w-[1700px] overflow-auto border border-white/15 bg-[#071A2B]">
            <Image
              src={selectedVisual.src}
              alt={selectedVisual.alt}
              width={selectedVisual.width}
              height={selectedVisual.height}
              className="h-auto min-w-[1000px] w-full"
              priority
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

function VisualCard({
  visual,
  onOpen,
  divided,
}: {
  visual: ModuleVisualResource;
  onOpen: () => void;
  divided: boolean;
}) {
  return (
    <article className={divided ? "border-t border-white/10 lg:border-l lg:border-t-0" : ""}>
      <button
        type="button"
        onClick={onOpen}
        className="focus-ring group block w-full cursor-zoom-in overflow-hidden bg-slate-950"
        aria-label={`Ampliar ${visual.title}`}
      >
        <Image
          src={visual.src}
          alt={visual.alt}
          width={visual.width}
          height={visual.height}
          className="aspect-video h-auto w-full object-cover transition duration-300 group-hover:scale-[1.015]"
        />
      </button>
      <div className="p-5">
        <p className="text-xs font-bold uppercase text-cyan-200">{visual.kind}</p>
        <h4 className="mt-2 text-lg font-black leading-tight">{visual.title}</h4>
        <p className="mt-2 text-sm leading-6 text-slate-300">{visual.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpen}
            className="focus-ring inline-flex items-center gap-2 border border-white/20 bg-white/10 px-3 py-2 text-sm font-bold"
          >
            <Expand size={16} />
            Ampliar
          </button>
          <DownloadButton href={visual.src} label="Descargar" primary />
        </div>
      </div>
    </article>
  );
}

function DocumentViewer({
  documents,
  activeDocument,
  onSelect,
}: {
  documents: ModuleDocumentResource[];
  activeDocument: ModuleDocumentResource;
  onSelect: (id: string) => void;
}) {
  return (
    <article>
      <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center border border-cyan-200/20 bg-cyan-100/10 text-cyan-100">
            {activeDocument.id === "study-guide" ? <BookOpenCheck size={22} /> : <FileSliders size={22} />}
          </span>
          <div>
            <p className="text-xs font-bold uppercase text-cyan-200">
              {activeDocument.kind} · {activeDocument.pages} páginas
            </p>
            <h3 className="mt-1 text-xl font-black">{activeDocument.title}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{activeDocument.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={activeDocument.src}
            target="_blank"
            rel="noreferrer"
            className="focus-ring inline-flex items-center gap-2 border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold"
          >
            <ExternalLink size={17} />
            Abrir documento
          </a>
          <DownloadButton href={activeDocument.src} label="Descargar PDF" primary />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 border-b border-white/10 bg-slate-950/60 px-5 py-3 sm:px-6">
        {documents.map((document) => (
          <button
            key={document.id}
            type="button"
            onClick={() => onSelect(document.id)}
            className={`focus-ring px-4 py-2 text-sm font-bold ${
              document.id === activeDocument.id
                ? "bg-cyan-100 text-[#071A2B]"
                : "border border-white/15 bg-white/5 text-white"
            }`}
            aria-pressed={document.id === activeDocument.id}
          >
            {document.kind}
          </button>
        ))}
      </div>
      <iframe
        key={activeDocument.id}
        src={`${activeDocument.src}#view=FitH`}
        title={activeDocument.title}
        className="hidden h-[680px] w-full bg-slate-100 sm:block lg:h-[780px]"
      />
      <div className="bg-slate-950/60 p-5 sm:hidden">
        <p className="text-sm leading-6 text-slate-300">
          Para una lectura cómoda en el teléfono, abre el PDF en el visor de tu dispositivo.
        </p>
        <a
          href={activeDocument.src}
          target="_blank"
          rel="noreferrer"
          className="focus-ring mt-4 inline-flex items-center gap-2 bg-cyan-100 px-4 py-2.5 text-sm font-black text-[#071A2B]"
        >
          <ExternalLink size={17} />
          Leer {activeDocument.kind.toLowerCase()}
        </a>
      </div>
    </article>
  );
}

function MediaDescription({
  icon,
  kind,
  title,
  description,
  duration,
  href,
  downloadLabel,
}: {
  icon: React.ReactNode;
  kind: string;
  title: string;
  description: string;
  duration: string;
  href: string;
  downloadLabel: string;
}) {
  return (
    <div className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase text-cyan-200">
        <span className="inline-flex items-center gap-2">{icon}{kind}</span>
        <span className="inline-flex items-center gap-2 text-slate-300"><Clock3 size={15} />{duration}</span>
      </div>
      <h3 className="mt-3 text-xl font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
      <DownloadButton href={href} label={downloadLabel} />
    </div>
  );
}

function DownloadButton({ href, label, primary = false }: { href: string; label: string; primary?: boolean }) {
  return (
    <a
      href={href}
      download
      className={`focus-ring mt-4 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold ${
        primary ? "bg-cyan-100 text-[#071A2B]" : "border border-white/20 bg-white/10 text-white"
      }`}
    >
      <Download size={17} />
      {label}
    </a>
  );
}

