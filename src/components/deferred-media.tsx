"use client";

import { useState } from "react";
import { FileText, Headphones, PlayCircle } from "lucide-react";
import {
  getOptimizedDocumentSrc,
  getOptimizedImageSrc,
  getOptimizedVideoSrc,
} from "@/lib/course-assets";

type MediaSourceProps = {
  src: string;
  title: string;
};

export function DeferredAudio({
  src,
  type,
  title,
}: MediaSourceProps & { type: string }) {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return (
      <audio className="w-full" controls autoPlay preload="metadata">
        <source src={src} type={type} />
        Tu navegador no puede reproducir este audio.
      </audio>
    );
  }

  return (
    <LoadButton
      label={`Reproducir ${title}`}
      text="Cargar y reproducir audio"
      icon={<Headphones size={20} />}
      onClick={() => setLoaded(true)}
    />
  );
}

export function DeferredVideo({
  src,
  type,
  poster,
  title,
}: MediaSourceProps & { type: string; poster: string }) {
  const [loaded, setLoaded] = useState(false);
  const videoSrc = getOptimizedVideoSrc(src);

  if (loaded) {
    return (
      <video
        className="h-full w-full object-contain"
        controls
        autoPlay
        preload="metadata"
        poster={poster}
      >
        <source src={videoSrc} type={type} />
        Tu navegador no puede reproducir este video.
      </video>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setLoaded(true)}
      aria-label={`Reproducir ${title}`}
      className="focus-ring group relative h-full w-full overflow-hidden bg-black text-white"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={getOptimizedImageSrc(poster)}
        alt=""
        loading="lazy"
        className="h-full w-full object-contain opacity-75"
      />
      <span className="absolute inset-0 bg-black/25" />
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <span className="flex size-16 items-center justify-center rounded-full bg-cyan-100 text-[#071A2B]">
          <PlayCircle size={34} />
        </span>
        <span className="font-black">Cargar y reproducir video</span>
      </span>
    </button>
  );
}

export function DeferredDocument({
  src,
  title,
  className = "hidden h-[680px] w-full bg-slate-100 sm:block lg:h-[780px]",
  placeholderClassName = "hidden min-h-64 items-center justify-center bg-slate-950/60 p-6 sm:flex",
}: MediaSourceProps & { className?: string; placeholderClassName?: string }) {
  const [loaded, setLoaded] = useState(false);
  const viewerSrc = getOptimizedDocumentSrc(src);

  if (loaded) {
    return <iframe src={`${viewerSrc}#view=FitH`} title={title} className={className} />;
  }

  return (
    <div className={placeholderClassName}>
      <LoadButton
        label={`Cargar ${title}`}
        text="Cargar visor PDF"
        icon={<FileText size={20} />}
        onClick={() => setLoaded(true)}
      />
    </div>
  );
}

function LoadButton({
  label,
  text,
  icon,
  onClick,
}: {
  label: string;
  text: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="focus-ring inline-flex w-full items-center justify-center gap-2 border border-white/20 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:bg-white/15"
    >
      {icon}
      {text}
    </button>
  );
}
