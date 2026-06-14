"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Download, Expand, ImageIcon, X } from "lucide-react";
import { programInfographicAssets } from "@/lib/program-infographic-content";
import { getOptimizedImageSrc } from "@/lib/course-assets";

export function ProgramInfographicGallery() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <>
      <section className="overflow-hidden border border-slate-700 bg-[#071A2B] shadow-card">
        <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 text-white lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center border border-cyan-200/20 bg-cyan-100/10 text-cyan-100">
              <ImageIcon size={20} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase text-cyan-200">Infografía general</p>
              <h2 className="mt-1 text-xl font-black">Mapa visual del programa</h2>
              <p className="mt-1 text-sm text-slate-300">
                Fundamentos, metodología, ruta de módulos y resultado formativo.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="focus-ring inline-flex items-center gap-2 border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15"
            >
              <Expand size={17} />
              Ampliar
            </button>
            <DownloadLink href={programInfographicAssets.horizontal} label="Horizontal" />
            <DownloadLink href={programInfographicAssets.vertical} label="Vertical" />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="focus-ring block w-full cursor-zoom-in bg-[#071A2B] text-left"
          aria-label="Ampliar infografía general del programa"
        >
          <Image
            src={getOptimizedImageSrc(programInfographicAssets.horizontal)}
            alt="Infografía general del programa de inteligencia artificial aplicada a la educación con NotebookLM"
            width={2400}
            height={1350}
            className="h-auto w-full"
            priority
          />
        </button>
      </section>

      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Infografía general ampliada"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setIsOpen(false);
          }}
        >
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="focus-ring absolute right-4 top-4 z-10 flex size-11 items-center justify-center border border-white/20 bg-slate-900 text-white transition hover:bg-slate-800"
            aria-label="Cerrar infografía ampliada"
          >
            <X size={22} />
          </button>
          <div className="max-h-full w-full max-w-[1600px] overflow-auto border border-white/15 bg-[#071A2B] shadow-2xl">
            <Image
              src={getOptimizedImageSrc(programInfographicAssets.horizontal)}
              alt="Infografía general ampliada del programa"
              width={2400}
              height={1350}
              className="h-auto min-w-[900px] w-full"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

function DownloadLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      download
      className="focus-ring inline-flex items-center gap-2 bg-cyan-100 px-4 py-2 text-sm font-black text-[#071A2B] transition hover:bg-white"
    >
      <Download size={17} />
      {label}
    </a>
  );
}

