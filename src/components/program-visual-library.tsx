"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { BookOpenCheck, Download, Expand, ExternalLink, FileSliders, Images, X } from "lucide-react";
import { programVisualResources } from "@/lib/program-visual-resources";
import { getOptimizedImageSrc } from "@/lib/course-assets";
import { DeferredDocument } from "./deferred-media";

type VisualResource =
  | (typeof programVisualResources.infographics)[number]
  | (typeof programVisualResources.conceptMaps)[number];
type DocumentResource = (typeof programVisualResources.documents)[number];

export function ProgramVisualLibrary() {
  const [selected, setSelected] = useState<VisualResource | null>(null);
  const [activeDocumentId, setActiveDocumentId] = useState<DocumentResource["id"]>(
    programVisualResources.documents[0].id,
  );
  const activeDocument =
    programVisualResources.documents.find((document) => document.id === activeDocumentId) ??
    programVisualResources.documents[0];

  useEffect(() => {
    if (!selected) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selected]);

  return (
    <>
      <section className="overflow-hidden border border-slate-700 bg-[#071A2B] text-white shadow-card">
        <header className="border-b border-white/10 px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center border border-cyan-200/20 bg-cyan-100/10 text-cyan-100">
              <Images size={22} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase text-cyan-200">Biblioteca visual del programa</p>
              <h2 className="mt-1 text-2xl font-black">Infografías y presentación académica</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                Materiales creados con NotebookLM a partir del programa completo para comprender su
                estructura desde distintas perspectivas.
              </p>
            </div>
          </div>
        </header>

        <div className="grid border-b border-white/10 lg:grid-cols-2">
          {programVisualResources.infographics.map((resource, index) => (
            <article
              key={resource.id}
              className={index === 0 ? "border-b border-white/10 lg:border-b-0 lg:border-r" : ""}
            >
              <button
                type="button"
                onClick={() => setSelected(resource)}
                className="focus-ring group block w-full cursor-zoom-in overflow-hidden bg-slate-950 text-left"
                aria-label={`Ampliar ${resource.title}`}
              >
                <Image
                  src={getOptimizedImageSrc(resource.src)}
                  alt={resource.alt}
                  width={resource.width}
                  height={resource.height}
                  className="aspect-video h-auto w-full object-cover transition duration-300 group-hover:scale-[1.015] group-hover:opacity-95"
                />
              </button>
              <div className="p-5 sm:p-6">
                <h3 className="text-xl font-black">{resource.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{resource.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelected(resource)}
                    className="focus-ring inline-flex items-center gap-2 border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold transition hover:bg-white/15"
                  >
                    <Expand size={17} />
                    Ampliar
                  </button>
                  <a
                    href={resource.src}
                    download
                    className="focus-ring inline-flex items-center gap-2 bg-cyan-100 px-4 py-2.5 text-sm font-black text-[#071A2B] transition hover:bg-white"
                  >
                    <Download size={17} />
                    Descargar
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {programVisualResources.conceptMaps.map((resource) => (
          <article key={resource.id} className="grid border-b border-white/10 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.7fr)]">
            <button
              type="button"
              onClick={() => setSelected(resource)}
              className="focus-ring group block w-full cursor-zoom-in overflow-hidden bg-slate-950 text-left"
              aria-label={`Ampliar ${resource.title}`}
            >
              <Image
                src={getOptimizedImageSrc(resource.src)}
                alt={resource.alt}
                width={resource.width}
                height={resource.height}
                className="aspect-video h-auto w-full object-cover transition duration-300 group-hover:scale-[1.015] group-hover:opacity-95"
              />
            </button>
            <div className="flex flex-col justify-center border-t border-white/10 p-5 sm:p-6 lg:border-l lg:border-t-0">
              <p className="text-xs font-bold uppercase text-cyan-200">Mapa conceptual complementario</p>
              <h3 className="mt-2 text-xl font-black">{resource.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{resource.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelected(resource)}
                  className="focus-ring inline-flex items-center gap-2 border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold transition hover:bg-white/15"
                >
                  <Expand size={17} />
                  Ampliar
                </button>
                <a
                  href={resource.src}
                  download
                  className="focus-ring inline-flex items-center gap-2 bg-cyan-100 px-4 py-2.5 text-sm font-black text-[#071A2B] transition hover:bg-white"
                >
                  <Download size={17} />
                  Descargar
                </a>
              </div>
            </div>
          </article>
        ))}

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
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  {activeDocument.description}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={activeDocument.src}
                target="_blank"
                rel="noreferrer"
                className="focus-ring inline-flex items-center gap-2 border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold transition hover:bg-white/15"
              >
                <ExternalLink size={17} />
                Abrir documento
              </a>
              <a
                href={activeDocument.src}
                download
                className="focus-ring inline-flex items-center gap-2 bg-cyan-100 px-4 py-2.5 text-sm font-black text-[#071A2B] transition hover:bg-white"
              >
                <Download size={17} />
                Descargar PDF
              </a>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 border-b border-white/10 bg-slate-950/60 px-5 py-3 sm:px-6">
            {programVisualResources.documents.map((document) => {
              const isActive = document.id === activeDocument.id;

              return (
                <button
                  key={document.id}
                  type="button"
                  onClick={() => setActiveDocumentId(document.id)}
                  className={`focus-ring px-4 py-2 text-sm font-bold transition ${
                    isActive
                      ? "bg-cyan-100 text-[#071A2B]"
                      : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                  }`}
                  aria-pressed={isActive}
                >
                  {document.kind}
                </button>
              );
            })}
          </div>
          <DeferredDocument
            key={activeDocument.id}
            src={activeDocument.src}
            title={activeDocument.title}
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
      </section>

      {selected ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${selected.title} ampliada`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setSelected(null);
          }}
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="focus-ring absolute right-4 top-4 z-10 flex size-11 items-center justify-center border border-white/20 bg-slate-900 text-white transition hover:bg-slate-800"
            aria-label="Cerrar infografía ampliada"
          >
            <X size={22} />
          </button>
          <div className="max-h-full w-full max-w-[1700px] overflow-auto border border-white/15 bg-[#071A2B] shadow-2xl">
            <Image
              src={getOptimizedImageSrc(selected.src)}
              alt={selected.alt}
              width={selected.width}
              height={selected.height}
              className="h-auto min-w-[1000px] w-full"
              priority
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

