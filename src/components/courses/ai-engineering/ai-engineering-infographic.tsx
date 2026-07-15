"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Download, Expand, X } from "lucide-react";

type AiEngineeringInfographicProps = {
  src: string;
  alt: string;
};

export function AiEngineeringInfographic({ src, alt }: AiEngineeringInfographicProps) {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const opener = openerRef.current;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      opener?.focus();
    };
  }, [open]);

  function handleDialogKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
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

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-center">
        <button
          ref={openerRef}
          type="button"
          onClick={() => setOpen(true)}
          className="focus-ring group relative mx-auto aspect-[1055/1491] w-full max-w-sm overflow-hidden rounded-2xl border border-[#0f766e]/25 bg-[#0b1f33] shadow-xl"
          aria-label="Ampliar infografía a pantalla completa"
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 640px) 88vw, 384px"
            className="object-contain"
          />
          <span className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b1f33]/95 px-4 py-3 text-sm font-black text-white transition group-hover:bg-[#0f766e] motion-reduce:transition-none">
            <Expand size={18} />
            Ver a pantalla completa
          </span>
        </button>

        <div>
          <p className="text-sm leading-7 text-slate-600">
            La imagen puede abrirse en pantalla completa, recorrerse con el teclado y descargarse en su resolución original.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="focus-ring inline-flex items-center gap-2 rounded-xl bg-[#0f766e] px-4 py-3 text-sm font-black text-white hover:bg-[#0b5f59]"
            >
              <Expand size={18} />
              Ampliar
            </button>
            <a
              href={src}
              download
              className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              <Download size={18} />
              Descargar PNG
            </a>
          </div>
        </div>
      </div>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Infografía ampliada"
          onKeyDown={handleDialogKeyDown}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
          className="fixed inset-0 z-[100] flex bg-slate-950/95 p-3 sm:p-6"
        >
          <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col">
            <div className="mb-3 flex justify-end gap-2">
              <a
                href={src}
                download
                className="focus-ring inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-900"
              >
                <Download size={18} />
                Descargar
              </a>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setOpen(false)}
                className="focus-ring inline-flex items-center gap-2 rounded-xl bg-[#5eead4] px-4 py-2 text-sm font-black text-[#0b1f33]"
              >
                <X size={18} />
                Cerrar
              </button>
            </div>
            <div className="relative min-h-0 flex-1 overflow-auto rounded-xl bg-slate-900">
              <Image
                src={src}
                alt={alt}
                width={1055}
                height={1491}
                priority
                className="mx-auto h-auto w-full max-w-[1055px]"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
