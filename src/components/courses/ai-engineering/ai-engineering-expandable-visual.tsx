"use client";

import Image from "next/image";
import { Expand, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type AiEngineeringExpandableVisualProps = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
};

export function AiEngineeringExpandableVisual({
  id,
  src,
  alt,
  width,
  height,
}: AiEngineeringExpandableVisualProps) {
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
      <figure
        id={id}
        className="my-8 scroll-mt-44 overflow-hidden rounded-3xl border border-[#0f766e]/20 bg-white shadow-[0_16px_45px_rgba(11,31,51,0.08)] sm:scroll-mt-28"
      >
        <button
          ref={openerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Ampliar visual pedagógico: ${alt}`}
          className="focus-ring group block w-full text-left"
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes="(max-width: 1024px) 100vw, 960px"
            className="h-auto w-full object-contain"
          />
          <span className="flex items-center justify-center gap-2 border-t border-[#0f766e]/15 bg-[#f3f7f6] px-4 py-3 text-sm font-black text-[#0f766e] transition group-hover:bg-[#dff3ef] motion-reduce:transition-none">
            <Expand size={18} aria-hidden="true" />
            Ampliar visual
          </span>
        </button>
      </figure>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Visual pedagógico ampliado"
          onKeyDown={handleDialogKeyDown}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
          className="fixed inset-0 z-[100] flex bg-slate-950/95 p-2 sm:p-6"
        >
          <div className="relative mx-auto flex h-full w-full max-w-[1600px] flex-col">
            <div className="mb-2 flex shrink-0 justify-end sm:mb-3">
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setOpen(false)}
                className="focus-ring inline-flex items-center gap-2 rounded-xl bg-[#5eead4] px-4 py-2.5 text-sm font-black text-[#0b1f33]"
              >
                <X size={18} aria-hidden="true" />
                Cerrar
              </button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto rounded-xl bg-slate-900">
              <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                sizes="100vw"
                className="h-auto max-h-full w-auto max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
