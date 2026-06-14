"use client";

import { useEffect, useState } from "react";
import { Expand, X } from "lucide-react";
import type { ModuleImage } from "@/lib/course";
import { getOptimizedImageSrc } from "@/lib/course-assets";

export function ModuleImageFrame({
  image,
  className = "h-44",
  zoomable = false,
}: {
  image: ModuleImage;
  className?: string;
  zoomable?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [expanded]);

  const imageContent = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={getOptimizedImageSrc(image.src)}
        alt={image.alt}
        className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
        loading="lazy"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-70 transition group-hover:opacity-90" />
      {zoomable ? (
        <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 text-xs font-black text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
          <Expand size={15} />
          Ampliar imagen
        </span>
      ) : null}
      <figcaption className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
        {image.credit}
      </figcaption>
    </>
  );

  return (
    <>
      <figure className={`group relative overflow-hidden bg-slate-900 ${className}`}>
        {zoomable ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label={`Ampliar ${image.alt}`}
            className="h-full w-full cursor-zoom-in text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
          >
            {imageContent}
          </button>
        ) : (
          imageContent
        )}
      </figure>

      {expanded ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${image.alt} ampliada`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 p-4 sm:p-8"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setExpanded(false);
          }}
        >
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-slate-900 text-white"
            aria-label="Cerrar imagen ampliada"
          >
            <X size={22} />
          </button>
          <div className="max-h-full max-w-[1500px] overflow-auto rounded-2xl border border-white/15 bg-black shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getOptimizedImageSrc(image.src)}
              alt={image.alt}
              className="h-auto max-h-[88vh] w-auto max-w-full object-contain"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

